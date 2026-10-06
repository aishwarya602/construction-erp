from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class GRNCreate(BaseModel):
    po_id: int
    quantity_received: int = Field(..., gt=0)
    unit_price_billed: float = Field(..., gt=0)

class GRNOut(BaseModel):
    id: int
    po_id: int
    quantity_received: int
    unit_price_billed: float
    is_flagged_for_audit: bool
    anomaly_score: Optional[float]
    audit_notes: Optional[str]
    received_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True