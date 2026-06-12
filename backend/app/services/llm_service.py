import os
import httpx

from app.services.prompt_router import detect_intent
from app.services.prompt_manager import build_prompt
from app.models.user import UserProfile

from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
REQUEST_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "120"))


async def generate_tutor_response(
    message: str,
    level: str,
    profile: UserProfile,
    history: str = ""
) -> str:
    """
    Detect intent → build the correct prompt with all
    placeholders filled → call Ollama → return the response.
    """

    intent = detect_intent(message)
    print(f"[LLM] Intent: {intent} | Level: {level}")

    prompt = build_prompt(
        intent=intent,
        message=message,
        level=level,
        profile=profile,
        history=history
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 512,
        }
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
