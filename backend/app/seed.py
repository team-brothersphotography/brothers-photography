"""
Seeds demo data for local development: an owner account, all 8 service
categories (with 3 highlight points each, no prices), a spread of demo
gallery photos, and starter site settings.

Run with:  python -m app.seed
"""
import shutil
from pathlib import Path

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.models import (
    CATEGORY_LABELS, GalleryImage, Service, ServiceCategory, SiteSettings, User,
)

Base.metadata.create_all(bind=engine)

SERVICES = [
    ("wedding", "Wedding Photography", [
        "Full-day candid and traditional coverage",
        "Two-photographer teams for every angle",
        "Cinematic highlight reel included",
    ]),
    ("pre_wedding", "Pre-Wedding Photography", [
        "Outdoor and studio location options",
        "Styling and pose guidance on the day",
        "Same-week preview gallery",
    ]),
    ("home_ceremony", "Home Ceremony", [
        "Discreet, unobtrusive coverage at home",
        "Captures rituals as they naturally unfold",
        "Full family group portraits included",
    ]),
    ("birthday", "Birthday Photography", [
        "Coverage for kids' and adult celebrations",
        "Candid guest moments plus posed shots",
        "Decor and cake-cutting close-ups",
    ]),
    ("naming_ceremony", "Naming Ceremony", [
        "Traditional ritual documentation",
        "Close-up detail shots of ceremony items",
        "Extended family portraits arranged for you",
    ]),
    ("maternity", "Maternity Photography", [
        "Studio and outdoor shoot options",
        "Comfortable, guided posing throughout",
        "Partner and family shots included",
    ]),
    ("modeling", "Modeling Photography", [
        "Portfolio-ready edited image sets",
        "Concept, fashion and lifestyle themes",
        "Hair/makeup coordination on request",
    ]),
    ("candid", "Candid Photography", [
        "Storytelling coverage for any occasion",
        "Unposed, natural moment-driven shots",
        "Fast-turnaround edited gallery",
    ]),
]

# Free placeholder photo service - used only where real client photography
# isn't available yet, exactly as many photos as we want, no licensing
# concerns since picsum.photos is built for this purpose.
def demo_image_url(seed: str, w: int = 900, h: int = 700) -> str:
    return f"https://picsum.photos/seed/{seed}/{w}/{h}"


def run():
    db = SessionLocal()
    try:
        # --- Owner account ---
        owner = db.query(User).filter(User.email == settings.OWNER_EMAIL).first()
        if not owner:
            owner = User(
                full_name="Studio Owner",
                phone_number="+918088911160",  # so the owner can also use forgot-password OTP recovery
                email=settings.OWNER_EMAIL,
                password_hash=hash_password(settings.OWNER_DEFAULT_PASSWORD),
                is_owner=True,
            )
            db.add(owner)
            db.commit()
            print(f"Created owner account: {settings.OWNER_EMAIL} / {settings.OWNER_DEFAULT_PASSWORD}")
        else:
            print("Owner account already exists.")

        # --- Services (no prices, 3 highlights each, demo image if none set) ---
        for i, (category, name, highlights) in enumerate(SERVICES):
            existing = db.query(Service).filter(Service.category == category).first()
            if existing:
                continue
            db.add(Service(
                name=name,
                category=ServiceCategory(category),
                highlights=highlights,
                image_url=demo_image_url(f"service-{category}"),
                order=i,
            ))
        db.commit()
        print(f"Ensured {len(SERVICES)} service categories exist.")

        # --- Demo gallery photos (spread across all categories) ---
        if db.query(GalleryImage).count() == 0:
            count = 0
            for category, name, _ in SERVICES:
                for n in range(1, 5):  # 4 demo photos per category = 32 total
                    db.add(GalleryImage(
                        title=f"{name} {n}",
                        category=ServiceCategory(category),
                        image_url=demo_image_url(f"gallery-{category}-{n}", 800, 1000),
                        is_featured=(n <= 2),  # first two of each category feature on the home page
                    ))
                    count += 1
            db.commit()
            print(f"Seeded {count} demo gallery photos (replace with real ones anytime via the admin dashboard).")
        else:
            print("Gallery already has photos - skipping demo seed.")

        # --- Site settings ---
        site = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
        if not site:
            site = SiteSettings(id=1)
            db.add(site)

        site.business_name = site.business_name or "Brothers Photography"
        site.tagline = site.tagline or "Capturing Your Moments, Framing Your Memories"
        site.intro_text = site.intro_text or (
            "Brothers Photography is a passion-driven studio run by two brothers who "
            "believe every event deserves to be remembered beautifully."
        )
        site.brother_one_name = site.brother_one_name or "Brother One (placeholder)"
        site.brother_one_role = site.brother_one_role or "Lead Photographer"
        site.brother_two_name = site.brother_two_name or "Brother Two (placeholder)"
        site.brother_two_role = site.brother_two_role or "Creative Director"
        site.phone_number = site.phone_number or "+91 80889 11160"
        site.alternate_phone_number = site.alternate_phone_number or "+91 99025 44078"
        site.whatsapp_number = site.whatsapp_number or "+91 80889 11160"
        site.address = site.address or "Gowrikoplu Circle, Near Blinkit, Hassan, 573201, Karnataka, India"

        logo_src = Path(__file__).resolve().parent.parent / "seed_assets" / "logo.jpg"
        if not site.logo and logo_src.exists():
            dest_dir = settings.MEDIA_ROOT / "branding"
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest_path = dest_dir / "brothers-photography-logo.jpg"
            shutil.copyfile(logo_src, dest_path)
            site.logo = f"{settings.MEDIA_URL}/branding/brothers-photography-logo.jpg"

        db.commit()
        print("Site settings ready (edit real details via the owner dashboard).")
    finally:
        db.close()


if __name__ == "__main__":
    run()
