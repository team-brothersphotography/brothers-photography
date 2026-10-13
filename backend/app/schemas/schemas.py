from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.models import BookingStatus, CATEGORY_LABELS, ServiceCategory


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    phone_number: str = Field(min_length=7, max_length=20)
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit() or ch == "+")
        if len(digits) < 7:
            raise ValueError("Please enter a valid phone number.")
        return v.strip()

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseModel):
    identifier: str  # phone number (customers) or email (owner)
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    phone_number: str
    email: Optional[str] = None
    is_owner: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    token: str
    user: UserOut


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8, max_length=72)
    confirm_new_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match.")
        return self


class ForgotPasswordRequestOTP(BaseModel):
    phone_number: str


class ForgotPasswordVerifyOTP(BaseModel):
    phone_number: str
    otp: str = Field(min_length=6, max_length=6)


class ForgotPasswordReset(BaseModel):
    reset_token: str
    new_password: str = Field(min_length=8, max_length=72)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


# ---------- Services ----------

class ServiceBase(BaseModel):
    name: str
    category: ServiceCategory
    highlights: list[str] = Field(default_factory=list, max_length=3)
    is_active: bool = True
    order: int = 0

    @field_validator("highlights")
    @classmethod
    def max_three(cls, v: list[str]) -> list[str]:
        return [h for h in v if h.strip()][:3]


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ServiceCategory] = None
    highlights: Optional[list[str]] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class ServiceOut(ServiceBase):
    id: int
    image_url: Optional[str] = None
    category_display: str = ""

    @model_validator(mode="after")
    def add_display(self):
        self.category_display = CATEGORY_LABELS.get(self.category, self.category.value)
        return self

    class Config:
        from_attributes = True


# ---------- Gallery ----------

class GalleryImageOut(BaseModel):
    id: int
    title: Optional[str] = None
    category: ServiceCategory
    category_display: str = ""
    image_url: str
    is_featured: bool
    uploaded_at: datetime

    @model_validator(mode="after")
    def add_display(self):
        self.category_display = CATEGORY_LABELS.get(self.category, self.category.value)
        return self

    class Config:
        from_attributes = True


# ---------- Bookings ----------

class BookingCreate(BaseModel):
    service_id: int
    full_name: str
    phone_number: str
    event_location: str
    number_of_guests: Optional[int] = None
    message: Optional[str] = ""
    event_date: date
    event_time: time

    @field_validator("event_date")
    @classmethod
    def future_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Please select a future date.")
        return v


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BaseModel):
    id: int
    reference_number: str
    service_id: int
    service: Optional[ServiceOut] = None
    full_name: str
    phone_number: str
    event_location: str
    number_of_guests: Optional[int] = None
    message: Optional[str] = None
    event_date: date
    event_time: time
    status: BookingStatus
    status_display: str = ""
    created_at: datetime

    @model_validator(mode="after")
    def add_display(self):
        self.status_display = self.status.value.capitalize()
        return self

    class Config:
        from_attributes = True


class SlotStatus(BaseModel):
    time: str
    available: bool


class AvailabilityOut(BaseModel):
    date: str
    day_blocked: bool
    slots: list[SlotStatus]


# ---------- Blocked slots ----------

class BlockedSlotCreate(BaseModel):
    date: date
    time: Optional[time] = None
    reason: Optional[str] = ""


class BlockedSlotOut(BaseModel):
    id: int
    date: date
    time: Optional[time] = None
    reason: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Admin dashboard ----------

class DashboardStats(BaseModel):
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    upcoming_bookings: int
    active_services: int


# ---------- Site settings ----------

class SiteSettingsOut(BaseModel):
    business_name: str
    tagline: str
    intro_text: str
    brother_one_name: str
    brother_one_role: str
    brother_one_bio: str
    brother_one_photo: Optional[str] = None
    brother_two_name: str
    brother_two_role: str
    brother_two_bio: str
    brother_two_photo: Optional[str] = None
    phone_number: str
    alternate_phone_number: str
    whatsapp_number: str
    email: str
    address: str
    google_maps_url: str
    logo: Optional[str] = None

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    intro_text: Optional[str] = None
    brother_one_name: Optional[str] = None
    brother_one_role: Optional[str] = None
    brother_one_bio: Optional[str] = None
    brother_two_name: Optional[str] = None
    brother_two_role: Optional[str] = None
    brother_two_bio: Optional[str] = None
    phone_number: Optional[str] = None
    alternate_phone_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    google_maps_url: Optional[str] = None
