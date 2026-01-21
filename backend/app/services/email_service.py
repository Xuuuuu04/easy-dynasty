from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
import random
import string
import redis.asyncio as redis
from app.services.settings_service import SettingsService

redis_client = redis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)

class EmailService:
    @staticmethod
    def _get_conf():
        return ConnectionConfig(
            MAIL_USERNAME=SettingsService.get("MAIL_USERNAME"),
            MAIL_PASSWORD=SettingsService.get("MAIL_PASSWORD"),
            MAIL_FROM=SettingsService.get("MAIL_FROM"),
            MAIL_PORT=int(SettingsService.get("MAIL_PORT", "465")),
            MAIL_SERVER=SettingsService.get("MAIL_SERVER", "smtp.qq.com"),
            MAIL_STARTTLS=False,
            MAIL_SSL_TLS=True,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )

    @staticmethod
    def generate_code() -> str:
        return "".join(random.choices(string.digits, k=6))

    @staticmethod
    async def send_verification_code(email: EmailStr) -> bool:
        code = EmailService.generate_code()
        await redis_client.set(f"verify_code:{email}", code, ex=300)
        
        html = f"""
        <div style="background-color: #f5f5f0; padding: 20px; font-family: serif; color: #1c1917;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; border: 1px solid #dcd9cd;">
                <h1 style="text-align: center; color: #9a2b2b; letter-spacing: 4px; border-bottom: 2px solid #9a2b2b; padding-bottom: 20px;">易朝 · 验证码</h1>
                <p style="font-size: 16px; margin-top: 30px;">亲爱的道友：</p>
                <p style="font-size: 16px; line-height: 1.6;">您正在进行身份验证。请在 <strong style="color: #9a2b2b;">5分钟</strong> 内输入以下验证码：</p>
                <div style="text-align: center; margin: 40px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f5f5f0; padding: 10px 30px; border-radius: 4px; color: #1c1917;">{code}</span>
                </div>
                <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
                    &copy; 2026 易朝 (Yi Dynasty)
                </div>
            </div>
        </div>
        """

        message = MessageSchema(
            subject="【易朝】您的验证码",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(EmailService._get_conf())
        try:
            await fm.send_message(message)
            return True
        except Exception as e:
            print(f"Email send failed: {e}")
            return False

    @staticmethod
    async def verify_code(email: str, code: str) -> bool:
        stored_code = await redis_client.get(f"verify_code:{email}")
        if stored_code and stored_code == code:
            await redis_client.delete(f"verify_code:{email}")
            return True
        return False