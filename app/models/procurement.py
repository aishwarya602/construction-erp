import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class PRStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class POStatus(str, enum.Enum):
    ISSUED = "ISSUED"
    FULFILLED = "FULFILLED"
    CANCELLED = "CANCELLED"

class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    status = Column(Enum(PRStatus), default=PRStatus.PENDING, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("purchase_requisitions.id"), nullable=False)
    vendor_name = Column(String, nullable=False)
    agreed_price = Column(Float, nullable=False)
    status = Column(Enum(POStatus), default=POStatus.ISSUED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    requisition = relationship("PurchaseRequisition")