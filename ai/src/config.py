import os

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

if not GROQ_API_KEY:
    # Don't raise at import time - lets the rest of the app boot without
    # AI configured yet, since GROQ_API_KEY is usually the last thing
    # a team plugs in during setup.
    pass
