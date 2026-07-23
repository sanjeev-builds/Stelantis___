import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./.chroma")

if not GEMINI_API_KEY:
    # Don't raise at import time - lets the rest of the app boot without
    # AI configured yet, since GEMINI_API_KEY is usually the last thing
    # a team plugs in during setup.
    pass
