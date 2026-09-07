import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Relay").strip()
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Best-effort email send. Returns True on success, False otherwise (never raises)."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"[email] SMTP not configured — skipped sending '{subject}' to {to_email}")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, [to_email], msg.as_string())
        return True
    except Exception as e:
        print(f"[email] Failed to send '{subject}' to {to_email}: {e}")
        return False


def send_booking_confirmation(to_email, user_name, class_name, provider_name, date, time, price, location_name):
    subject = f"You're booked: {class_name} at {provider_name}"
    html_body = f"""
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f1428; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 24px 28px;">
        <p style="margin: 0; font-size: 13px; letter-spacing: 2px; opacity: 0.8;">RELAY</p>
        <h1 style="margin: 6px 0 0; font-size: 20px;">Booking confirmed</h1>
      </div>
      <div style="padding: 24px 28px;">
        <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px;">Hi {user_name}, you're all set. Here are your appointment details:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #94a3b8;">Service</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">{class_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">Provider</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">{provider_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">Date</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">{date}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">Time</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">{time}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">Location</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">{location_name or "-"}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">Price</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #818cf8;">${price}</td></tr>
        </table>
        <p style="margin: 20px 0 0; color: #64748b; font-size: 12px;">You can manage or cancel this booking anytime from My Bookings in Relay.</p>
      </div>
    </div>
    """
    return send_email(to_email, subject, html_body)
