from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class CV(Base):
    __tablename__ = "cv"

    id = Column(Integer, primary_key=True, index=True)

    candidature_id = Column(
        Integer,
        ForeignKey("candidatures.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    chemin_fichier = Column(String(255), nullable=False)
    texte_extrait = Column(Text)

    date_upload = Column(DateTime, default=datetime.utcnow)
    valide = Column(Boolean, default=True)

    candidature = relationship("Candidature", back_populates="cv")
    analyse = relationship("AnalyseCV", back_populates="cv", uselist=False)