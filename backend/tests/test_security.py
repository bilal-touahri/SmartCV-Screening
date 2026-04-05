import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import get_password_hash, verify_password, create_access_token

password = "azerty123"

hashed = get_password_hash(password)
print("Hashed password:", hashed)

is_valid = verify_password("azerty123", hashed)
print("Password correct ?", is_valid)

token = create_access_token({"sub": "test@example.com"})
print("JWT token:", token)