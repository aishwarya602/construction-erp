import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class UserRole(str, enum.Enum):
    PROJECT_HEAD = "PROJECT_HEAD"
    PURCHASE_MANAGER = "PURCHASE_MANAGER"
    PURCHASE_HEAD = "PURCHASE_HEAD"
    SITE_ENGINEER = "SITE_ENGINEER"
    VENDOR = "VENDOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())