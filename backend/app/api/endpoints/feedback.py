from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import text
from app.api.endpoints.auth import get_current_user, get_db
from app.schemas.auth import User
from app.schemas.profile import Feedback, FeedbackCreate
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Feedback)
async def create_feedback(
    fb: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        result = db.execute(
            text("""
                INSERT INTO user_feedbacks (user_id, type, related_history_id, score, content)
                VALUES (:uid, :tp, :rhid, :sc, :ct)
            """),
            {"uid": current_user.id, "tp": fb.type, "rhid": fb.related_history_id, "sc": fb.score, "ct": fb.content}
        )
        db.commit()
        return Feedback(
            id=result.lastrowid, user_id=current_user.id, is_read_by_user=False, created_at=datetime.now(), **fb.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications", response_model=List[Feedback])
async def get_notifications(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    # Get feedback that has admin reply
    rows = db.execute(
        text("SELECT * FROM user_feedbacks WHERE user_id = :uid AND admin_reply IS NOT NULL ORDER BY replied_at DESC"),
        {"uid": current_user.id}
    ).fetchall()
    
    return [Feedback(
        id=r[0], user_id=r[1], type=r[2], related_history_id=r[3], score=r[4], content=r[5],
        admin_reply=r[6], replied_at=r[7], is_read_by_user=bool(r[8]), created_at=r[9]
    ) for r in rows]

@router.get("/my", response_model=List[Feedback])
async def get_my_feedbacks(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM user_feedbacks WHERE user_id = :uid ORDER BY created_at DESC"),
        {"uid": current_user.id}
    ).fetchall()
    
    return [Feedback(
        id=r[0], user_id=r[1], type=r[2], related_history_id=r[3], score=r[4], content=r[5],
        admin_reply=r[6], replied_at=r[7], is_read_by_user=bool(r[8]), created_at=r[9]
    ) for r in rows]

@router.post("/{id}/read")
async def mark_read(id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    db.execute(text("UPDATE user_feedbacks SET is_read_by_user = TRUE WHERE id = :id AND user_id = :uid"), {"id": id, "uid": current_user.id})
    db.commit()
    return {"status": "success"}
