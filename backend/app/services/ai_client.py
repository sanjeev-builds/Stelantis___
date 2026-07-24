"""Bridges to ai/src/gemini_client.py, imported as a library per
docs/Vehicle-Health-Dashboard-Plan.md ("ai/ is a library, not a
microservice"). The path trick below works both for local dev (backend/ and
ai/ are sibling folders under the repo root) and inside the Docker image
(backend/ is copied to /app, ai/ to /ai - see backend/Dockerfile), without
depending on the PYTHONPATH env var actually being set.

Every call is wrapped so a missing/invalid GEMINI_API_KEY or a Gemini API
hiccup degrades to a fallback string instead of breaking the request - the
dashboard and deterministic scores must keep working either way (plan Step 2).
"""

import logging
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

_AI_SRC = Path(__file__).resolve().parents[3] / "ai" / "src"
if str(_AI_SRC) not in sys.path:
    sys.path.insert(0, str(_AI_SRC))

try:
    from gemini_client import chat as _gemini_chat  # type: ignore[import-not-found]
    from gemini_client import explain_scores as _gemini_explain_scores  # type: ignore[import-not-found]
except ImportError:
    logger.exception("Could not import ai/src/gemini_client.py - is ai/ a sibling of backend/?")
    _gemini_chat = None
    _gemini_explain_scores = None


def explain_scores(scores: dict, telemetry: dict) -> str:
    if _gemini_explain_scores is None:
        return "AI explanation unavailable (ai/ module not importable)."
    try:
        return _gemini_explain_scores(scores, telemetry)
    except Exception:
        logger.exception("Gemini explain_scores call failed")
        return "AI explanation unavailable right now - the deterministic scores above are unaffected."


def chat(vehicle_context: str, question: str) -> str:
    if _gemini_chat is None:
        return "AI assistant unavailable (ai/ module not importable)."
    try:
        return _gemini_chat(vehicle_context, question)
    except Exception:
        logger.exception("Gemini chat call failed")
        return "AI assistant is unavailable right now - check GEMINI_API_KEY and try again."
