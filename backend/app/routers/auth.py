from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserOTP
from app.schemas.user import UserRegister, UserLogin, UserOut, Token, ProfileUpdate, OTPRequest, OTPVerify
from app.services.auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime, timezone, timedelta
from app.services.email import send_otp_email
import random

router = APIRouter(prefix="/api", tags=["authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email is already registered"
        )
    
    # Create database user
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        restaurant_name=user_in.restaurant_name if user_in.role == "admin" else None
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create admin notification
    from app.models.notification import Notification
    from app.services.websocket import manager
    
    new_notif = Notification(
        user_id=None,
        text=f"New Customer Registered: {new_user.full_name} ({new_user.email})"
    )
    db.add(new_notif)
    db.commit()

    # Broadcast register notification to websocket
    await manager.broadcast({
        "event": "new_notification",
        "role": "admin",
        "text": f"New Customer Profile Registered: {new_user.full_name}",
        "type": "success"
    })
    await manager.broadcast({"event": "notification_created"})

    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    # Look up user
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="invalid email or password"
        )
    
    # Create token
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_in: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication required"
        )
        
    if profile_in.full_name is not None:
        name = profile_in.full_name.strip()
        if len(name) < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name cannot be blank."
            )
        current_user.full_name = name
        
    if profile_in.restaurant_name is not None and current_user.role == "admin":
        rest_name = profile_in.restaurant_name.strip()
        if len(rest_name) < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant name cannot be blank."
            )
        current_user.restaurant_name = rest_name
        
    if profile_in.password is not None:
        pwd = profile_in.password.strip()
        if len(pwd) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters."
            )
        current_user.hashed_password = get_password_hash(pwd)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/otp/request")
def request_otp(otp_in: OTPRequest, db: Session = Depends(get_db)):
    email = otp_in.email.strip().lower()
    
    # 1. Verify user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="email address not registered in our system"
        )
        
    # 2. Check rate limit
    recent_otp = db.query(UserOTP).filter(UserOTP.email == email).order_by(UserOTP.created_at.desc()).first()
    if recent_otp and (datetime.utcnow() - recent_otp.created_at).total_seconds() < 60:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please wait 60 seconds before requesting another OTP resend."
        )
        
    # 3. Generate secure 6-digit OTP
    otp = random.randint(100000, 999999)
    hashed_otp = get_password_hash(str(otp))
    
    # 4. Invalidate prior OTPs
    db.query(UserOTP).filter(UserOTP.email == email).delete()
    db.commit()
    
    # 5. Create OTP registry
    new_otp = UserOTP(
        email=email,
        hashed_otp=hashed_otp,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(new_otp)
    db.commit()
    
    # 6. Deliver OTP code (real SMTP or development console fallback)
    sent_via_smtp = send_otp_email(email, str(otp))
    
    response_payload = {
        "message": "A secure 6-digit OTP code has been dispatched to your email address."
    }
    if not sent_via_smtp:
        response_payload["otp_preview"] = str(otp)
        
    return response_payload

@router.post("/otp/verify", response_model=Token)
def verify_otp(verify_in: OTPVerify, db: Session = Depends(get_db)):
    email = verify_in.email.strip().lower()
    otp_val = verify_in.otp.strip()
    
    # 1. Verify user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="email address not registered in our system"
        )
        
    # 2. Find latest active OTP
    user_otp = db.query(UserOTP).filter(UserOTP.email == email).first()
    if not user_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP request found for this email. Please request a new code."
        )
        
    # 3. Check expiration
    if datetime.utcnow() > user_otp.expires_at:
        db.delete(user_otp)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification code has expired (5 minutes limit). Please request a new code."
        )
        
    # 4. Check attempts
    if user_otp.attempts >= 3:
        db.delete(user_otp)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many verification attempts failed. Please request a new OTP."
        )
        
    # 5. Verify hashed OTP
    if not verify_password(otp_val, user_otp.hashed_otp):
        user_otp.attempts += 1
        db.commit()
        remaining = 3 - user_otp.attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempts remaining."
        )
        
    # 6. Delete OTP on successful login
    db.delete(user_otp)
    db.commit()
    
    # 7. Create token and response payload
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
