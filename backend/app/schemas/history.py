from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime

class HistoryBase(BaseModel):
    type: str # 'tarot' or 'bazi'
    title: str
    data: Dict[str, Any]

class HistoryCreate(HistoryBase):
    pass

class History(HistoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
