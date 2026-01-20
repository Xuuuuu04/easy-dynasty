from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.api.endpoints.auth import get_current_active_superuser, get_db
from app.schemas.auth import User
from pydantic import BaseModel
from sqlalchemy import text

router = APIRouter()

# --- Schemas ---
class UserUpdate(BaseModel):
    tier: str

class SettingUpdate(BaseModel):
    key: str
    value: str

class DashboardStats(BaseModel):
    total_users: int
    total_svip: int
    total_vip: int
    total_revenue: float
    today_bazi_calls: int
    today_tarot_calls: int

# --- Endpoints ---

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    # Total Users
    total_users = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
    
    # VIP/SVIP counts
    total_svip = db.execute(text("SELECT COUNT(*) FROM users WHERE tier = 'svip'")).scalar()
    total_vip = db.execute(text("SELECT COUNT(*) FROM users WHERE tier = 'vip'")).scalar()
    
    # Revenue (from orders table if exists)
    try:
        revenue = db.execute(text("SELECT SUM(money) FROM orders WHERE status = 1")).scalar() or 0.0
    except:
        revenue = 0.0 # Orders table might not exist or empty
        
    # Usage Stats (Sum of all users' daily usage)
    today_bazi = db.execute(text("SELECT SUM(bazi_used_today) FROM users")).scalar() or 0
    today_tarot = db.execute(text("SELECT SUM(tarot_used_today) FROM users")).scalar() or 0
    
    return DashboardStats(
        total_users=total_users,
        total_svip=total_svip,
        total_vip=total_vip,
        total_revenue=float(revenue),
        today_bazi_calls=today_bazi,
        today_tarot_calls=today_tarot
    )

@router.get("/users")
async def get_users(
    skip: int = 0, 
    limit: int = 50, 
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    users = db.execute(
        text("SELECT id, username, email, tier, created_at, last_usage_reset FROM users ORDER BY id DESC LIMIT :limit OFFSET :skip"),
        {"limit": limit, "skip": skip}
    ).fetchall()
    
    return [
        {
            "id": u[0],
            "username": u[1],
            "email": u[2],
            "tier": u[3],
            "created_at": u[4].isoformat() if u[4] else None,
            "last_active": u[5].isoformat() if u[5] else None
        }
        for u in users
    ]

@router.put("/users/{user_id}/tier")
async def update_user_tier(
    user_id: int, 
    update: UserUpdate,
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    if update.tier not in ['free', 'vip', 'svip']:
        raise HTTPException(status_code=400, detail="Invalid tier")
        
    db.execute(
        text("UPDATE users SET tier = :tier, is_vip = :is_vip WHERE id = :uid"),
        {"tier": update.tier, "is_vip": update.tier != 'free', "uid": user_id}
    )
    db.commit()
    return {"status": "success", "user_id": user_id, "new_tier": update.tier}

@router.get("/settings")
async def get_settings(
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    settings = db.execute(text("SELECT `key`, `value`, `description` FROM system_settings")).fetchall()
    print(f"DEBUG: Found {len(settings)} settings in DB")
    return [
        {"key": s[0], "value": s[1], "description": s[2]}
        for s in settings
    ]

@router.put("/settings")
async def update_setting(
    setting: SettingUpdate,
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    # Security: Mask sensitive keys in logging if needed, but allow admin to update
    db.execute(
        text("INSERT INTO system_settings (`key`, `value`) VALUES (:key, :value) ON DUPLICATE KEY UPDATE `value` = :value"),
        {"key": setting.key, "value": setting.value}
    )
    db.commit()
    return {"status": "updated", "key": setting.key}

@router.get("/orders")
async def get_orders(
    skip: int = 0, 
    limit: int = 50, 
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    orders = db.execute(
        text("""
            SELECT o.id, u.username, o.out_trade_no, o.name, o.money, o.status, o.created_at 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT :limit OFFSET :skip
        """),
        {"limit": limit, "skip": skip}
    ).fetchall()
    
    return [
        {
            "id": o[0],
            "username": o[1],
            "trade_no": o[2],
            "item": o[3],
            "amount": float(o[4]),
            "status": o[5],
            "date": o[6].isoformat() if o[6] else None
        }
        for o in orders
    ]

@router.get("/logs")
async def get_logs(
    limit: int = 100, 
    current_user: User = Depends(get_current_active_superuser),
    db = Depends(get_db)
):
    # Left join user to handle anonymous requests
    logs = db.execute(
        text("""
            SELECT l.id, u.username, l.endpoint, l.method, l.status_code, l.process_time_ms, l.ip_address, l.timestamp 
            FROM api_logs l 
            LEFT JOIN users u ON l.user_id = u.id 
            ORDER BY l.timestamp DESC 
            LIMIT :limit
        """),
        {"limit": limit}
    ).fetchall()
    
    return [
        {
            "id": l[0],
            "username": l[1] or "Guest",
            "endpoint": l[2],
            "method": l[3],
            "status": l[4],
            "latency": l[5],
            "ip": l[6],
            "time": l[7].isoformat() if l[7] else None
        }
        for l in logs
    ]
