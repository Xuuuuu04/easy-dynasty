from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    name: str
    gender: str # 'male' or 'female'
    relation: str
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int
    birth_minute: int
    birth_place: Optional[str] = None
    is_true_solar_time: bool = False

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    type: str # 'tarot' or 'bazi'
    related_history_id: Optional[int] = None
    score: int # 1 (Like), -1 (Dislike)
    content: Optional[str] = None

class Feedback(FeedbackCreate):
    id: int
    user_id: int
    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    is_read_by_user: bool
    created_at: datetime

    class Config:
        from_attributes = True
