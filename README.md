# Brothers Photography

A full-stack photography portfolio and online booking platform: customers browse services and
a gallery, register with just a phone number, and book a shoot through a calendar/time-slot
flow; the studio owner gets a separate secure dashboard to manage bookings, availability,
services, gallery, and site contact info.

- **Frontend:** React 19 + TypeScript + Tailwind CSS (Vite), Framer Motion, Three.js/React
  Three Fiber for the cinematic auth screens — see `frontend/README.md`
- **Backend:** FastAPI + SQLAlchemy, JWT auth, SQLite by default (PostgreSQL-ready) — see
  `backend/README.md`

## Quick start

Open two terminals.

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`. Register as a customer with just a name, phone number, and
password, or log in as the studio owner at `/owner-login` with the demo account printed by
`python -m app.seed` (`owner@brothersphotography.com` / `OwnerPass123` — change this
immediately via the dashboard's "Change Password" screen).

API docs (Swagger) are at `http://127.0.0.1:8000/docs` once the backend is running.

## What's implemented

Matches the updated project brief section by section:

- **Home page** with all services integrated directly on it (no separate services page),
  cinematic hero slider, gallery preview, WhatsApp/call CTAs — each service shows 3 highlight
  points, **no prices anywhere** on the site
- **Gallery** with no fixed photo limit, category filtering, lightbox, lazy loading, seeded
  with 32 demo placeholder photos across all 8 categories (swap in real photos anytime via the
  owner dashboard)
- **Registration** — full name, phone number, password, confirm password (min. 8 characters),
  wrapped in a 3D-animated glassmorphism login/register experience (Three.js + Framer Motion)
- **Owner login** — fixed email identifier, but the **password is never hard-coded**: it's
  bcrypt-hashed in the database from first setup, and the owner can change it anytime from the
  dashboard
- **Forgot password / OTP recovery** — phone number → OTP (expiring, hashed, attempt-limited) →
  new password → login. No SMS provider is wired up yet (none was supplied), so OTPs are logged
  to the console and shown on-screen only in development mode — see `backend/README.md` for how
  to plug in a real SMS provider later
- **Booking flow** — service → calendar date (past dates blocked) → time picker (live
  availability) → details → confirmation with a reference number; double-booking is prevented
  at the database level, tested under a cancel-then-rebook scenario to confirm slots correctly
  free up
- **Owner dashboard** — booking stats, full booking management (accept/reject/complete),
  calendar/slot blocking, services and gallery management (add/edit/delete, no pricing fields),
  site contact-info editor, and password management
- **Visual design** — dark theme, gold accents, glassmorphism, Framer Motion animations
  throughout, **Times New Roman** typography site-wide as specified
- Friendly, non-technical error messages throughout (no raw server errors ever reach the browser)
- Fully responsive, mobile-first layout

## What you'll want to customize before going live

- Individual brother names, bios, and headshots — currently placeholders; the group photo you
  provided is already wired in as the site logo. Edit via the owner dashboard's "Contact Info"
  tab, no code changes needed
- Swap the demo `picsum.photos` gallery/service images for real photography via the admin
  dashboard
- Connect a real SMS provider for OTP delivery (see `backend/README.md`)
- Switch `DATABASE_URL` to PostgreSQL for production (already supported, see `backend/README.md`)
- Deploy behind a real ASGI server setup (e.g. `uvicorn` behind `nginx`, or `gunicorn -k
  uvicorn.workers.UvicornWorker`) with `DEBUG=False` and a strong `SECRET_KEY`
- Payment integration, if/when the business wants to collect payments online (not in scope here)
