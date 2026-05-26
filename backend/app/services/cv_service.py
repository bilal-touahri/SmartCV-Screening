import os
import uuid
import fitz  # PyMuPDF
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.models.cv import CV


UPLOAD_DIR = "uploads/cv"


def validate_pdf(file: UploadFile):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seuls les fichiers PDF sont acceptés."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier doit être au format PDF."
        )


def save_cv_file(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    extension = file.filename.split(".")[-1]
    unique_name = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return file_path


def extract_text_from_pdf(file_path: str) -> str:
    text = ""

    doc = fitz.open(file_path)
    for page in doc:
        text += page.get_text()

    doc.close()
    return text.strip()


def clean_cv_text(text: str) -> str:
    """
    Nettoyage simple.
    Plus tard on pourra ajouter anonymization:
    email, téléphone, adresse, nom, etc.
    """
    return " ".join(text.split())


def create_cv(db: Session, user_id: int, file_path: str, texte_extrait: str):
    cv = CV(
        user_id=user_id,
        chemin_fichier=file_path,
        texte_extrait=texte_extrait,
        valide=True
    )

    db.add(cv)
    db.commit()
    db.refresh(cv)

    return cv