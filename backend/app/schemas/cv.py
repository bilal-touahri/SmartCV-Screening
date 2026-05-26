from datetime import datetime
from pydantic import BaseModel


class CVOut(BaseModel):
    id: int
    user_id: int
    chemin_fichier: str
    texte_extrait: str | None = None
    date_upload: datetime
    valide: bool

    model_config = {"from_attributes": True}