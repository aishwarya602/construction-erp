from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.procurement import PurchaseRequisition, PRStatus
from app.models.user import User, UserRole
from app.schemas.pr import PRCreate, PROut, PRStatusUpdate
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/requisitions", tags=["Purchase Requisitions"])

@router.post("/", response_model=PROut, status_code=status.HTTP_201_CREATED)
def create_requisition(
    pr_in: PRCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SITE_ENGINEER]))
):
    pr = PurchaseRequisition(
        **pr_in.model_dump(),
        requested_by_id=current_user.id,
        status=PRStatus.PENDING
    )
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr

@router.get("/", response_model=List[PROut])
def list_requisitions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(PurchaseRequisition).all()

@router.patch("/{pr_id}/status", response_model=PROut)
def update_pr_status(
    pr_id: int,
    status_update: PRStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.PROJECT_HEAD]))
):
    pr = db.query(PurchaseRequisition).filter(PurchaseRequisition.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase Requisition not found")
    
    pr.status = status_update.status
    db.commit()
    db.refresh(pr)
    return pr