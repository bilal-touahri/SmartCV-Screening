from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.core.config import settings


# Configuration SMTP
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


# Email d'activation
async def send_verification_email(email_to: str, code: str):
    html_content = f"""
    <html>
    <body>
        <h2>Bienvenue sur SmartCV Screening</h2>
        <p>Votre code de vérification est :</p>
        <h1 style='color: #000000; font-weight: bold;'>{code}</h1>
        <p>Veuillez saisir ce code pour activer votre compte.</p>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Activation de compte - SmartCV Screening",
        recipients=[email_to],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    print(f"Email d'activation envoyé à {email_to}")


# Email de réinitialisation
async def send_password_reset_email(email_to: str, code: str):
    html_content = f"""
    <html>
    <body>
        <h2>Réinitialisation du mot de passe</h2>
        <p>Votre code de réinitialisation est :</p>
        <h1 style='color: #000000; font-weight: bold;'>{code}</h1>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Réinitialisation du mot de passe - SmartCV Screening",
        recipients=[email_to],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    print(f"Email de réinitialisation envoyé à {email_to}")