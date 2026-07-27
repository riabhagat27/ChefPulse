from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(..., description="Must be 'customer' or 'admin'")
    restaurant_name: Optional[str] = Field(None, max_length=100)

    @model_validator(mode="after")
    def validate_passwords_and_role(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        
        normalized_role = self.role.lower().strip()
        if normalized_role not in ["customer", "admin"]:
            raise ValueError("role must be 'customer' or 'admin'")
        
        self.role = normalized_role
        
        if normalized_role == "admin" and not self.restaurant_name:
            raise ValueError("restaurant name is required for restaurant administrators")
            
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    restaurant_name: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    restaurant_name: Optional[str] = None
    password: Optional[str] = None

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str
