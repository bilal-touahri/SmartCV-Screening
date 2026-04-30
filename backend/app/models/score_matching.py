from datetime import datetime

from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class ScoreMatching(Base):
    __tablename__ = "score_matching"

    id = Column(Integer, primary_key=True, index=True)

    candidature_id = Column(Integer, ForeignKey("candidatures.id", ondelete="CASCADE"), unique=True, nullable=False)

    score_globale = Column(Numeric(5, 2), default=0)
    score_competences = Column(Numeric(5, 2), default=0)
    score_experiences = Column(Numeric(5, 2), default=0)
    score_formation = Column(Numeric(5, 2), default=0)

    rang = Column(Integer)

    date_calcul = Column(DateTime, default=datetime.utcnow)

    candidature = relationship("Candidature", back_populates="score")
    biases = relationship("BiasAnalyse", back_populates="score", cascade="all, delete")