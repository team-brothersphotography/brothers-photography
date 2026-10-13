"""
Pluggable OTP delivery.

`send_otp()` is the single seam to swap in a real SMS provider (Twilio,
MSG91, AWS SNS, etc.) for production. Right now it just logs the OTP to
the server console, since no SMS provider is configured — no OTP value is
ever hard-coded; a fresh one is generated per request and expires after
`settings.OTP_EXPIRE_MINUTES`.

To go live: replace the body of `send_otp()` with a call to your SMS
provider's API, remove the console log, and keep the same function
signature so nothing else in the app needs to change.
"""
import logging

from app.core.config import settings

logger = logging.getLogger("otp")


def send_otp(phone_number: str, otp: str) -> None:
    # --- Real SMS integration goes here, e.g.: ---
    # twilio_client.messages.create(to=phone_number, from_=TWILIO_NUMBER,
    #                                body=f"Your Brothers Photography OTP is {otp}")
    logger.info("OTP for %s: %s (expires in %s min)", phone_number, otp, settings.OTP_EXPIRE_MINUTES)
    print(f"[DEV OTP] Phone {phone_number} -> OTP {otp} (expires in {settings.OTP_EXPIRE_MINUTES} min)")
