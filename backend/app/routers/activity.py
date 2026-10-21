from datetime import date, datetime, time, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_owner, get_optional_user
from app.models.models import ActivityLog, User
from app.schemas.schemas import ActivityLogCreate, ActivityLogOut, ActivityLogPaginated

router = APIRouter(prefix="/api", tags=["activity"])

SENSITIVE_KEYS = {"password", "token", "otp", "secret", "confirm_password", "old_password", "new_password", "credentials"}


def sanitize_metadata(meta: dict | None) -> dict:
    if not meta:
        return {}
    sanitized = {}
    for key, value in meta.items():
        if any(s in key.lower() for s in SENSITIVE_KEYS):
            continue
        if isinstance(value, (str, int, float, bool, list, dict)) or value is None:
            sanitized[key] = value
    return sanitized


@router.post("/activity/", status_code=201)
def log_activity(
    payload: ActivityLogCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    clean_meta = sanitize_metadata(payload.metadata)

    log_entry = ActivityLog(
        user_id=user.id if user else None,
        session_id=payload.session_id,
        event_type=payload.event_type,
        page=payload.page,
        metadata_json=clean_meta,
        ip_address=ip_address[:45] if ip_address else None,
        user_agent=user_agent[:255] if user_agent else None,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return {"status": "recorded", "id": log_entry.id}


@router.get("/admin/activity/", response_model=ActivityLogPaginated)
def get_admin_activity(
    page_filter: Optional[str] = Query(None, alias="page_filter"),
    event_type: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    session_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner),
):
    query = db.query(ActivityLog)

    if page_filter:
        query = query.filter(ActivityLog.page.ilike(f"%{page_filter}%"))
    if event_type:
        query = query.filter(ActivityLog.event_type == event_type)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if session_id:
        query = query.filter(ActivityLog.session_id == session_id)
    if start_date:
        start_dt = datetime.combine(start_date, time.min).replace(tzinfo=timezone.utc)
        query = query.filter(ActivityLog.timestamp >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, time.max).replace(tzinfo=timezone.utc)
        query = query.filter(ActivityLog.timestamp <= end_dt)

    total = query.count()
    offset = (page - 1) * limit
    items = query.order_by(ActivityLog.timestamp.desc()).offset(offset).limit(limit).all()

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return ActivityLogPaginated(
        items=[ActivityLogOut.model_validate(item) for item in items],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )
