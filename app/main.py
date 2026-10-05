from fastapi import FastAPI
from app.core.config import settings
from app.db.session import engine, Base
import app.db.base  # Imports all SQLAlchemy models

# Direct imports avoid circular dependencies
from app.routers.auth import router as auth_router
from app.routers.project import router as project_router
from app.routers.user import router as user_router
from app.routers.pr import router as pr_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(user_router)
app.include_router(pr_router)

@app.get("/")
def root():
    return {"status": "online", "message": "Construction ERP API Running"}