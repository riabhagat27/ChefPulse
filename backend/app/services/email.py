import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from dotenv import load_dotenv

# Load the .env file from the backend folder
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_SENDER = os.getenv("SMTP_SENDER")

# Debug (remove these after everything works)
print("SMTP_HOST =", SMTP_HOST)
print("SMTP_PORT =", SMTP_PORT)
print("SMTP_USERNAME =", SMTP_USERNAME)
print("SMTP_PASSWORD =", "SET" if SMTP_PASSWORD else "MISSING")
print("SMTP_SENDER =", SMTP_SENDER)


def send_otp_email(to_email: str, otp: str) -> bool:
    # Verify SMTP configuration
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SENDER]):
        print("\n" + "=" * 70)
        print("[MAIL DELIVERY SIMULATOR - FALLBACK]")
        print("SMTP configuration is incomplete in .env.")
        print(f"OTP Code for {to_email}: {otp}")
        print("=" * 70 + "\n")
        return False

    try:
        port = int(SMTP_PORT)

        # Create email
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your ChefPulse Login OTP Code: {otp}"
        msg["From"] = f"ChefPulse <{SMTP_SENDER}>"
        msg["To"] = to_email

        html = f"""
        <html>
        <body style="font-family:Arial,sans-serif;background:#121212;color:#ffffff;padding:30px;">
            <div style="max-width:500px;margin:auto;background:#1f1f1f;padding:30px;border-radius:12px;border:1px solid #D4AF37;">
                <h2 style="color:#D4AF37;text-align:center;">ChefPulse</h2>

                <p>Your One-Time Password (OTP) for login is:</p>

                <div style="
                    font-size:36px;
                    font-weight:bold;
                    letter-spacing:8px;
                    text-align:center;
                    color:#D4AF37;
                    padding:20px;
                    background:#111;
                    border-radius:10px;
                    margin:25px 0;">
                    {otp}
                </div>

                <p>This OTP is valid for <strong>5 minutes</strong>.</p>

                <p>If you didn't request this login, you can safely ignore this email.</p>

                <hr>

                <small style="color:#999;">
                    ChefPulse Restaurant Management System
                </small>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))
        print("SMTP_HOST:", SMTP_HOST)
        print("SMTP_PORT:", SMTP_PORT)
        print("SMTP_USERNAME:", SMTP_USERNAME)
        print("SMTP_SENDER:", SMTP_SENDER)

        # Send email
        if port == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, port, timeout=10) as server:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(
                    SMTP_SENDER,
                    to_email,
                    msg.as_string()
                )
        else:
            with smtplib.SMTP(SMTP_HOST, port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(
                    SMTP_SENDER,
        to_email,
        msg.as_string()
    )

        print(f"[SMTP] OTP email sent successfully to {to_email}")
        return True

    except Exception as e:
        print("\n" + "=" * 70)
        print("[SMTP ERROR]")
        print(str(e))
        print(f"OTP Code for {to_email}: {otp}")
        print("=" * 70 + "\n")
        return False