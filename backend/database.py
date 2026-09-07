import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta

DB_PATH = "relay.db"

APPOINTMENT_TYPES = [
    ("Fitness & Gym", "dumbbell", "#f97316"),
    ("Spa & Wellness", "sparkles", "#a855f7"),
    ("Hair & Beauty", "scissors", "#ec4899"),
    ("Medical & Health", "stethoscope", "#22c55e"),
    ("Career & Coaching", "briefcase", "#3b82f6"),
    ("Home Services", "wrench", "#eab308"),
]

LOCATIONS = [
    ("Downtown Studio", "123 Main St, City Center"),
    ("Northside Branch", "45 North Ave"),
    ("Westside Clinic", "78 West Blvd"),
    ("Eastgate Center", "12 East Gate Rd"),
    ("Riverside Wellness", "300 River Rd"),
    ("Uptown Hub", "500 Uptown Plaza"),
]

PROVIDERS = [
    ("Glow Spa & Wellness", 2, "Downtown Studio", 4.8, 214, "Premium spa treatments, massages & facials in a calm, modern setting."),
    ("FitZone Gym", 1, "Northside Branch", 4.6, 389, "Full equipment gym with personal training & group classes."),
    ("CareerBoost Coaching", 5, "Westside Clinic", 4.9, 97, "1:1 career coaching, resume reviews & mock interviews."),
    ("Bloom Hair Studio", 3, "Eastgate Center", 4.7, 162, "Modern cuts, color & styling by award-winning stylists."),
    ("Riverside Physiotherapy", 4, "Riverside Wellness", 4.9, 145, "Licensed physiotherapy & rehab sessions."),
    ("HandyFix Home Services", 6, "Uptown Hub", 4.5, 88, "Trusted home repair, cleaning & maintenance pros."),
]


def init_db():
    with get_conn() as conn:
        c = conn.cursor()
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'member',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS appointment_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                icon TEXT,
                color TEXT
            );
            CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT
            );
            CREATE TABLE IF NOT EXISTS providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type_id INTEGER,
                location_id INTEGER,
                rating REAL DEFAULT 4.5,
                review_count INTEGER DEFAULT 0,
                description TEXT,
                FOREIGN KEY(type_id) REFERENCES appointment_types(id),
                FOREIGN KEY(location_id) REFERENCES locations(id)
            );
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider_id INTEGER,
                name TEXT NOT NULL,
                date TEXT,
                time TEXT,
                duration INTEGER DEFAULT 60,
                capacity INTEGER DEFAULT 10,
                price REAL DEFAULT 0,
                FOREIGN KEY(provider_id) REFERENCES providers(id)
            );
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                class_id INTEGER,
                status TEXT DEFAULT 'confirmed',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(class_id) REFERENCES classes(id)
            );
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                provider_id INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(provider_id) REFERENCES providers(id)
            );
            """
        )
        conn.commit()

        c.execute("SELECT COUNT(*) FROM appointment_types")
        if c.fetchone()[0] == 0:
            c.executemany("INSERT INTO appointment_types (name, icon, color) VALUES (?,?,?)", APPOINTMENT_TYPES)
        c.execute("SELECT COUNT(*) FROM locations")
        if c.fetchone()[0] == 0:
            c.executemany("INSERT INTO locations (name, address) VALUES (?,?)", LOCATIONS)
        c.execute("SELECT COUNT(*) FROM providers")
        if c.fetchone()[0] == 0:
            for name, type_id, loc_name, rating, reviews, desc in PROVIDERS:
                c.execute("SELECT id FROM locations WHERE name=?", (loc_name,))
                loc_row = c.fetchone()
                loc_id = loc_row[0] if loc_row else 1
                c.execute(
                    "INSERT INTO providers (name, type_id, location_id, rating, review_count, description) VALUES (?,?,?,?,?,?)",
                    (name, type_id, loc_id, rating, reviews, desc),
                )
        conn.commit()

        c.execute("SELECT COUNT(*) FROM classes")
        if c.fetchone()[0] == 0:
            c.execute("SELECT id FROM providers")
            provider_ids = [r[0] for r in c.fetchall()]
            base = datetime.now()
            slot_names = ["Standard Session", "Group Class", "Premium Session", "Quick Consult"]
            prices = [25, 40, 65, 90]
            for pid in provider_ids:
                for i in range(4):
                    day = base + timedelta(days=i + 1)
                    c.execute(
                        "INSERT INTO classes (provider_id, name, date, time, duration, capacity, price) VALUES (?,?,?,?,?,?,?)",
                        (pid, slot_names[i], day.strftime("%Y-%m-%d"), f"{9 + i * 2}:00", 60, 10, prices[i]),
                    )
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
