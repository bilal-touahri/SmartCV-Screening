from fastapi import FastAPI

from app.api.router import api_router
from app.core.database import Base, engine

# Import models (important)
from app.models.role import Role
from app.models.user import User
from app.models.verification_token import VerificationToken

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartCV Screening API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "API prête"}

app.include_router(api_router)