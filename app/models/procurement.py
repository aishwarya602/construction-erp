import enum
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class PRStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"

    
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    status = Column(Enum(PRStatus), default=PRStatus.PENDING, nullable=False)
    
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    requested_by = relationship("User")