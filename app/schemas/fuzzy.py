from pydantic import BaseModel, Field

class VendorEvaluationRequest(BaseModel):
    vendor_id: int
    delivery_delay_days: float = Field(..., ge=0, description="Delivery delay in days")
    defect_rate_percent: float = Field(..., ge=0, le=100, description="Defect rate percentage")
    price_deviation_percent: float = Field(..., ge=0, description="Price increase percentage")

class VendorEvaluationResponse(BaseModel):
    vendor_id: int
    performance_score: float
    category: str