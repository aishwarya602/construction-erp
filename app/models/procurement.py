import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Boolean
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

# (Keep existing PRStatus and POStatus enums, PurchaseRequisition, PurchaseOrder models)

class GoodsReceivedNote(Base):
    __tablename__ = "goods_received_notes"

    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    quantity_received = Column(Integer, nullable=False)
    unit_price_billed = Column(Float, nullable=False)
    received_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Anomaly / Fraud Audit Fields
    is_flagged_for_audit = Column(Boolean, default=False)
    anomaly_score = Column(Float, nullable=True)
    audit_notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    purchase_order = relationship("PurchaseOrder")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    item_name = Column(String, nullable=False)
    current_stock = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)