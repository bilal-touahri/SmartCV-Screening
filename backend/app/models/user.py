from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(300), nullable=False)
    is_active = Column(Boolean, default=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), default=3, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tokens = relationship(
        "VerificationToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    offres = relationship(
    "Offre",
    back_populates="recruteur",
    cascade="all, delete-orphan"
    )

    candidatures = relationship(
    "Candidature",
    back_populates="candidat",
    cascade="all, delete-orphan"
    )