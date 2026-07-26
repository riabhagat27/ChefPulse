from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, Token
from app.services.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api", tags=["authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
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
