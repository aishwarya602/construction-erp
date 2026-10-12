from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class PRStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PO_ISSUED = "PO_ISSUED"


class POStatus(str, enum.Enum):
    ISSUED = "ISSUED"
    PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


# 1. Master Material Item Catalog
class MasterItem(Base):
    __tablename__ = "master_items"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    unit_of_measure = Column(String, nullable=False)
    standard_unit_price = Column(Float, nullable=False)


# 2. Purchase Requisitions with WBS Location & BOQ
class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    sub_location = Column(String, nullable=False, default="General Site")
    item_id = Column(Integer, ForeignKey("master_items.id"), nullable=True)
    item_name = Column(String, nullable=False)
    
    quantity = Column(Integer, nullable=False)
    boq_allocated_qty = Column(Integer, nullable=False, default=1000)
    boq_consumed_qty = Column(Integer, nullable=False, default=0)
    
    estimated_cost = Column(Float, nullable=False)
    status = Column(SQLEnum(PRStatus), default=PRStatus.PENDING)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# 3. Purchase Order
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("purchase_requisitions.id"), nullable=False)
    vendor_name = Column(String, nullable=False)
    
    total_quantity = Column(Integer, nullable=False, default=0)
    remaining_quantity = Column(Integer, nullable=False, default=0)
    
    agreed_price = Column(Float, nullable=False)
    status = Column(SQLEnum(POStatus), default=POStatus.ISSUED)
    issued_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# 4. Goods Received Note (GRN)
class GoodsReceivedNote(Base):
    __tablename__ = "goods_received_notes"

    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    quantity_received = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    is_flagged = Column(Boolean, default=False)
    received_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# 5. Inventory Item
class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    unit_of_measure = Column(String, nullable=False, default="Units")