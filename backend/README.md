# Brothers Photography — Backend (FastAPI)

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # edit values if needed

python -m app.seed              # creates the owner account, services, demo gallery, site settings
uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://127.0.0.1:8000/`. Interactive docs (Swagger UI) are at
`http://127.0.0.1:8000/docs`.

**Demo owner login** (created by the seed script):
`owner@brothersphotography.com` / `OwnerPass123` — **change this immediately** via the
"Change Password" screen in the owner dashboard once you log in. The password is never
hard-coded anywhere else in the app; the seed value is only a first-run bootstrap.

## Database

SQLite is used by default (`db.sqlite3`, created automatically) so the project runs with zero
extra setup. For production, point `DATABASE_URL` in `.env` at PostgreSQL instead:

```
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/brothers_photography
```

Install `psycopg2-binary` is already in `requirements.txt`, so no extra install is needed —
just change the URL and re-run the app (tables are created automatically on startup).

## OTP / SMS

Forgot-password uses a real OTP flow (6-digit code, expires after `OTP_EXPIRE_MINUTES`, hashed
in the database, never hard-coded). No SMS provider is wired up yet, since none was supplied:
- In `DEBUG=True` mode, the generated OTP is logged to the server console **and** returned in the
  API response as `dev_otp`, so the flow is fully testable without a real phone.
- To go live, edit `app/utils/otp_service.py` — `send_otp()` is the single function to replace
  with a real provider call (Twilio, MSG91, AWS SNS, etc.). Nothing else in the app needs to
  change.
- Set `DEBUG=False` in production so `dev_otp` is never included in responses.

## Key endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register/` | POST | – | Customer sign up (full name, phone, password) |
| `/api/auth/login/` | POST | – | Login by phone (customer) or email (owner) |
| `/api/auth/logout/` | POST | Bearer | Client discards the token (stateless JWT) |
| `/api/auth/profile/` | GET | Bearer | Current user's profile |
| `/api/auth/change-password/` | POST | Bearer | Change your own password |
| `/api/auth/forgot-password/request-otp/` | POST | – | Send OTP to a phone number |
| `/api/auth/forgot-password/verify-otp/` | POST | – | Verify OTP, get a short-lived reset token |
| `/api/auth/forgot-password/reset/` | POST | – | Set a new password using the reset token |
| `/api/services/` | GET | – | Active services (public), no prices |
| `/api/services/all/` | GET | owner | All services including inactive, for the dashboard |
| `/api/services/` | POST/PATCH/DELETE | owner | Manage services (multipart form, supports image upload) |
| `/api/gallery/?category=wedding&limit=20` | GET | – | Gallery photos — no artificial cap |
| `/api/availability/?date=YYYY-MM-DD` | GET | – | Slot availability for a date |
| `/api/bookings/` | GET/POST | Bearer | Customer's own bookings / create booking |
| `/api/admin/dashboard-stats/` | GET | owner | Booking counts for the dashboard |
| `/api/admin/bookings/` | GET/PATCH | owner | All bookings, update status |
| `/api/admin/blocked-slots/` | GET/POST/DELETE | owner | Block dates/times |
| `/api/site-settings/` | GET/PATCH | owner to edit | About Us content, phone/WhatsApp/address, logo |

Authenticated requests use `Authorization: Bearer <token>` (JWT, 7-day expiry by default).

## Notes

- Passwords are hashed with `bcrypt` directly (not via `passlib`, which has a known
  incompatibility with recent `bcrypt` releases).
- Slot double-booking is prevented both in application logic (friendly error message) **and**
  at the database level via a unique constraint, so it's safe under concurrent requests — a
  cancelled booking correctly frees its slot for re-booking (tested).
- Uncaught server errors are converted to a generic `"Something went wrong. Please try again."`
  message — real tracebacks are only logged server-side, never sent to the client.
- Uploaded images are stored under `backend/media/`; gallery/service demo images use
  `picsum.photos` placeholders until real photos are uploaded.
