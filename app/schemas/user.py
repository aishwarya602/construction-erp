from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# Schema for User Registration
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole

# Schema for Returning User Info
class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

# Schema for JWT Token
class Token(BaseModel):
    access_token: str
    token_type: str