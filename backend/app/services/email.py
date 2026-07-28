import os
import requests
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")


def send_otp_email(to_email: str, otp: str) -> bool:
    if not RESEND_API_KEY:
        print("=" * 70)
        print("RESEND_API_KEY missing")
        print(f"OTP for {to_email}: {otp}")
        print("=" * 70)
        return False

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "from": "ChefPulse <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Your ChefPulse Login OTP",
        "html": f"""
        <div style="font-family:Arial;padding:30px;">
            <h2>ChefPulse</h2>

            <p>Your One-Time Password is</p>

            <h1 style="letter-spacing:6px;">
                {otp}
            </h1>

            <p>This OTP expires in 5 minutes.</p>

            <p>If you didn't request this login, simply ignore this email.</p>
        </div>
        """
    }

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers=headers,
            json=payload,
            timeout=20
        )

        if response.status_code in (200, 202):
            print("OTP email sent successfully.")
            return True

        print(response.text)
        return False

    except Exception as e:
        print(e)
        return False