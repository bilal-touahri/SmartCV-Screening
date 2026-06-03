import os

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cv import CV
from app.models.candidature import Candidature
from app.schemas.cv import CVOut
from app.services.cv_service import (
    validate_pdf,
    save_cv_file,
    extract_text_from_pdf,
    clean_cv_text,
    create_cv
)

router = APIRouter(
    prefix="/cv",
    tags=["CV"]
)


@router.post("/upload/{candidature_id}", response_model=CVOut, status_code=status.HTTP_201_CREATED)
async def upload_cv(
    candidature_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte non activé."
        )

    candidature = db.query(Candidature).filter(
        Candidature.id == candidature_id,
        Candidature.user_id == current_user.id
    ).first()

    if not candidature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature introuvable"
        )

    if candidature.cv:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette candidature possède déjà un CV. Utilisez PUT pour le modifier."
        )

    validate_pdf(file)

    file_path = save_cv_file(file)
    raw_text = extract_text_from_pdf(file_path)
    clean_text = clean_cv_text(raw_text)

    cv = create_cv(
        db=db,
        candidature_id=candidature_id,
        file_path=file_path,
        texte_extrait=clean_text
    )

    return cv


@router.get("/mon-cv", response_model=CVOut)
def get_my_cv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = (
        db.query(CV)
        .join(Candidature)
        .filter(Candidature.user_id == current_user.id)
        .first()
    )

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV introuvable"
        )

    return cv


@router.get("/{cv_id}/download")
def download_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.id == cv_id).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV introuvable"
        )

    if current_user.role_id == 3 and cv.candidature.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé"
        )

    if not os.path.exists(cv.chemin_fichier):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier CV introuvable"
        )

    return FileResponse(
        path=cv.chemin_fichier,
        filename=os.path.basename(cv.chemin_fichier),
        media_type="application/pdf"
    )


@router.get("/{cv_id}", response_model=CVOut)
def get_cv_by_id(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.id == cv_id).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV introuvable"
        )

    if current_user.role_id == 3 and cv.candidature.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé"
        )

    return cv


@router.put("/{cv_id}", response_model=CVOut)
async def update_cv(
    cv_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.id == cv_id).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV introuvable"
        )

    if current_user.role_id == 3 and cv.candidature.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé"
        )

    validate_pdf(file)

    file_path = save_cv_file(file)
    raw_text = extract_text_from_pdf(file_path)
    clean_text = clean_cv_text(raw_text)

    cv.chemin_fichier = file_path
    cv.texte_extrait = clean_text

    db.commit()
    db.refresh(cv)

    return cv


@router.delete("/{cv_id}")
def delete_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.id == cv_id).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV introuvable"
        )

    if current_user.role_id == 3 and cv.candidature.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé"
        )

    db.delete(cv)
    db.commit()

    return {
        "message": "CV supprimé avec succès"
    }