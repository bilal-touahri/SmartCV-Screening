from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Candidature(Base):
    __tablename__ = "candidatures"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offre_id = Column(Integer, ForeignKey("offres.id", ondelete="CASCADE"), nullable=False)

    date_depot = Column(DateTime, default=datetime.utcnow)
    statut = Column(String(30), default="en_attente")

    candidat = relationship("User", back_populates="candidatures")
    offre = relationship("Offre", back_populates="candidatures")

    cv = relationship(
        "CV",
        back_populates="candidature",
        uselist=False,
        cascade="all, delete-orphan"
    )

    score = relationship(
        "ScoreMatching",
        back_populates="candidature",
        uselist=False,
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "offre_id", name="uq_user_offre"),
    )