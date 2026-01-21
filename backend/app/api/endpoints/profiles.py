from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy import text
from app.api.endpoints.auth import get_current_user, get_db
from app.schemas.auth import User
from app.schemas.profile import Profile, ProfileCreate

router = APIRouter()

@router.post("/", response_model=Profile)
async def create_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        result = db.execute(
            text("""
                INSERT INTO user_profiles 
                (user_id, name, gender, relation, birth_year, birth_month, birth_day, birth_hour, birth_minute, birth_place, is_true_solar_time)
                VALUES (:uid, :nm, :gd, :rel, :by, :bm, :bd, :bh, :bmin, :bp, :itst)
            """),
            {
                "uid": current_user.id, "nm": profile.name, "gd": profile.gender, "rel": profile.relation,
                "by": profile.birth_year, "bm": profile.birth_month, "bd": profile.birth_day,
                "bh": profile.birth_hour, "bmin": profile.birth_minute, "bp": profile.birth_place,
                "itst": profile.is_true_solar_time
            }
        )
        db.commit()
        new_id = result.lastrowid
        
        # Fetch back logic simplified for brevity
        return Profile(
            id=new_id, user_id=current_user.id, created_at=datetime.now(), **profile.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Profile])
async def read_profiles(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM user_profiles WHERE user_id = :uid ORDER BY created_at DESC"), {"uid": current_user.id}).fetchall()
    return [Profile(
        id=r[0], user_id=r[1], name=r[2], gender=r[3], relation=r[4],
        birth_year=r[5], birth_month=r[6], birth_day=r[7], birth_hour=r[8], birth_minute=r[9],
        birth_place=r[10], is_true_solar_time=bool(r[11]), created_at=r[12]
    ) for r in rows]

@router.delete("/{id}")
async def delete_profile(id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    db.execute(text("DELETE FROM user_profiles WHERE id = :id AND user_id = :uid"), {"id": id, "uid": current_user.id})
    db.commit()
    return {"status": "success"}

from datetime import datetime
