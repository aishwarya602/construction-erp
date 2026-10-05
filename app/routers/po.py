from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.procurement import PurchaseOrder, PurchaseRequisition, PRStatus, POStatus
from app.models.user import User, UserRole
from app.schemas.po import POCreate, POOut
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/orders", tags=["Purchase Orders"])

@router.post("/", response_model=POOut, status_code=status.HTTP_201_CREATED)
def create_purchase_order(
    po_in: POCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.PURCHASE_MANAGER]))
):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == po_in.pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase Requisition not found")
    
    if pr.status != PRStatus.APPROVED:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot issue PO for a PR with status '{pr.status}'. PR must be APPROVED."
        )

    po = PurchaseOrder(
        pr_id=po_in.pr_id,
        vendor_name=po_in.vendor_name,
        agreed_price=po_in.agreed_price,
        status=POStatus.ISSUED
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    return po

@router.get("/", response_model=List[POOut])
def list_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(PurchaseOrder).all()