from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.cv import CVOut
from app.services.cv_service import (
    validate_pdf,
    save_cv_file,
    extract_text_from_pdf,
    clean_cv_text,
    create_cv
)
from app.models.cv import CV


router = APIRouter(
    prefix="/cv",
    tags=["CV"]
)


@router.post("/upload", response_model=CVOut, status_code=status.HTTP_201_CREATED)
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte non activé."
        )

    validate_pdf(file)

    file_path = save_cv_file(file)

    raw_text = extract_text_from_pdf(file_path)
    clean_text = clean_cv_text(raw_text)

    cv = create_cv(
        db=db,
        user_id=current_user.id,
        file_path=file_path,
        texte_extrait=clean_text
    )

    return cv

@router.get("/mon-cv", response_model=CVOut)
def get_my_cv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()

    if not cv:
        raise HTTPException(
            status_code=404,
            detail="CV introuvable"
        )

    return cv


@router.get("/{cv_id}", response_model=CVOut)
def get_cv_by_id(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.id == cv_id).first()

    if not cv:
        raise HTTPException(
            status_code=404,
            detail="CV introuvable"
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
            status_code=404,
            detail="CV introuvable"
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
            status_code=404,
            detail="CV introuvable"
        )

    db.delete(cv)
    db.commit()

    return {
        "message": "CV supprimé avec succès"
    }