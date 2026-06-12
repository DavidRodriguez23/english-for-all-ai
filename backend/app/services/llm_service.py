import os
import httpx
from dotenv import load_dotenv

from app.services.prompt_router import detect_intent
from app.services.prompt_manager import build_prompt
from app.models.user import UserProfile

load_dotenv()

# --- Provider priority ---
# 1. Groq        (GROQ_API_KEY set)      → fastest, 6000 req/min free
# 2. OpenRouter  (OPENROUTER_API_KEY)    → fallback, free models
# 3. Ollama      (local dev)             → local only

GROQ_API_KEY       = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

USE_GROQ       = bool(GROQ_API_KEY)
USE_OPENROUTER = bool(OPENROUTER_API_KEY) and not USE_GROQ

# Groq settings — Llama 3.3 70B is the best free model for English tutoring
GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# OpenRouter fallback
OPENROUTER_URL   = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")

# Ollama local dev
OLLAMA_URL   = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

REQUEST_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "60"))


async def _call_groq(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_p": 0.9,
    }
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


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
        "options": {"temperature": 0.7, "top_p": 0.9, "num_predict": 512},
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

    if USE_GROQ:
        provider = f"Groq ({GROQ_MODEL})"
    elif USE_OPENROUTER:
        provider = f"OpenRouter ({OPENROUTER_MODEL})"
    else:
        provider = f"Ollama ({OLLAMA_MODEL})"

    print(f"[LLM] Intent: {intent} | Level: {level} | Provider: {provider}")

    prompt = build_prompt(
        intent=intent,
        message=message,
        level=level,
        profile=profile,
        history=history,
    )

    if USE_GROQ:
        return await _call_groq(prompt)
    elif USE_OPENROUTER:
        return await _call_openrouter(prompt)
    else:
        return await _call_ollama(prompt)
