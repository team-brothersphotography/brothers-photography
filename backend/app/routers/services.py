import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_owner
from app.models.models import Service, ServiceCategory, User
from app.schemas.schemas import ServiceOut

router = APIRouter(prefix="/api/services", tags=["services"])


def _save_upload(file: UploadFile, subdir: str) -> str:
    ext = Path(file.filename or "").suffix or ".jpg"
    dest_dir = settings.MEDIA_ROOT / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = dest_dir / filename
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"{settings.MEDIA_URL}/{subdir}/{filename}"


@router.get("/", response_model=list[ServiceOut])
def list_services(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Service).filter(Service.is_active.is_(True))
    if category:
        query = query.filter(Service.category == category)
    return query.order_by(Service.order, Service.name).all()


@router.get("/all/", response_model=list[ServiceOut])
def list_all_services(owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Owner-only: includes inactive services for the admin dashboard."""
    return db.query(Service).order_by(Service.order, Service.name).all()


@router.post("/", response_model=ServiceOut, status_code=201)
def create_service(
    name: str = Form(...),
    category: ServiceCategory = Form(...),
    highlight_1: str = Form(""),
    highlight_2: str = Form(""),
    highlight_3: str = Form(""),
    is_active: bool = Form(True),
    order: int = Form(0),
    image: UploadFile | None = File(None),
    owner: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    highlights = [h.strip() for h in [highlight_1, highlight_2, highlight_3] if h.strip()][:3]
    service = Service(
        name=name, category=category, highlights=highlights, is_active=is_active, order=order,
    )
    if image is not None:
        service.image_url = _save_upload(image, "services")
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.patch("/{service_id}/", response_model=ServiceOut)
def update_service(
    service_id: int,
    name: str | None = Form(None),
    category: ServiceCategory | None = Form(None),
    highlight_1: str | None = Form(None),
    highlight_2: str | None = Form(None),
    highlight_3: str | None = Form(None),
    is_active: bool | None = Form(None),
    order: int | None = Form(None),
    image: UploadFile | None = File(None),
    owner: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")

    if name is not None:
        service.name = name
    if category is not None:
        service.category = category
    if is_active is not None:
        service.is_active = is_active
    if order is not None:
        service.order = order
    if any(h is not None for h in (highlight_1, highlight_2, highlight_3)):
        current = list(service.highlights or ["", "", ""])
        while len(current) < 3:
            current.append("")
        if highlight_1 is not None:
            current[0] = highlight_1
        if highlight_2 is not None:
            current[1] = highlight_2
        if highlight_3 is not None:
            current[2] = highlight_3
        service.highlights = [h.strip() for h in current if h.strip()][:3]
    if image is not None:
        service.image_url = _save_upload(image, "services")

    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}/", status_code=204)
def delete_service(service_id: int, owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")
    db.delete(service)
    db.commit()
