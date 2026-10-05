from pydantic import BaseModel, Field

class AnomalyCheckRequest(BaseModel):
    grn_id: int
    quantity_ordered: float = Field(..., gt=0)
    quantity_received: float = Field(..., gt=0)
    unit_price_quoted: float = Field(..., gt=0)
    unit_price_billed: float = Field(..., gt=0)

class AnomalyCheckResponse(BaseModel):
    grn_id: int
    is_anomaly: bool
    anomaly_score: float
    qty_discrepancy_percent: float
    price_discrepancy_percent: float
    total_overcharge_amount: float
    recommendation: str