import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


def _split_csv(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


class Settings:
    # Defaults to a local SQLite file so the project runs with zero extra setup.
    # For real deployment, set DATABASE_URL to a PostgreSQL DSN, e.g.:
    #   postgresql+psycopg2://user:password@localhost:5432/brothers_photography
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-to-a-random-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days
    RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "15"))
    OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
    JWT_ALGORITHM: str = "HS256"

    DEBUG: bool = os.getenv("DEBUG", "True") == "True"

    CORS_ORIGINS: list[str] = _split_csv(
        os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    )

    MEDIA_ROOT: Path = BASE_DIR / "media"
    MEDIA_URL: str = "/media"

    OWNER_EMAIL: str = os.getenv("OWNER_EMAIL", "owner@brothersphotography.com")
    OWNER_DEFAULT_PASSWORD: str = os.getenv("OWNER_DEFAULT_PASSWORD", "OwnerPass123")


settings = Settings()
settings.MEDIA_ROOT.mkdir(exist_ok=True)
