from datetime import datetime, time as time_cls

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import BlockedSlot, Booking, BookingStatus, Service, User
from app.schemas.schemas import AvailabilityOut, BookingCreate, BookingOut, SlotStatus

router = APIRouter(prefix="/api", tags=["bookings"])

DAILY_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

ACTIVE_STATUSES = (BookingStatus.pending, BookingStatus.confirmed, BookingStatus.completed)


@router.get("/availability/", response_model=AvailabilityOut)
def check_availability(date: str, db: Session = Depends(get_db)):
    try:
        parsed = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Provide a valid ?date=YYYY-MM-DD parameter.")

    day_blocked = (
        db.query(BlockedSlot)
        .filter(BlockedSlot.date == parsed, BlockedSlot.time.is_(None))
        .first()
        is not None
    )
    blocked_times = {
        b.time for b in db.query(BlockedSlot).filter(BlockedSlot.date == parsed, BlockedSlot.time.isnot(None))
    }
    booked_times = {
        b.event_time
        for b in db.query(Booking).filter(
            Booking.event_date == parsed, Booking.status.in_(ACTIVE_STATUSES)
        )
    }

    slots = []
    for slot in DAILY_SLOTS:
        t = time_cls.fromisoformat(slot)
        available = not day_blocked and t not in blocked_times and t not in booked_times
        slots.append(SlotStatus(time=slot, available=available))

    return AvailabilityOut(date=date, day_blocked=day_blocked, slots=slots)


@router.post("/bookings/", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == payload.service_id).first()
    if not service or not service.is_active:
        raise HTTPException(status_code=400, detail={"service_id": "This service is currently unavailable."})

    day_blocked = (
        db.query(BlockedSlot)
        .filter(BlockedSlot.date == payload.event_date, BlockedSlot.time.is_(None))
        .first()
    )
    if day_blocked:
        raise HTTPException(status_code=400, detail={"event_date": "This date is not available. Please select another date."})

    time_blocked = (
        db.query(BlockedSlot)
        .filter(BlockedSlot.date == payload.event_date, BlockedSlot.time == payload.event_time)
        .first()
    )
    if time_blocked:
        raise HTTPException(status_code=400, detail={"event_time": "This slot is already booked. Please select another date or time."})

    conflict = (
        db.query(Booking)
        .filter(
            Booking.event_date == payload.event_date,
            Booking.event_time == payload.event_time,
            Booking.status.in_(ACTIVE_STATUSES),
        )
        .first()
    )
    if conflict:
        raise HTTPException(status_code=400, detail={"event_time": "This slot is already booked. Please select another date or time."})

    booking = Booking(
        reference_number=Booking.generate_reference(),
        customer_id=user.id,
        service_id=service.id,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        event_location=payload.event_location,
        number_of_guests=payload.number_of_guests,
        message=payload.message or "",
        event_date=payload.event_date,
        event_time=payload.event_time,
        status=BookingStatus.pending,
        active_marker=0,  # sentinel for "active" - real booking ids start at 1, so this never collides
    )
    db.add(booking)
    try:
        db.commit()
    except IntegrityError:
        # Final safety net: catches the rare race where two requests for
        # the same slot both passed the checks above at the same instant.
        db.rollback()
        raise HTTPException(status_code=400, detail={"event_time": "This slot is already booked. Please select another date or time."})

    db.refresh(booking)
    return booking


@router.get("/bookings/", response_model=list[BookingOut])
def list_my_bookings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Booking).options(joinedload(Booking.service))
    if not user.is_owner:
        query = query.filter(Booking.customer_id == user.id)
    return query.order_by(Booking.created_at.desc()).all()


@router.get("/bookings/{booking_id}/", response_model=BookingOut)
def get_booking(booking_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = (
        db.query(Booking)
        .options(joinedload(Booking.service))
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if not user.is_owner and booking.customer_id != user.id:
        raise HTTPException(status_code=403, detail="You don't have access to this booking.")
    return booking
