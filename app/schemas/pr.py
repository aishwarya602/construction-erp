from pydantic import BaseModel
from datetime import datetime
from app.models.procurement import PRStatus

class PRCreate(BaseModel):
    item_name: str
    quantity: float
    estimated_cost: float
    project_id: int

class PRUpdateStatus(BaseModel):
    status: PRStatus  # APPROVED or REJECTED

class PROut(BaseModel):
    id: int
    item_name: str
    quantity: float
    estimated_cost: float
    status: PRStatus
    project_id: int
    requested_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True