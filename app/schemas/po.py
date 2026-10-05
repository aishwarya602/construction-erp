from pydantic import BaseModel
from datetime import datetime
from app.models.procurement import POStatus

class POCreate(BaseModel):
    pr_id: int
    vendor_name: str
    agreed_price: float

class POOut(BaseModel):
    id: int
    pr_id: int
    vendor_name: str
    agreed_price: float
    status: POStatus
    created_at: datetime

    class Config:
        from_attributes = True