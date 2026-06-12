import os
import httpx
from dotenv import load_dotenv

from app.services.prompt_router import detect_intent
from app.services.prompt_manager import build_prompt
from app.models.user import UserProfile

load_dotenv()

# --- Provider detection ---
# OPENROUTER_API_KEY → OpenRouter (production, free models)
# Otherwise          → Ollama (local dev)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
USE_OPENROUTER = bool(OPENROUTER_API_KEY)

# Ollama (local)
OLLAMA_URL   = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# OpenRouter (production) — free models available
OPENROUTER_URL   = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")

REQUEST_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "60"))


async def _call_openrouter(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://english-for-all-ai.vercel.app",
        "X-Title": "English For All AI",
    }
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


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
    provider = "OpenRouter" if USE_OPENROUTER else "Ollama"
    print(f"[LLM] Intent: {intent} | Level: {level} | Provider: {provider}")

    prompt = build_prompt(
        intent=intent,
        message=message,
        level=level,
        profile=profile,
        history=history,
    )

    if USE_OPENROUTER:
        return await _call_openrouter(prompt)
    else:
        return await _call_ollama(prompt)
