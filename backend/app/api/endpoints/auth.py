from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import (
    UserCreate,
    UserOut,
    VerifyCodeRequest,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services.auth_service import (
    get_user_by_email,
    create_user,
    create_verification_code,
    get_verification_token,
    activate_user,
    delete_token,
    authenticate_user,
    generate_login_response,
    update_user_password
)
from app.services.email_service import (
    send_verification_email,
    send_password_reset_email
)

from app.core.security import (
    get_current_user,
    verify_password
)

from app.models.user import User

from app.schemas.auth import (
    UserUpdate,
    ChangePasswordRequest
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# REGISTER
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing = get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet e-mail est déjà utilisé."
        )

    new_user = create_user(db=db, user=user_in)

    code = create_verification_code(db=db, user_id=new_user.id)
    background_tasks.add_task(
        send_verification_email,
        email_to=new_user.email,
        code=code
    )

    return new_user


# VERIFY EMAIL
@router.post("/verify-email")
async def verify_email(
    data: VerifyCodeRequest,
    db: Session = Depends(get_db)
):
    token = get_verification_token(
        db=db,
        email=data.email,
        code=data.code,
        token_type="activation"
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code invalide ou expiré."
        )

    user = token.user

    if not user.is_active:
        activate_user(db, user)

    delete_token(db, token)

    return {"message": "Compte activé avec succès"}


# LOGIN
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compte non activé"
        )

    return generate_login_response(user)


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=UserOut)
async def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.full_name = data.full_name

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/me/password")
async def update_my_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(
        data.current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Mot de passe actuel incorrect"
        )

    update_user_password(
        db,
        current_user,
        data.new_password
    )

    return {
        "message": "Mot de passe modifié avec succès"
    }


# FORGOT PASSWORD
@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, data.email)

    if user and user.is_active:
        code = create_verification_code(db, user.id, token_type="reset")

        background_tasks.add_task(
            send_password_reset_email,
            email_to=user.email,
            code=code
        )

    return {
        "message": "Si un compte existe, un code a été envoyé."
    }


# RESET PASSWORD
@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    token = get_verification_token(
        db=db,
        email=data.email,
        code=data.code,
        token_type="reset"
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code invalide ou expiré"
        )

    user = token.user

    update_user_password(db, user, data.new_password)
    delete_token(db, token)

    return {"message": "Mot de passe mis à jour"}