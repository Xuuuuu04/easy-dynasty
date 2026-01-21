from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    id: int
    username: str
    email: str | None = None
    is_vip: bool = False
    is_superuser: bool = False
    tier: str = "free" # free, vip, svip
    subscription_end: Optional[str] = None
    tarot_used_today: int = 0
    bazi_used_today: int = 0
    tarot_limit: int = 1
    bazi_limit: int = 5

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    code: str

class VerificationRequest(BaseModel):
    email: EmailStr
    type: str = "register" # register, reset

class PasswordReset(BaseModel):
    email: EmailStr
    code: str
    new_password: str