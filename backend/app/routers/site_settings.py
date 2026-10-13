from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_owner
from app.models.models import SiteSettings, User
from app.routers.services import _save_upload
from app.schemas.schemas import SiteSettingsOut, SiteSettingsUpdate

router = APIRouter(prefix="/api/site-settings", tags=["site-settings"])


def _load(db: Session) -> SiteSettings:
    obj = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not obj:
        obj = SiteSettings(id=1)
        db.add(obj)
        db.commit()
        db.refresh(obj)
    return obj


@router.get("/", response_model=SiteSettingsOut)
def get_site_settings(db: Session = Depends(get_db)):
    return _load(db)


@router.patch("/", response_model=SiteSettingsOut)
def update_site_settings(
    payload: SiteSettingsUpdate, owner: User = Depends(get_current_owner), db: Session = Depends(get_db)
):
    obj = _load(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/logo/", response_model=SiteSettingsOut)
def upload_logo(image: UploadFile = File(...), owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    obj = _load(db)
    obj.logo = _save_upload(image, "branding")
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/brother-one-photo/", response_model=SiteSettingsOut)
def upload_brother_one_photo(image: UploadFile = File(...), owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    obj = _load(db)
    obj.brother_one_photo = _save_upload(image, "team")
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/brother-two-photo/", response_model=SiteSettingsOut)
def upload_brother_two_photo(image: UploadFile = File(...), owner: User = Depends(get_current_owner), db: Session = Depends(get_db)):
    obj = _load(db)
    obj.brother_two_photo = _save_upload(image, "team")
    db.commit()
    db.refresh(obj)
    return obj
