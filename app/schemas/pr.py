from pydantic import BaseModel
from datetime import datetime
from app.models.procurement import PRStatus

class PRCreate(BaseModel):
    item_name: str
    quantity: int
    estimated_cost: float
    project_id: int

class PRStatusUpdate(BaseModel):
    status: PRStatus

class PROut(BaseModel):
    id: int
    item_name: str
    quantity: int
    estimated_cost: float
    status: PRStatus
    project_id: int
    requested_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True