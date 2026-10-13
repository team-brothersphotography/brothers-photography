import enum
import secrets
from datetime import datetime, timezone

from sqlalchemy import (
    JSON, Boolean, Column, Date, DateTime, Enum, ForeignKey, Integer,
    String, Text, Time, UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def now_utc():
    return datetime.now(timezone.utc)


class ServiceCategory(str, enum.Enum):
    wedding = "wedding"
    pre_wedding = "pre_wedding"
    home_ceremony = "home_ceremony"
    birthday = "birthday"
    naming_ceremony = "naming_ceremony"
    maternity = "maternity"
    modeling = "modeling"
    candid = "candid"


CATEGORY_LABELS = {
    ServiceCategory.wedding: "Wedding Photography",
    ServiceCategory.pre_wedding: "Pre-Wedding Photography",
    ServiceCategory.home_ceremony: "Home Ceremony",
    ServiceCategory.birthday: "Birthday Photography",
    ServiceCategory.naming_ceremony: "Naming Ceremony",
    ServiceCategory.maternity: "Maternity Photography",
    ServiceCategory.modeling: "Modeling Photography",
    ServiceCategory.candid: "Candid Photography",
}


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_owner = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    bookings = relationship("Booking", back_populates="customer")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(Enum(ServiceCategory), nullable=False)
    highlights = Column(JSON, default=list)  # up to 3 short descriptive points
    image_url = Column(String(500), nullable=True)  # uploaded file path or external demo URL
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    bookings = relationship("Booking", back_populates="service")


class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=True)
    category = Column(Enum(ServiceCategory), nullable=False)
    image_url = Column(String(500), nullable=False)  # uploaded file path or external demo URL
    is_featured = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), default=now_utc)


class BlockedSlot(Base):
    __tablename__ = "blocked_slots"
    __table_args__ = (UniqueConstraint("date", "time", name="uq_blocked_date_time"),)

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)  # NULL = whole day blocked
    reason = Column(String(200), nullable=True)


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint("event_date", "event_time", "active_marker", name="uq_active_slot"),
    )

    id = Column(Integer, primary_key=True, index=True)
    reference_number = Column(String(12), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)

    full_name = Column(String(150), nullable=False)
    phone_number = Column(String(20), nullable=False)
    event_location = Column(String(255), nullable=False)
    number_of_guests = Column(Integer, nullable=True)
    message = Column(Text, nullable=True)

    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=False)

    # Trick to get a "unique only while active" constraint that works on
    # both SQLite and Postgres: active bookings (pending/confirmed/
    # completed) always get active_marker = 0 (booking ids autoincrement
    # from 1, so 0 never collides with a real id), meaning two active
    # bookings can never share the same date+time+marker. Once a booking
    # is cancelled, active_marker is set to that booking's own id
    # (always unique), so it stops blocking the slot. Handled in the
    # booking create/update logic, not here.
    active_marker = Column(Integer, nullable=True)

    status = Column(Enum(BookingStatus), default=BookingStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    customer = relationship("User", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")

    @staticmethod
    def generate_reference() -> str:
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return "BP-" + "".join(secrets.choice(alphabet) for _ in range(8))


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, default=1)

    business_name = Column(String(150), default="Brothers Photography")
    tagline = Column(String(255), default="")
    intro_text = Column(Text, default="")

    brother_one_name = Column(String(100), default="")
    brother_one_role = Column(String(100), default="")
    brother_one_bio = Column(Text, default="")
    brother_one_photo = Column(String(500), nullable=True)

    brother_two_name = Column(String(100), default="")
    brother_two_role = Column(String(100), default="")
    brother_two_bio = Column(Text, default="")
    brother_two_photo = Column(String(500), nullable=True)

    phone_number = Column(String(20), default="")
    alternate_phone_number = Column(String(20), default="")
    whatsapp_number = Column(String(20), default="")
    email = Column(String(255), default="")
    address = Column(String(255), default="")
    google_maps_url = Column(String(500), default="")
    logo = Column(String(500), nullable=True)


class PasswordResetOTP(Base):
    """
    Stores a hashed, expiring OTP for the phone-based forgot-password flow.
    The OTP itself is never stored in plaintext or logged in production.
    """
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), index=True, nullable=False)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=now_utc)
