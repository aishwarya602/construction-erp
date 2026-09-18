from fastapi import FastAPI
from app.core.config import settings
from app.db.session import engine, Base
import app.models
from app.routers import auth, project, user

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth.router)
app.include_router(project.router)
app.include_router(user.router)

@app.get("/")
def root():
    return {"status": "online", "message": "Construction ERP API Running"}