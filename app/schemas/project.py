from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Schema for creating a new Project
class ProjectCreate(BaseModel):
    name: str
    location: str
    budget: float = 0.0

# Schema for returning Project data
class ProjectOut(BaseModel):
    id: int
    name: str
    location: str
    budget: float
    created_at: datetime

    class Config:
        from_attributes = True