from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy import text
from app.api.endpoints.auth import get_current_user, get_db
from app.schemas.auth import User
from app.schemas.history import History, HistoryCreate
import json

router = APIRouter()

@router.post("/", response_model=History)
async def create_history(
    history: HistoryCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        # Insert using raw SQL
        result = db.execute(
            text("""
                INSERT INTO history_records (user_id, type, title, data) 
                VALUES (:uid, :type, :title, :data)
            """),
            {
                "uid": current_user.id,
                "type": history.type,
                "title": history.title,
                "data": json.dumps(history.data)
            }
        )
        db.commit()
        new_id = result.lastrowid
        
        # Fetch back
        record = db.execute(
            text("SELECT id, user_id, type, title, data, created_at FROM history_records WHERE id = :id"),
            {"id": new_id}
        ).fetchone()
        
        return History(
            id=record[0],
            user_id=record[1],
            type=record[2],
            title=record[3],
            data=json.loads(record[4]) if isinstance(record[4], str) else record[4],
            created_at=record[5]
        )
    except Exception as e:
        print(f"Error saving history: {e}")
        raise HTTPException(status_code=500, detail="Failed to save history")

@router.get("/", response_model=List[History])
async def read_histories(
    skip: int = 0, 
    limit: int = 50, 
    type: str | None = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    query = "SELECT id, user_id, type, title, data, created_at FROM history_records WHERE user_id = :uid"
    params = {"uid": current_user.id, "limit": limit, "skip": skip}
    
    if type:
        query += " AND type = :type"
        params["type"] = type
        
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    
    records = db.execute(text(query), params).fetchall()
    
    return [
        History(
            id=r[0],
            user_id=r[1],
            type=r[2],
            title=r[3],
            data=json.loads(r[4]) if isinstance(r[4], str) else r[4],
            created_at=r[5]
        )
        for r in records
    ]

@router.get("/{id}", response_model=History)
async def read_history(
    id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    record = db.execute(
        text("SELECT id, user_id, type, title, data, created_at FROM history_records WHERE id = :id AND user_id = :uid"),
        {"id": id, "uid": current_user.id}
    ).fetchone()
    
    if not record:
        raise HTTPException(status_code=404, detail="History not found")
        
    return History(
        id=record[0],
        user_id=record[1],
        type=record[2],
        title=record[3],
        data=json.loads(record[4]) if isinstance(record[4], str) else record[4],
        created_at=record[5]
    )

@router.delete("/{id}")
async def delete_history(
    id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    result = db.execute(
        text("DELETE FROM history_records WHERE id = :id AND user_id = :uid"),
        {"id": id, "uid": current_user.id}
    )
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="History not found")
        
    return {"status": "success"}
