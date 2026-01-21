from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from app.schemas.auth import Token, UserCreate, User, VerificationRequest, PasswordReset
from app.services.email_service import EmailService
from app.db.session import SessionLocal
from sqlalchemy import text

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.execute(
        text("SELECT id, username, email, is_vip, tier, subscription_end, tarot_used_today, bazi_used_today, is_superuser FROM users WHERE username = :username"),
        {"username": username}
    ).fetchone()
    
    if user is None:
        raise credentials_exception
    
    tier = user[4]
    LIMITS = {
        'free': {'tarot': 1, 'bazi': 5},
        'vip': {'tarot': 20, 'bazi': 100},
        'svip': {'tarot': 80, 'bazi': 300}
    }
    user_limits = LIMITS.get(tier, LIMITS['free'])
        
    return User(
        id=user[0],
        username=user[1], 
        email=user[2], 
        is_vip=bool(user[3]), 
        tier=tier,
        subscription_end=user[5].isoformat() if user[5] else None,
        tarot_used_today=user[6],
        bazi_used_today=user[7],
        is_superuser=bool(user[8]),
        tarot_limit=user_limits['tarot'],
        bazi_limit=user_limits['bazi']
    )

async def get_current_active_superuser(current_user: Annotated[User, Depends(get_current_user)]):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@router.post("/send-code")
async def send_verification_code(req: VerificationRequest, db = Depends(get_db)):
    # If resetting, check if email exists
    if req.type == "reset":
        user = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": req.email}).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="该邮箱未注册")
    
    # If registering, check if email taken
    if req.type == "register":
        user = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": req.email}).fetchone()
        if user:
            raise HTTPException(status_code=400, detail="该邮箱已被注册")

    success = await EmailService.send_verification_code(req.email)
    if not success:
        raise HTTPException(status_code=500, detail="邮件发送失败，请稍后再试")
    return {"status": "success", "message": "验证码已发送至您的邮箱"}

@router.post("/reset-password")
async def reset_password(req: PasswordReset, db = Depends(get_db)):
    # 1. Verify code
    is_valid = await EmailService.verify_code(req.email, req.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="验证码错误或已过期")
    
    # 2. Update password
    hashed_pw = get_password_hash(req.new_password)
    result = db.execute(
        text("UPDATE users SET hashed_password = :pw WHERE email = :email"),
        {"pw": hashed_pw, "email": req.email}
    )
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="更新失败，用户未找到")
        
    return {"status": "success", "message": "密码重置成功"}

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db = Depends(get_db)
):
    try:
        # Check both username and email
        result = db.execute(
            text("SELECT username, hashed_password FROM users WHERE username = :identifier OR email = :identifier"),
            {"identifier": form_data.username}
        ).fetchone()
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="账号或密码错误",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        user_in_db = {"username": result[0], "hashed_password": result[1]}
        
        if not verify_password(form_data.password, user_in_db["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_in_db["username"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db = Depends(get_db)):
    try:
        # 1. Verify Email Code
        is_valid = await EmailService.verify_code(user.email, user.code)
        if not is_valid:
            raise HTTPException(status_code=400, detail="验证码错误或已过期")

        # 2. Check if user exists
        existing_user = db.execute(
            text("SELECT id FROM users WHERE username = :username OR email = :email"),
            {"username": user.username, "email": user.email}
        ).fetchone()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名或邮箱已被注册"
            )
            
        hashed_password = get_password_hash(user.password)
        
        # 3. Insert user
        result = db.execute(
            text("INSERT INTO users (username, hashed_password, email) VALUES (:username, :password, :email)"),
            {"username": user.username, "password": hashed_password, "email": user.email}
        )
        db.commit()
        new_id = result.lastrowid
        
        return User(id=new_id, username=user.username, email=user.email)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Register error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )
