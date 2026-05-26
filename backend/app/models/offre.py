from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Offre(Base):
    __tablename__ = "offres"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    competences = Column(Text)
    experience = Column(String(100))
    niveau_etudes = Column(String(100))

    date_creation = Column(DateTime, default=datetime.utcnow)
    date_limite = Column(Date)

    statut = Column(String(30), default="active")

    recruteur_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    recruteur = relationship("User", back_populates="offres")
    
    candidatures = relationship(
    "Candidature",
    back_populates="offre",
    cascade="all, delete-orphan"
    )