from datetime import date as date_cls

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_owner
from app.models.models import BlockedSlot, Booking, BookingStatus, Service, User
from app.schemas.schemas import (
    BlockedSlotCreate, BlockedSlotOut, BookingOut, BookingStatusUpdate, DashboardStats,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard-stats/", response_model=DashboardStats)
def dashboard_stats(owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    all_bookings = db.query(Booking)
    today = date_cls.today()
    return DashboardStats(
        total_bookings=all_bookings.count(),
        pending_bookings=all_bookings.filter(Booking.status == BookingStatus.pending).count(),
        confirmed_bookings=all_bookings.filter(Booking.status == BookingStatus.confirmed).count(),
        completed_bookings=all_bookings.filter(Booking.status == BookingStatus.completed).count(),
        cancelled_bookings=all_bookings.filter(Booking.status == BookingStatus.cancelled).count(),
        upcoming_bookings=all_bookings.filter(
            Booking.event_date >= today, Booking.status != BookingStatus.cancelled
        ).count(),
        active_services=db.query(Service).filter(Service.is_active.is_(True)).count(),
    )


@router.get("/bookings/", response_model=list[BookingOut])
def admin_list_bookings(
    status: str | None = None,
    owner: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    query = db.query(Booking).options(joinedload(Booking.service))
    if status:
        query = query.filter(Booking.status == status)
    return query.order_by(Booking.created_at.desc()).all()


@router.patch("/bookings/{booking_id}/", response_model=BookingOut)
def admin_update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    owner: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.status = payload.status
    # Free the slot for re-booking once cancelled; re-occupy it if
    # un-cancelled back to an active status.
    booking.active_marker = booking.id if payload.status == BookingStatus.cancelled else 0
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Couldn't update this booking - that slot may already be taken by another active booking.",
        )
    db.refresh(booking)
    return booking


# ---------- Blocked slots ----------

@router.get("/blocked-slots/", response_model=list[BlockedSlotOut])
def list_blocked_slots(owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    return db.query(BlockedSlot).order_by(BlockedSlot.date, BlockedSlot.time).all()


@router.post("/blocked-slots/", response_model=BlockedSlotOut, status_code=201)
def create_blocked_slot(
    payload: BlockedSlotCreate, owner: User = Depends(get_current_owner), db: Session = Depends(get_db)
):
    existing = (
        db.query(BlockedSlot)
        .filter(BlockedSlot.date == payload.date, BlockedSlot.time == payload.time)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="That date/time is already blocked.")
    slot = BlockedSlot(date=payload.date, time=payload.time, reason=payload.reason or "")
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/blocked-slots/{slot_id}/", status_code=204)
def delete_blocked_slot(slot_id: int, owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    slot = db.query(BlockedSlot).filter(BlockedSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found.")
    db.delete(slot)
    db.commit()
