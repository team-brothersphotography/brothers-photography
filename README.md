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


#=================================================================


# Brothers Photography

A full-stack photography booking platform designed to help customers explore photography services, browse galleries, and manage bookings, while providing the studio owner with a dedicated dashboard to manage booking requests.

## Features

- **Customer Authentication:** Register and log in using account credentials.
- **Photography Services:** Browse available photography services.
- **Photo Gallery:** Explore photography images organized for the website.
- **Booking Management:** Submit booking requests and view booking information.
- **Owner Dashboard:** Review booking requests and accept or reject them.
- **Site Settings:** Manage website settings through the backend.
- **REST API:** FastAPI backend with interactive API documentation.
- **Database Support:** SQLite for local development, with PostgreSQL support available through configuration.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- PostgreSQL driver
- JWT authentication
- bcrypt
- Pillow

## Project Structure

```text
brothers-photography/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── seed.py
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── core/
│   │   └── utils/
│   ├── .env.example
│   ├── requirements.txt
│   └── db.sqlite3          # Created during local development
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

*Note: The structure above illustrates the main project areas. Individual folders and files may vary slightly in the actual repository.*

## Prerequisites

Install the following before starting:

- Python 3.10 or a compatible version supported by the project dependencies.
- Node.js and npm.
- Git.
- Visual Studio Code (recommended).

Verify your installations:

```powershell
python --version
node --version
npm --version
git --version
```

## Getting Started

Follow these steps to run the project locally on Windows using PowerShell in VS Code.

### 1. Clone the Repository

If you have not already cloned the repository:

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL
cd brothers-photography
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual repository URL.

If the project folder already exists on your computer, open that folder in VS Code and skip this step.

### 2. Set Up the Backend

Open a terminal in VS Code and navigate to the project root.

```powershell
cd backend
```

#### Create a Python Virtual Environment

```powershell
python -m venv venv
```

#### Activate the Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

After activation, your terminal should look similar to:

```text
(venv) PS C:\...\brothers-photography\backend>
```

If PowerShell blocks activation, you can temporarily allow scripts for the current terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

#### Install Backend Dependencies

Upgrade pip:

```powershell
python -m pip install --upgrade pip
```

Install the project dependencies:

```powershell
pip install -r requirements.txt
```

### 3. Configure Backend Environment Variables

Ensure you are inside the `backend/` directory.

Copy the example environment file:

```powershell
copy .env.example .env
```

The `.env` file contains configuration values used by the backend, such as the database URL, JWT secret key, debug settings, and owner account configuration.

For initial local development, the project can use SQLite if the configured database URL selects SQLite.

The default SQLite database path is:

```text
backend/db.sqlite3
```

**Important:** Review `backend/.env` before running the application. Replace default or placeholder secrets with appropriate local development values. Never commit the actual `.env` file or real credentials to GitHub.

Do not configure PostgreSQL for local development unless your environment or project configuration requires it.

### 4. Seed the Database

While still inside `backend/`, run:

```powershell
python -m app.seed
```

The seed script is intended to initialize the project's initial data, including:

- Owner account
- Photography services
- Demo gallery
- Site settings

Follow the terminal output to confirm whether seeding completed successfully.

Run this step only after reviewing the seed configuration and confirming the intended database. Do not assume it is safe to rerun against an existing production database.

### 5. Start the Backend Server

Still inside `backend/`, run:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

When the server starts successfully, the terminal should display a message similar to:

```text
Uvicorn running on http://127.0.0.1:8000
```

Keep this terminal open while using the website.

#### Verify the Backend

Open these URLs in your browser:

- **API documentation:** http://127.0.0.1:8000/docs
- **Health check:** http://127.0.0.1:8000/api/health/

The health endpoint should return a response similar to:

```json
{
  "status": "ok"
}
```

If the health endpoint returns the expected response and the API documentation loads, the backend is responding.

### 6. Set Up the Frontend

Open a **second terminal** in VS Code. Keep the backend terminal running.

From the project root, navigate to the frontend:

```powershell
cd frontend
```

If your new terminal starts in the project root, the command above is sufficient. Otherwise, navigate to the correct project directory first.

#### Install Frontend Dependencies

```powershell
npm install
```

#### Configure Frontend Environment Variables

Copy the example environment file:

```powershell
copy .env.example .env
```

The example configuration contains:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

This points the frontend to your local FastAPI backend. Keep this URL for local development unless your configuration requires something different.

Never place private API keys, database passwords, or server-side secrets in variables prefixed with `VITE_`. Such variables can become accessible to browser-side code.

### 7. Start the Frontend

From inside `frontend/`, run:

```powershell
npm run dev
```

Vite will print the local development URL, typically:

```text
http://localhost:5173
```

Open the URL shown in your terminal to access Brothers Photography.

Keep both terminals running:

- **Terminal 1:** FastAPI backend on port `8000`.
- **Terminal 2:** Vite frontend on port `5173`.

## Authentication

The project provides separate customer and owner login interfaces.

- Customers can register and log in using the authentication methods implemented by the application.
- The owner account is initialized through the backend seed process and its environment configuration.
- Passwords should be stored as secure hashes, not plaintext.
- Password-reset and account-recovery functionality depends on the backend implementation and its configured delivery services.

**Current limitation:** Real SMS OTP delivery requires a configured SMS provider. If no provider is configured, an OTP may be generated and stored by the backend without being delivered to a mobile phone. Do not treat this as production-ready password recovery.

## Database

SQLite is suitable for local development because it does not require a separate database server.

The configured SQLite database is stored at:

```text
backend/db.sqlite3
```

The project also includes PostgreSQL support through its dependencies and configuration. PostgreSQL can be configured when preparing the application for a suitable deployment environment.

Before switching databases, review the database URL, schema creation or migration process, seed script, and deployment configuration.

## Common Issues

### Python or pip is not recognized

Verify that Python is installed and available on your system PATH.

```powershell
python --version
python -m pip --version
```

### Virtual environment activation fails

Run the following in PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

This changes the execution policy only for the current PowerShell process.

### Missing Python dependencies

Activate the virtual environment and reinstall the dependencies:

```powershell
python -m pip install -r requirements.txt
```

### Backend fails to start

Confirm that you are inside `backend/`, the virtual environment is active, the dependencies are installed, and the `.env` file is configured.

### Frontend cannot connect to the backend

Check that:

1. FastAPI is running on port `8000`.
2. `frontend/.env` contains the correct `VITE_API_BASE_URL`.
3. The frontend and backend CORS configuration allows local development.
4. Both servers are running without terminal errors.

After changing frontend environment variables, restart the Vite development server.

### Database or seeding errors

Check the database URL and confirm that the seed script is configured for the database you intend to initialize. Back up existing data before making database or schema changes.

## Security Notes

- Never commit `.env` files, credentials, private keys, database files containing real user data, or uploaded private media.
- Keep `.env.example` limited to variable names and safe placeholder values.
- Use a strong, unique JWT secret outside local development.
- Disable debug mode in production.
- Use HTTPS in production.
- Restrict access to owner-only endpoints on the backend.
- Apply appropriate authentication, authorization, rate limiting, and input validation.
- Configure and test a real password-recovery method before launching publicly.
- Do not use development credentials or seeded demo accounts in production.

## Development Workflow

When contributing changes:

1. Create a branch for your work.
2. Make focused changes.
3. Test the affected frontend and backend functionality.
4. Review your changes for exposed secrets or unintended files.
5. Commit and push the changes to GitHub.

## License

Add the applicable license and ownership information before distributing or reusing this project.

---

**Brothers Photography** — Capturing moments, creating memories.
