import random
import string
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.models.verification_token import VerificationToken
from app.schemas.auth import UserCreate


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role_id=3
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_verification_code(db: Session, user_id: int, token_type: str = "activation"):
    code = "".join(random.choices(string.digits, k=6))
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    token = VerificationToken(
        user_id=user_id,
        code=code,
        type=token_type,
        expire_at=expire_at
    )

    db.add(token)
    db.commit()
    return code


def get_verification_token(db: Session, email: str, code: str, token_type: str = "activation"):
    user = get_user_by_email(db, email)
    if not user:
        return None

    now = datetime.now(timezone.utc)

    return db.query(VerificationToken).filter(
        VerificationToken.user_id == user.id,
        VerificationToken.code == code,
        VerificationToken.type == token_type,
        VerificationToken.expire_at > now
    ).first()


def activate_user(db: Session, user: User):
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


def delete_token(db: Session, token: VerificationToken):
    db.delete(token)
    db.commit()


def update_user_password(db: Session, user: User, new_password: str):
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def generate_login_response(user: User):
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_details": user
    }