from fastapi import APIRouter, Depends
from app.schemas.anomaly import AnomalyCheckRequest, AnomalyCheckResponse
from app.services.anomaly_detection import detect_grn_anomaly
from app.models.user import User, UserRole
from app.core.deps import require_roles

router = APIRouter(prefix="/analytics/anomaly", tags=["Fraud & Anomaly Detection"])

@router.post("/check-grn", response_model=AnomalyCheckResponse)
def check_grn_for_fraud(
    payload: AnomalyCheckRequest,
    current_user: User = Depends(require_roles([UserRole.PURCHASE_MANAGER, UserRole.PROJECT_HEAD]))
):
    analysis = detect_grn_anomaly(
        quantity_ordered=payload.quantity_ordered,
        quantity_received=payload.quantity_received,
        unit_price_quoted=payload.unit_price_quoted,
        unit_price_billed=payload.unit_price_billed
    )

    return AnomalyCheckResponse(
        grn_id=payload.grn_id,
        **analysis
    )