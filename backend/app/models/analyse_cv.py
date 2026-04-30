from datetime import datetime

from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class AnalyseCV(Base):
    __tablename__ = "analyse_cv"

    id = Column(Integer, primary_key=True, index=True)

    cv_id = Column(Integer, ForeignKey("cv.id", ondelete="CASCADE"), unique=True, nullable=False)

    competences_extraites = Column(Text)
    annees_experience = Column(Integer, default=0)
    soft_skills = Column(Text)
    langues = Column(Text)
    niveau_formation = Column(String(100))

    date_analyse = Column(DateTime, default=datetime.utcnow)

    cv = relationship("CV", back_populates="analyse")