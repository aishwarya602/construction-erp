from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.procurement import GoodsReceivedNote, PurchaseOrder, InventoryItem
from app.models.user import User, UserRole
from app.schemas.grn import GRNCreate, GRNOut
from app.core.deps import get_current_user, require_roles
from app.services.anomaly_detection import detect_grn_anomaly

router = APIRouter(prefix="/grn", tags=["Goods Received Notes (GRN)"])

@router.post("/", response_model=GRNOut, status_code=status.HTTP_201_CREATED)
def create_grn(
    grn_in: GRNCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SITE_ENGINEER, UserRole.PROJECT_HEAD]))
):
    # 1. Fetch related Purchase Order and Requisition
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == grn_in.po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    pr = po.requisition
    unit_price_quoted = pr.estimated_cost / pr.quantity if pr.quantity > 0 else 0

    # 2. Run ML Fraud & Anomaly Detection
    anomaly_result = detect_grn_anomaly(
        quantity_ordered=pr.quantity,
        quantity_received=grn_in.quantity_received,
        unit_price_quoted=unit_price_quoted,
        unit_price_billed=grn_in.unit_price_billed
    )

    # 3. Create GRN Record
    grn = GoodsReceivedNote(
        po_id=grn_in.po_id,
        quantity_received=grn_in.quantity_received,
        unit_price_billed=grn_in.unit_price_billed,
        received_by_id=current_user.id,
        is_flagged_for_audit=anomaly_result["is_anomaly"],
        anomaly_score=anomaly_result["anomaly_score"],
        audit_notes=anomaly_result["recommendation"]
    )
    db.add(grn)

    # 4. If transaction passes audit, update Project Inventory Stock
    if not anomaly_result["is_anomaly"]:
        inventory_item = db.query(InventoryItem).filter(
            InventoryItem.project_id == pr.project_id,
            InventoryItem.item_name == pr.item_name
        ).first()

        if inventory_item:
            inventory_item.current_stock += grn_in.quantity_received
        else:
            new_item = InventoryItem(
                project_id=pr.project_id,
                item_name=pr.item_name,
                current_stock=grn_in.quantity_received
            )
            db.add(new_item)

    db.commit()
    db.refresh(grn)
    return grn

@router.get("/", response_model=List[GRNOut])
def list_grns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(GoodsReceivedNote).all()