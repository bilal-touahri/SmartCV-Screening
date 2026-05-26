from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.offre import OffreCreate, OffreResponse, OffreUpdate
from app.services.offre_service import (
    create_offre,
    delete_offre,
    get_all_offres,
    get_offre_by_id,
    update_offre,
)

from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/offres",
    tags=["Offres"]
)


@router.post("/", response_model=OffreResponse)
def ajouter_offre(
    offre_data: OffreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_offre(db, offre_data, current_user)


@router.get("/", response_model=List[OffreResponse])
def lister_offres(
    db: Session = Depends(get_db)
):
    return get_all_offres(db)


@router.get("/{offre_id}", response_model=OffreResponse)
def detail_offre(
    offre_id: int,
    db: Session = Depends(get_db)
):
    return get_offre_by_id(db, offre_id)


@router.put("/{offre_id}", response_model=OffreResponse)
def modifier_offre(
    offre_id: int,
    offre_data: OffreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_offre(db, offre_id, offre_data, current_user)


@router.delete("/{offre_id}")
def supprimer_offre(
    offre_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_offre(db, offre_id, current_user)