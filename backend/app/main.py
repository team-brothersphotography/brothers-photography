import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.models import models  # noqa: F401 - ensures models are registered before create_all
from app.routers import admin, auth, bookings, gallery, services, site_settings

logger = logging.getLogger("brothers_photography")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Brothers Photography API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(gallery.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(site_settings.router)


@app.get("/api/health/")
def health():
    return {"status": "ok"}


# ---------- Friendly, non-technical error responses ----------
# Raw tracebacks / DB errors are logged server-side only; the client
# always gets a plain, user-friendly message.

@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    field = first.get("loc", [None])[-1]
    message = first.get("msg", "Please complete all required fields correctly.")
    message = message.replace("Value error, ", "")
    detail = {field: message} if field else {"detail": message}
    return JSONResponse(status_code=422, content=detail)


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s", request.url)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})
