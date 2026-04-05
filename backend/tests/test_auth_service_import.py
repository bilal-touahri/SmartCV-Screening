import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.auth_service import get_user_by_email, create_user

print("Auth service importé avec succès")