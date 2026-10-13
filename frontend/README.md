# Brothers Photography — Frontend (React + TypeScript + Tailwind)

## Setup

```bash
cd frontend
npm install
cp .env.example .env    # points the app at your backend; edit if it's not on 127.0.0.1:8000
npm run dev
```

The site runs at `http://localhost:5173/`. Make sure the FastAPI backend is running at the URL
in `.env` (`http://127.0.0.1:8000/api` by default) — see `../backend/README.md`.

## What's here

- **Home page** — cinematic hero slider, all photography services embedded directly on the page
  (no separate services page, per spec), gallery preview, why-choose-us, booking CTA. No prices
  anywhere — each service shows three highlight points instead.
- **Gallery** — unlimited photos, category filtering, lightbox, lazy-loaded images
- **Register / Login** — phone-number-based (no email required for customers), full-screen
  glassmorphism cards over a rotating 3D scene (Three.js/React Three Fiber) with Framer Motion
  entrance and tilt animations
- **Forgot Password** — full OTP flow: enter phone → enter OTP → set new password, with the
  same cinematic treatment. In development mode the OTP is also shown on-screen (clearly
  labeled) since no SMS provider is configured yet.
- **Owner login** (`/owner-login`) is separate from customer login; a customer account can never
  reach `/admin/*`
- **Booking flow** (`/book`, requires login) — 5 steps: service → calendar date → time slot →
  details → confirm, ending in a booking reference number. Clicking "Book this service" on the
  home page jumps straight in with that service pre-selected.
- **Owner dashboard** (`/admin/*`) — stats, booking management, slot/date blocking, services
  and gallery management, site contact-info editor, and a "Change Password" screen (the owner
  password is never hard-coded anywhere in the app)

## Design

Tailwind v4 (CSS-first config, see `src/index.css`) with a warm-black + antique-gold palette,
**Times New Roman throughout** per the brief, glassmorphism cards, and Framer Motion animations
site-wide.

## Build

```bash
npm run build
```

Outputs to `dist/` — deployable to any static host. Set `VITE_API_BASE_URL` to your production
API URL before building.
