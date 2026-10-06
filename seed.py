from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.procurement import PurchaseRequisition, PurchaseOrder, PRStatus, POStatus
from app.core.security import get_password_hash

def get_valid_kwargs(model_cls, candidate_dict):
    valid_cols = [c.name for c in model_cls.__table__.columns]
    return {k: v for k, v in candidate_dict.items() if k in valid_cols}

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Clear existing records in reverse dependency order
    db.query(PurchaseOrder).delete()
    db.query(PurchaseRequisition).delete()
    db.query(Project).delete()
    db.query(User).delete()
    db.commit()

    # 2. Seed Users
    pm = User(
        email="pm@example.com",
        full_name="Purchase Manager",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PURCHASE_MANAGER
    )
    site_eng = User(
        email="bob@example.com",
        full_name="Bob Engineer",
        hashed_password=get_password_hash("password123"),
        role=UserRole.SITE_ENGINEER
    )
    proj_head = User(
        email="head@example.com",
        full_name="Project Head",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PROJECT_HEAD
    )
    db.add_all([pm, site_eng, proj_head])
    db.commit()

    # 3. Seed Project
    proj_candidates = {
        "name": "Metro Line Expansion - Sector 4",
        "location": "Sector 4, New Delhi",
        "budget": 1500000.0,
        "owner_id": proj_head.id,
        "user_id": proj_head.id,
        "created_by_id": proj_head.id
    }
    project = Project(**get_valid_kwargs(Project, proj_candidates))
    db.add(project)
    db.commit()

    # 4. Seed Purchase Requisition (PR)
    pr_candidates = {
        "project_id": project.id,
        "item_name": "Cement Grade 53",
        "quantity": 200,
        "estimated_cost": 85000.0,
        "status": PRStatus.APPROVED,
        "created_by_id": site_eng.id,
        "requested_by_id": site_eng.id,
        "user_id": site_eng.id
    }
    pr = PurchaseRequisition(**get_valid_kwargs(PurchaseRequisition, pr_candidates))
    db.add(pr)
    db.commit()

    # 5. Seed Purchase Order (PO #1) matching exact schema (pr_id, agreed_price)
    po_candidates = {
        "pr_id": pr.id,
        "requisition_id": pr.id,
        "vendor_name": "UltraTech Building Solutions",
        "agreed_price": 85000.0,
        "total_price": 85000.0,
        "status": POStatus.ISSUED,
        "issued_by_id": pm.id,
        "created_by_id": pm.id,
        "user_id": pm.id
    }
    po = PurchaseOrder(**get_valid_kwargs(PurchaseOrder, po_candidates))
    db.add(po)
    db.commit()

    print("Database successfully seeded!")
    print(f"Created PO ID: {po.id} for Item: '{pr.item_name}'")
    db.close()

if __name__ == "__main__":
    seed_database()