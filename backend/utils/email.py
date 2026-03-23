import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

def send_verification_email(to_email: str, code: str) -> bool:
    """
    Attempts to send a 6-digit verification code to the specified email address
    using SMTP credentials found in environment variables.
    
    Returns True if successfully sent, False if SMTP is unconfigured or fails.
    """
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username or "no-reply@conceptionimmaculate48.com")

    if not all([smtp_server, smtp_port, smtp_username, smtp_password]):
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verify Your Immaculate Conception High School Account"
        msg["From"] = f"Immaculate Conception High School <{from_email}>"
        msg["To"] = to_email

        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #eaeaea; border-radius: 8px; padding: 30px;">
                <h2 style="color: #2563eb; text-align: center;">Welcome to Immaculate Conception High School!</h2>
                <p>Hello,</p>
                <p>Thank you for creating an account with us. To complete your registration, please use the following 6-digit verification code:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f3f4f6; padding: 15px 30px; border-radius: 8px; color: #111;">{code}</span>
                </div>
                
                <p>If you did not request this verification, please disregard this email.</p>
                <br />
                <p>Best regards,<br/><strong>Immaculate Conception High School Team</strong></p>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        server = smtplib.SMTP(smtp_server, int(smtp_port))
        server.ehlo()
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False
