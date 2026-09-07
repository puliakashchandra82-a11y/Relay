# Relay — Book Anything, Anywhere

Full booking platform: React (Vite + Tailwind) frontend + FastAPI (Python) backend + SQLite.

## Structure
- `backend/` — FastAPI REST API (auth with JWT, providers, classes, bookings, favorites, admin stats)
- `frontend/` — React app (dark navy/indigo UI, sidebar nav, hero banner, category browse, provider cards, booking flow, admin dashboard)

## Run the backend
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi "uvicorn[standard]" python-multipart pyjwt bcrypt python-dotenv
uvicorn main:app --reload --port 8000
```
API runs at http://localhost:8000 (docs at /docs). First registered user automatically becomes admin.

### Email notifications (optional)
Booking confirmations are emailed to the user via Gmail SMTP. To enable it:
```
cp backend/.env.example backend/.env
```
Fill in `SMTP_EMAIL` with your Gmail address and `SMTP_PASSWORD` with a Gmail **App Password** (not your normal password) — generate one at https://myaccount.google.com/apppasswords. Without a `.env`, bookings still work fine; the email step is just skipped (logged to the console).

## Run the frontend
```
cd frontend
npm install
npm run dev
```
Opens at http://localhost:5173 — talks to the backend at localhost:8000 (see `src/api.js` if you need to change the URL).

## Notes
- SQLite file `backend/relay.db` is created and seeded automatically on first run (6 categories, 6 locations, 6 providers, sample time slots).
- Delete `relay.db` any time to reset to seed data.
