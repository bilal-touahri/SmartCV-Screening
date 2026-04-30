from datetime import datetime

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class BiasAnalyse(Base):
    __tablename__ = "bias_analyse"

    id = Column(Integer, primary_key=True, index=True)

    score_id = Column(Integer, ForeignKey("score_matching.id", ondelete="CASCADE"), nullable=False)

    type_biais = Column(String(100))
    groupe_reference = Column(String(100))
    taux_selection = Column(Numeric(5, 2))
    ecart_mesure = Column(Numeric(5, 2))

    date_analyse = Column(DateTime, default=datetime.utcnow)

    score = relationship("ScoreMatching", back_populates="biases")
    tests = relationship("TestContrefactual", back_populates="bias", cascade="all, delete")