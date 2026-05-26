from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.offre import Offre
from app.models.user import User
from app.schemas.offre import OffreCreate, OffreUpdate


def check_admin_or_recruiter(user: User):
    if user.role_id not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un recruteur ou un administrateur peut gérer les offres"
        )


def create_offre(db: Session, offre_data: OffreCreate, current_user: User):
    check_admin_or_recruiter(current_user)

    offre = Offre(
        title=offre_data.title,
        description=offre_data.description,
        competences=offre_data.competences,
        experience=offre_data.experience,
        niveau_etudes=offre_data.niveau_etudes,
        date_limite=offre_data.date_limite,
        recruteur_id=current_user.id
    )

    db.add(offre)
    db.commit()
    db.refresh(offre)

    return offre


def get_all_offres(db: Session):
    return db.query(Offre).order_by(Offre.date_creation.desc()).all()


def get_offre_by_id(db: Session, offre_id: int):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre introuvable"
        )

    return offre


def update_offre(db: Session, offre_id: int, offre_data: OffreUpdate, current_user: User):
    offre = get_offre_by_id(db, offre_id)

    if current_user.role_id != 1 and offre.recruteur_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de modifier cette offre"
        )

    update_data = offre_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(offre, key, value)

    db.commit()
    db.refresh(offre)

    return offre


def delete_offre(db: Session, offre_id: int, current_user: User):
    offre = get_offre_by_id(db, offre_id)

    if current_user.role_id != 1 and offre.recruteur_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer cette offre"
        )

    db.delete(offre)
    db.commit()

    return {"message": "Offre supprimée avec succès"}