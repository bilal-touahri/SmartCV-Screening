from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OffreBase(BaseModel):
    title: str
    description: str
    competences: str
    experience: Optional[str] = None
    niveau_etudes: Optional[str] = None
    date_limite: Optional[datetime] = None


class OffreCreate(OffreBase):
    pass


class OffreUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    competences: Optional[str] = None
    experience: Optional[str] = None
    niveau_etudes: Optional[str] = None
    statut: Optional[str] = None
    date_limite: Optional[datetime] = None


class OffreResponse(OffreBase):
    id: int
    statut: str
    date_creation: datetime
    recruteur_id: int

    class Config:
        from_attributes = True