from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Candidature(Base):
    __tablename__ = "candidatures"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offre_id = Column(Integer, ForeignKey("offres.id", ondelete="CASCADE"), nullable=False)
    cv_id = Column(Integer, ForeignKey("cv.id", ondelete="CASCADE"), nullable=False)

    date_depot = Column(DateTime, default=datetime.utcnow)
    statut = Column(String(30), default="en_attente")

    __table_args__ = (
        UniqueConstraint("user_id", "offre_id", name="unique_candidature"),
    )

    user = relationship("User")
    offre = relationship("Offre", back_populates="candidatures")
    cv = relationship("CV", back_populates="candidature")
    score = relationship("ScoreMatching", back_populates="candidature", uselist=False)