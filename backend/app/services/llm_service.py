import os
import httpx
from dotenv import load_dotenv

from app.services.prompt_router import detect_intent
from app.services.prompt_manager import build_prompt
from app.models.user import UserProfile

load_dotenv()

# --- Provider detection ---
# GOOGLE_API_KEY set → Gemini (production, free)
# Otherwise         → Ollama (local dev)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
USE_GEMINI = bool(GOOGLE_API_KEY)

# Ollama (local)
OLLAMA_URL   = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# Gemini (production) — free tier, fast, great for English tutoring
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_URL   = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

REQUEST_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "60"))


async def _call_gemini(prompt: str) -> str:
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
            "topP": 0.9,
        }
    }
    url = f"{GEMINI_URL}?key={GOOGLE_API_KEY}"

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()


async def _call_ollama(prompt: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 512,
        },
    }
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json().get("response", "").strip()


async def generate_tutor_response(
    message: str,
    level: str,
    profile: UserProfile,
    history: str = "",
) -> str:
    intent = detect_intent(message)
    provider = "Gemini" if USE_GEMINI else "Ollama"
    print(f"[LLM] Intent: {intent} | Level: {level} | Provider: {provider}")

    prompt = build_prompt(
        intent=intent,
        message=message,
        level=level,
        profile=profile,
        history=history,
    )

    if USE_GEMINI:
        return await _call_gemini(prompt)
    else:
        return await _call_ollama(prompt)
