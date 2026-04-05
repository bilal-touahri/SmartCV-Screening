import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.auth import UserCreate

user = UserCreate(
    full_name="Bilal Touahri",
    email="bilal@example.com",
    password="azerty123"
)

print(user)