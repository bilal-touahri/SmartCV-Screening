import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.user import User
from app.models.verification_token import VerificationToken

print("Models importés avec succès :", User.__tablename__, VerificationToken.__tablename__)