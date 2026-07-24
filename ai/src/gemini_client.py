import google.generativeai as genai

from config import GEMINI_API_KEY
from prompts import CHAT_SYSTEM_PROMPT, EXPLAIN_SYSTEM_PROMPT, build_chat_prompt

genai.configure(api_key=GEMINI_API_KEY)

_explain_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", system_instruction=EXPLAIN_SYSTEM_PROMPT
)
_chat_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", system_instruction=CHAT_SYSTEM_PROMPT
)


def explain_scores(scores: dict, telemetry: dict) -> str:
    """Turn already-computed health scores + raw telemetry into a natural-language
    explanation. Never computes or adjusts the scores themselves."""
    prompt = f"Health scores: {scores}\n\nTelemetry: {telemetry}"
    response = _explain_model.generate_content(prompt)
    return response.text


def chat(vehicle_context: str, question: str) -> str:
    prompt = build_chat_prompt(vehicle_context, question)
    response = _chat_model.generate_content(prompt)
    return response.text


if __name__ == "__main__":
    # Quick smoke test: `python gemini_client.py` from ai/src with GEMINI_API_KEY set.
    demo_scores = {"vehicle_health_score": 78, "battery_health_score": 65}
    demo_telemetry = {"battery_temp_c": 42, "battery_pct": 61}
    print(explain_scores(demo_scores, demo_telemetry))
