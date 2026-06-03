from typing import List

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.candidature import (
    CandidatureResponse,
    CandidatureStatusUpdate,
    ClassementCandidatResponse,
)
from app.services.candidature_service import (
    postuler_a_offre,
    get_mes_candidatures,
    get_candidatures_by_offre,
    get_candidature_by_id,
    delete_candidature,
    update_candidature_status,
    get_classement_by_offre,
)


router = APIRouter(
    prefix="/candidatures",
    tags=["Candidatures"]
)


@router.post(
    "/{offre_id}/postuler",
    response_model=CandidatureResponse,
    status_code=status.HTTP_201_CREATED
)
async def postuler(
    offre_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return postuler_a_offre(db, offre_id, file, current_user)


@router.get("/mes-candidatures", response_model=List[CandidatureResponse])
def mes_candidatures(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_mes_candidatures(db, current_user)


@router.get("/offre/{offre_id}", response_model=List[CandidatureResponse])
def candidatures_offre(
    offre_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_candidatures_by_offre(db, offre_id, current_user)


@router.get(
    "/offre/{offre_id}/classement",
    response_model=List[ClassementCandidatResponse]
)
def classement_offre(
    offre_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_classement_by_offre(db, offre_id, current_user)

@router.get("/{candidature_id}", response_model=CandidatureResponse)
def detail_candidature(
    candidature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_candidature_by_id(db, candidature_id, current_user)


@router.delete("/{candidature_id}")
def supprimer_candidature(
    candidature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_candidature(db, candidature_id, current_user)


@router.put("/{candidature_id}/statut", response_model=CandidatureResponse)
def modifier_statut_candidature(
    candidature_id: int,
    payload: CandidatureStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_candidature_status(
        db=db,
        candidature_id=candidature_id,
        new_status=payload.statut,
        current_user=current_user
    )