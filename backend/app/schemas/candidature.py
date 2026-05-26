from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel


class CVResponse(BaseModel):
    id: int
    chemin_fichier: str
    texte_extrait: Optional[str] = None
    date_upload: datetime
    valide: bool

    class Config:
        from_attributes = True


class CandidatureResponse(BaseModel):
    id: int
    user_id: int
    offre_id: int
    date_depot: datetime
    statut: str
    cv: Optional[CVResponse] = None

    class Config:
        from_attributes = True


class CandidatureStatusUpdate(BaseModel):
    statut: Literal["en_attente", "acceptee", "refusee"]