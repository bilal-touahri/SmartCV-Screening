from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class TestContrefactual(Base):
    __tablename__ = "test_contrefactual"

    id = Column(Integer, primary_key=True, index=True)

    bias_id = Column(Integer, ForeignKey("bias_analyse.id", ondelete="CASCADE"), nullable=False)

    valeur_original = Column(Text)
    valeur_modifiee = Column(Text)
    variable_modifiee = Column(String(100))

    score_original = Column(Numeric(5, 2))
    score_modifie = Column(Numeric(5, 2))
    ecart = Column(Numeric(5, 2))

    biais_detecte = Column(Boolean, default=False)

    date_test = Column(DateTime, default=datetime.utcnow)

    bias = relationship("BiasAnalyse", back_populates="tests")