import sys
import os
import asyncio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.email_service import send_verification_email

async def test():
    await send_verification_email("smartcvscreening@gmail.com", "123456")

asyncio.run(test())