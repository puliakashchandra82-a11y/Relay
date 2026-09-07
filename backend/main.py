import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from database import init_db, get_conn
from email_utils import send_booking_confirmation

SECRET = "relay-dev-secret-change-me"
ALGO = "HS256"

app = FastAPI(title="Relay API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---------- schemas ----------
class RegisterIn(BaseModel):
    full_name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class BookingIn(BaseModel):
    class_id: int


class ProviderIn(BaseModel):
    name: str
    type_id: int
    location_id: int
    description: str = ""


class ContactIn(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str


class ClassIn(BaseModel):
    provider_id: int
    name: str
    date: str
    time: str
    duration: int = 60
    capacity: int = 10
    price: float = 0


# ---------- auth helpers ----------
def make_token(user):
    payload = {
        "sub": str(user["id"]),
        "role": user["role"],
        "name": user["full_name"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)


def current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    payload["sub"] = int(payload["sub"])
    return payload


def require_admin(user=Depends(current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    return user


# ---------- auth routes ----------
@app.post("/api/auth/register")
def register(body: RegisterIn):
    with get_conn() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE email=?", (body.email,))
        if c.fetchone():
            raise HTTPException(400, "Email already registered")
        pw_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
        role = "admin" if c.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0 else "member"
        c.execute(
            "INSERT INTO users (full_name, email, password_hash, role) VALUES (?,?,?,?)",
            (body.full_name, body.email, pw_hash, role),
        )
        conn.commit()
        user = dict(c.execute("SELECT * FROM users WHERE email=?", (body.email,)).fetchone())
    return {"token": make_token(user), "user": {"id": user["id"], "full_name": user["full_name"], "role": user["role"]}}


@app.post("/api/auth/login")
def login(body: LoginIn):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email=?", (body.email,)).fetchone()
        if not row or not bcrypt.checkpw(body.password.encode(), row["password_hash"].encode()):
            raise HTTPException(401, "Invalid email or password")
        user = dict(row)
    return {"token": make_token(user), "user": {"id": user["id"], "full_name": user["full_name"], "role": user["role"]}}


# ---------- catalog routes ----------
@app.get("/api/types")
def list_types():
    with get_conn() as conn:
        return [dict(r) for r in conn.execute("SELECT * FROM appointment_types")]


@app.get("/api/locations")
def list_locations():
    with get_conn() as conn:
        return [dict(r) for r in conn.execute("SELECT * FROM locations")]


@app.get("/api/providers")
def list_providers(type_id: Optional[int] = None, location_id: Optional[int] = None, q: Optional[str] = None):
    with get_conn() as conn:
        query = """
            SELECT p.*, t.name as type_name, t.icon as type_icon, t.color as type_color,
                   l.name as location_name
            FROM providers p
            LEFT JOIN appointment_types t ON p.type_id = t.id
            LEFT JOIN locations l ON p.location_id = l.id
            WHERE 1=1
        """
        params = []
        if type_id:
            query += " AND p.type_id=?"
            params.append(type_id)
        if location_id:
            query += " AND p.location_id=?"
            params.append(location_id)
        if q:
            query += " AND p.name LIKE ?"
            params.append(f"%{q}%")
        query += " ORDER BY p.rating DESC"
        return [dict(r) for r in conn.execute(query, params)]


@app.get("/api/providers/{provider_id}")
def get_provider(provider_id: int):
    with get_conn() as conn:
        row = conn.execute(
            """SELECT p.*, t.name as type_name, l.name as location_name, l.address as location_address
               FROM providers p
               LEFT JOIN appointment_types t ON p.type_id=t.id
               LEFT JOIN locations l ON p.location_id=l.id
               WHERE p.id=?""",
            (provider_id,),
        ).fetchone()
        if not row:
            raise HTTPException(404, "Not found")
        classes = [dict(r) for r in conn.execute(
            "SELECT * FROM classes WHERE provider_id=? ORDER BY date, time", (provider_id,)
        )]
    return {**dict(row), "classes": classes}


# ---------- bookings ----------
@app.post("/api/bookings")
def create_booking(body: BookingIn, background_tasks: BackgroundTasks, user=Depends(current_user)):
    with get_conn() as conn:
        cls = conn.execute("SELECT * FROM classes WHERE id=?", (body.class_id,)).fetchone()
        if not cls:
            raise HTTPException(404, "Class not found")
        count = conn.execute(
            "SELECT COUNT(*) c FROM bookings WHERE class_id=? AND status='confirmed'", (body.class_id,)
        ).fetchone()["c"]
        if count >= cls["capacity"]:
            raise HTTPException(400, "Class is full")
        conn.execute(
            "INSERT INTO bookings (user_id, class_id, status) VALUES (?,?, 'confirmed')",
            (user["sub"], body.class_id),
        )
        conn.commit()

        row = conn.execute(
            """SELECT u.email, u.full_name, c.name as class_name, c.date, c.time, c.price,
                      p.name as provider_name, l.name as location_name
               FROM users u, classes c
               LEFT JOIN providers p ON c.provider_id = p.id
               LEFT JOIN locations l ON p.location_id = l.id
               WHERE u.id = ? AND c.id = ?""",
            (user["sub"], body.class_id),
        ).fetchone()

    if row:
        background_tasks.add_task(
            send_booking_confirmation,
            row["email"],
            row["full_name"],
            row["class_name"],
            row["provider_name"],
            row["date"],
            row["time"],
            row["price"],
            row["location_name"],
        )
    return {"ok": True}


@app.get("/api/bookings/me")
def my_bookings(user=Depends(current_user)):
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT b.id as booking_id, b.status, c.name as class_name, c.date, c.time, c.price,
                      p.name as provider_name, l.name as location_name
               FROM bookings b
               JOIN classes c ON b.class_id = c.id
               JOIN providers p ON c.provider_id = p.id
               LEFT JOIN locations l ON p.location_id = l.id
               WHERE b.user_id=?
               ORDER BY c.date, c.time""",
            (user["sub"],),
        ).fetchall()
    return [dict(r) for r in rows]


@app.delete("/api/bookings/{booking_id}")
def cancel_booking(booking_id: int, user=Depends(current_user)):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
        if not row or row["user_id"] != user["sub"]:
            raise HTTPException(404, "Not found")
        conn.execute("UPDATE bookings SET status='cancelled' WHERE id=?", (booking_id,))
        conn.commit()
    return {"ok": True}


# ---------- favorites ----------
@app.post("/api/favorites/{provider_id}")
def toggle_favorite(provider_id: int, user=Depends(current_user)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM favorites WHERE user_id=? AND provider_id=?", (user["sub"], provider_id)
        ).fetchone()
        if row:
            conn.execute("DELETE FROM favorites WHERE id=?", (row["id"],))
            conn.commit()
            return {"favorited": False}
        conn.execute("INSERT INTO favorites (user_id, provider_id) VALUES (?,?)", (user["sub"], provider_id))
        conn.commit()
        return {"favorited": True}


@app.get("/api/favorites/me")
def my_favorites(user=Depends(current_user)):
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT p.*, t.name as type_name, l.name as location_name
               FROM favorites f
               JOIN providers p ON f.provider_id = p.id
               LEFT JOIN appointment_types t ON p.type_id=t.id
               LEFT JOIN locations l ON p.location_id=l.id
               WHERE f.user_id=?""",
            (user["sub"],),
        ).fetchall()
    return [dict(r) for r in rows]


# ---------- contact / help ----------
@app.post("/api/contact")
def submit_contact(body: ContactIn):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)",
            (body.name, body.email, body.subject, body.message),
        )
        conn.commit()
    return {"ok": True}


@app.get("/api/admin/messages")
def admin_list_messages(user=Depends(require_admin)):
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM contact_messages ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


@app.post("/api/admin/messages/{message_id}/resolve")
def admin_resolve_message(message_id: int, user=Depends(require_admin)):
    with get_conn() as conn:
        conn.execute("UPDATE contact_messages SET status='resolved' WHERE id=?", (message_id,))
        conn.commit()
    return {"ok": True}


# ---------- admin ----------
@app.get("/api/admin/bookings")
def admin_all_bookings(user=Depends(require_admin)):
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT b.id, b.status, u.full_name, u.email, c.name as class_name, c.date, c.time,
                      p.name as provider_name
               FROM bookings b
               JOIN users u ON b.user_id = u.id
               JOIN classes c ON b.class_id = c.id
               JOIN providers p ON c.provider_id = p.id
               ORDER BY c.date DESC"""
        ).fetchall()
    return [dict(r) for r in rows]


@app.get("/api/admin/stats")
def admin_stats(user=Depends(require_admin)):
    with get_conn() as conn:
        users = conn.execute("SELECT COUNT(*) c FROM users").fetchone()["c"]
        providers = conn.execute("SELECT COUNT(*) c FROM providers").fetchone()["c"]
        bookings = conn.execute("SELECT COUNT(*) c FROM bookings WHERE status='confirmed'").fetchone()["c"]
        revenue = conn.execute(
            """SELECT COALESCE(SUM(c.price),0) r FROM bookings b JOIN classes c ON b.class_id=c.id
               WHERE b.status='confirmed'"""
        ).fetchone()["r"]
    return {"users": users, "providers": providers, "bookings": bookings, "revenue": revenue}


@app.post("/api/admin/providers")
def admin_create_provider(body: ProviderIn, user=Depends(require_admin)):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO providers (name, type_id, location_id, description, rating, review_count) VALUES (?,?,?,?,4.5,0)",
            (body.name, body.type_id, body.location_id, body.description),
        )
        conn.commit()
    return {"ok": True}


@app.post("/api/admin/classes")
def admin_create_class(body: ClassIn, user=Depends(require_admin)):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO classes (provider_id, name, date, time, duration, capacity, price) VALUES (?,?,?,?,?,?,?)",
            (body.provider_id, body.name, body.date, body.time, body.duration, body.capacity, body.price),
        )
        conn.commit()
    return {"ok": True}


@app.get("/api/me")
def get_me(user=Depends(current_user)):
    with get_conn() as conn:
        row = conn.execute("SELECT id, full_name, email, role FROM users WHERE id=?", (user["sub"],)).fetchone()
    return dict(row)
