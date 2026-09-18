from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.project import Project
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectOut
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.PROJECT_HEAD]))
):
    project = Project(
        name=project_in.name,
        location=project_in.location,
        budget=project_in.budget
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Project).all()