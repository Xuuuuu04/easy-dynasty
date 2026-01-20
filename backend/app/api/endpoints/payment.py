from fastapi import APIRouter, Depends, HTTPException, Request
from app.api.endpoints.auth import get_current_user, get_db
from app.services.payment_service import PaymentService
from app.schemas.auth import User
from sqlalchemy import text
import uuid
import time

router = APIRouter()

NOTIFY_URL = "https://easydynasty.oyemoye.top/api/v1/payment/callback"
RETURN_URL = "https://easydynasty.oyemoye.top/dashboard"

@router.post("/create")
async def create_order(tier: str, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    if tier not in ['vip', 'svip']:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    price = 29.9 if tier == 'vip' else 59.9
    name = "普通VIP会员 (1个月)" if tier == 'vip' else "高级SVIP会员 (1个月)"
    out_trade_no = f"ED{int(time.time())}{uuid.uuid4().hex[:8]}"

    # Get user id
    user_row = db.execute(text("SELECT id FROM users WHERE username = :u"), {"username": current_user.username}).fetchone()
    user_id = user_row[0]

    # Insert pending order
    db.execute(
        text("INSERT INTO orders (user_id, out_trade_no, name, money, type, status, tier_requested) VALUES (:uid, :otn, :name, :money, 'wxpay', 0, :tier)"),
        {"uid": user_id, "otn": out_trade_no, "name": name, "money": price, "tier": tier}
    )
    db.commit()

    # Generate payment params
    params = PaymentService.create_payment_params(user_id, out_trade_no, name, price, NOTIFY_URL, RETURN_URL)
    
    # Return the URL to redirect to
    query = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"pay_url": f"{PaymentService.SUBMIT_URL}?{query}"}

@router.get("/callback")
@router.post("/callback")
async def payment_callback(request: Request, db = Depends(get_db)):
    # 易支付 notification can be GET or POST
    if request.method == "POST":
        params = dict(await request.form())
    else:
        params = dict(request.query_params)

    if not params:
        return "fail"

    # 1. Verify Sign
    if not PaymentService.verify_callback(params):
        print(f"Payment Callback Sign Error: {params}")
        return "fail"

    # 2. Check status
    if params.get("trade_status") == "TRADE_SUCCESS":
        out_trade_no = params.get("out_trade_no")
        trade_no = params.get("trade_no")
        money = params.get("money")

        # 3. Process order
        order = db.execute(
            text("SELECT id, user_id, tier_requested, status, money FROM orders WHERE out_trade_no = :otn"),
            {"otn": out_trade_no}
        ).fetchone()

        if order and order[3] == 0: # Check if still pending
            # Verify money match (optional but recommended)
            if float(money) >= float(order[4]):
                # Update order
                db.execute(
                    text("UPDATE orders SET status = 1, trade_no = :tn WHERE id = :id"),
                    {"tn": trade_no, "id": order[0]}
                )
                
                # Update user tier and subscription
                # Set subscription end to +31 days
                db.execute(
                    text("UPDATE users SET tier = :tier, subscription_end = DATE_ADD(NOW(), INTERVAL 31 DAY), is_vip = TRUE WHERE id = :uid"),
                    {"tier": order[2], "uid": order[1]}
                )
                db.commit()
                return "success"
    
    return "success" # Return success even if already processed to stop retries
