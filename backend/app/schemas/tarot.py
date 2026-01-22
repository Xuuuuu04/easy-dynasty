from typing import List

from pydantic import BaseModel


class TarotCardInfo(BaseModel):
    id: str
    name: str
    englishName: str


class DrawnCardInfo(BaseModel):
    card: TarotCardInfo
    isReversed: bool
    position: dict


class TarotRequest(BaseModel):
    question: str
    spreadName: str
    spreadId: str
    drawnCards: List[DrawnCardInfo]


class ChatMessage(BaseModel):
    role: str
    content: str


class TarotChatRequest(BaseModel):
    messages: List[ChatMessage]
