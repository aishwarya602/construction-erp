from fastapi import APIRouter, Depends
from app.schemas.fuzzy import VendorEvaluationRequest, VendorEvaluationResponse
from app.services.fuzzy_scoring import calculate_vendor_score
from app.models.user import User, UserRole
from app.core.deps import require_roles

router = APIRouter(prefix="/analytics/fuzzy", tags=["Fuzzy Logic Analytics"])

@router.post("/evaluate-vendor", response_model=VendorEvaluationResponse)
def evaluate_vendor(
    payload: VendorEvaluationRequest,
    current_user: User = Depends(require_roles([UserRole.PURCHASE_MANAGER, UserRole.PROJECT_HEAD]))
):
    score = calculate_vendor_score(
        delivery_delay=payload.delivery_delay_days,
        defect_rate=payload.defect_rate_percent,
        price_deviation=payload.price_deviation_percent
    )

    if score >= 75:
        category = "High Reliability / Preferred Vendor"
    elif score >= 45:
        category = "Moderate Risk / Standard Vendor"
    else:
        category = "High Risk / Underperforming Vendor"

    return VendorEvaluationResponse(
        vendor_id=payload.vendor_id,
        performance_score=score,
        category=category
    )