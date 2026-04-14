import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def send_verification_email(to_email: str, code: str) -> bool:
    """
    Attempts to send a 6-digit verification code to the specified email address
    using SMTP credentials found in environment variables.
    
    Returns True if successfully sent, False if SMTP is unconfigured or fails.
    """
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port_str = os.getenv("SMTP_PORT", "587")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username or "no-reply@campusconnect.com")

    if not all([smtp_server, smtp_username, smtp_password]):
        print("[EMAIL] SMTP not configured — skipping email send.")
        return False

    smtp_port = int(smtp_port_str)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verify Your Campus Connect Account"
        msg["From"] = f"Campus Connect <{from_email}>"
        msg["To"] = to_email

        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 40px;">
                <h2 style="color: #2563eb; text-align: center; margin-bottom: 8px;">Welcome to Campus Connect!</h2>
                <p style="text-align: center; color: #6b7280; margin-top: 0;">Immaculate Conception High School</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
                <p>Hello,</p>
                <p>Thank you for creating an account. Use the verification code below to complete your registration:</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: #eff6ff; padding: 16px 32px; border-radius: 10px; color: #1d4ed8; border: 2px dashed #93c5fd;">{code}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">This code is valid for your current registration session. If you did not sign up, you can safely ignore this email.</p>
                <br />
                <p>Best regards,<br/><strong>Campus Connect Team</strong></p>
            </div>
          </body>
        </html>
        """
        
        text_content = f"Your Campus Connect verification code is: {code}"

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))
        
        print(f"[EMAIL] Connecting to {smtp_server}:{smtp_port} as {smtp_username}...")

        if smtp_port == 465:
            # Use SSL directly
            import ssl
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
                server.login(smtp_username, smtp_password)
                server.sendmail(from_email, to_email, msg.as_string())
        else:
            # Use STARTTLS (port 587)
            with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_username, smtp_password)
                server.sendmail(from_email, to_email, msg.as_string())

        print(f"[EMAIL] Verification email sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"[EMAIL] Authentication failed — check SMTP_USERNAME and SMTP_PASSWORD / App Password: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"[EMAIL] SMTP error while sending to {to_email}: {e}")
        return False
    except Exception as e:
        print(f"[EMAIL] Unexpected error sending email to {to_email}: {e}")
        return False
