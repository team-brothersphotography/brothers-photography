from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_owner
from app.models.models import GalleryImage, ServiceCategory, User
from app.routers.services import _save_upload
from app.schemas.schemas import GalleryImageOut

router = APIRouter(prefix="/api/gallery", tags=["gallery"])


@router.get("/", response_model=list[GalleryImageOut])
def list_gallery(
    category: str | None = None,
    featured: bool | None = None,
    limit: int | None = None,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    # No artificial cap on total gallery size - `limit`/`offset` are just
    # optional pagination for the frontend's "View more photos" button.
    query = db.query(GalleryImage)
    if category:
        query = query.filter(GalleryImage.category == category)
    if featured is not None:
        query = query.filter(GalleryImage.is_featured.is_(featured))
    query = query.order_by(GalleryImage.uploaded_at.desc())
    if limit is not None:
        query = query.offset(offset).limit(limit)
    return query.all()


@router.get("/count/")
def gallery_count(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(GalleryImage)
    if category:
        query = query.filter(GalleryImage.category == category)
    return {"count": query.count()}


@router.post("/", response_model=GalleryImageOut, status_code=201)
def upload_gallery_image(
    category: ServiceCategory = Form(...),
    title: str = Form(""),
    is_featured: bool = Form(False),
    image: UploadFile = File(...),
    owner: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    photo = GalleryImage(
        title=title,
        category=category,
        is_featured=is_featured,
        image_url=_save_upload(image, "gallery"),
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/{image_id}/", status_code=204)
def delete_gallery_image(image_id: int, owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    photo = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found.")
    db.delete(photo)
    db.commit()
