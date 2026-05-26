from fastapi import APIRouter

from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.cv import router as cv_router
from app.api.endpoints.offres import router as offres_router
from app.api.endpoints.candidatures import router as candidatures_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(offres_router)
api_router.include_router(candidatures_router)
api_router.include_router(cv_router)