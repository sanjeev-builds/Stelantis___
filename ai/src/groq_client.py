from groq import Groq

from config import GROQ_API_KEY
from prompts import CHAT_SYSTEM_PROMPT, EXPLAIN_SYSTEM_PROMPT, build_chat_prompt

_client = Groq(api_key=GROQ_API_KEY)
_MODEL = "llama-3.3-70b-versatile"

# Bounds how long an unconfigured/invalid-key call can hang before the
# fallback in app/services/ai_client.py kicks in. Groq's inference is fast
# (typically well under a second per call), so this is generous headroom,
# not a floor we expect to hit on a working key.
_REQUEST_TIMEOUT_SECONDS = 15


def _complete(system_prompt: str, user_prompt: str) -> str:
    response = _client.chat.completions.create(
        model=_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        timeout=_REQUEST_TIMEOUT_SECONDS,
    )
    return response.choices[0].message.content


def explain_scores(scores: dict, telemetry: dict) -> str:
    """Turn already-computed health scores + raw telemetry into a natural-language
    explanation. Never computes or adjusts the scores themselves."""
    prompt = f"Health scores: {scores}\n\nTelemetry: {telemetry}"
    return _complete(EXPLAIN_SYSTEM_PROMPT, prompt)


def chat(vehicle_context: str, question: str) -> str:
    prompt = build_chat_prompt(vehicle_context, question)
    return _complete(CHAT_SYSTEM_PROMPT, prompt)


if __name__ == "__main__":
    # Quick smoke test: `python groq_client.py` from ai/src with GROQ_API_KEY set.
    demo_scores = {"vehicle_health_score": 78, "battery_health_score": 65}
    demo_telemetry = {"battery_temp_c": 42, "battery_pct": 61}
    print(explain_scores(demo_scores, demo_telemetry))
