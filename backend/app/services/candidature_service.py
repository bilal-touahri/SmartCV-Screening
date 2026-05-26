from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.analyse_cv import AnalyseCV
from app.services.ai_client_service import analyse_cv_with_ai
from app.models.candidature import Candidature
from app.models.cv import CV
from app.models.offre import Offre
from app.models.user import User
from app.services.cv_service import (
    validate_pdf,
    save_cv_file,
    extract_text_from_pdf,
    clean_cv_text,
)


def postuler_a_offre(
    db: Session,
    offre_id: int,
    file: UploadFile,
    current_user: User
):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte non activé"
        )

    if current_user.role_id != 3:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un candidat peut postuler à une offre"
        )

    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre introuvable"
        )

    if offre.statut != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette offre n'est pas active"
        )

    existing = db.query(Candidature).filter(
        Candidature.user_id == current_user.id,
        Candidature.offre_id == offre_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous avez déjà postulé à cette offre"
        )

    validate_pdf(file)

    file_path = save_cv_file(file)
    raw_text = extract_text_from_pdf(file_path)
    clean_text = clean_cv_text(raw_text)

    candidature = Candidature(
        user_id=current_user.id,
        offre_id=offre_id,
        statut="en_attente"
    )

    db.add(candidature)
    db.flush()

    cv = CV(
        candidature_id=candidature.id,
        chemin_fichier=file_path,
        texte_extrait=clean_text,
        valide=True
    )

    db.add(cv)
    db.flush()

    ai_result = analyse_cv_with_ai(clean_text)

    analyse = AnalyseCV(
        cv_id=cv.id,
        competences_extraites=", ".join(ai_result.get("competences", [])),
        annees_experience=ai_result.get("annees_experience", 0),
        soft_skills=", ".join(ai_result.get("soft_skills", [])),
        langues=", ".join(ai_result.get("langues", [])),
        niveau_formation=ai_result.get("niveau_formation")
    )

    db.add(analyse)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidature déjà existante pour cette offre"
        )

    db.refresh(candidature)

    return candidature


def get_mes_candidatures(db: Session, current_user: User):
    return db.query(Candidature).filter(
        Candidature.user_id == current_user.id
    ).order_by(Candidature.date_depot.desc()).all()


def get_candidatures_by_offre(
    db: Session,
    offre_id: int,
    current_user: User
):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre introuvable"
        )

    if current_user.role_id != 1 and offre.recruteur_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de consulter ces candidatures"
        )

    return db.query(Candidature).filter(
        Candidature.offre_id == offre_id
    ).order_by(Candidature.date_depot.desc()).all()


def get_candidature_by_id(
    db: Session,
    candidature_id: int,
    current_user: User
):
    candidature = db.query(Candidature).filter(
        Candidature.id == candidature_id
    ).first()

    if not candidature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature introuvable."
        )

    if candidature.user_id != current_user.id and current_user.role_id not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit."
        )

    return candidature


def delete_candidature(
    db: Session,
    candidature_id: int,
    current_user: User
):
    candidature = db.query(Candidature).filter(
        Candidature.id == candidature_id
    ).first()

    if not candidature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature introuvable."
        )

    if candidature.user_id != current_user.id and current_user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit."
        )

    db.delete(candidature)
    db.commit()

    return {
        "message": "Candidature supprimée avec succès."
    }


def update_candidature_status(
    db: Session,
    candidature_id: int,
    new_status: str,
    current_user: User
):
    candidature = db.query(Candidature).filter(
        Candidature.id == candidature_id
    ).first()

    if not candidature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature introuvable."
        )

    offre = db.query(Offre).filter(
        Offre.id == candidature.offre_id
    ).first()

    if not offre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre introuvable."
        )

    if offre.user_id != current_user.id and current_user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit."
        )

    candidature.statut = new_status

    db.commit()
    db.refresh(candidature)

    return candidature