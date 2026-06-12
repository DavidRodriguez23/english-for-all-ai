import os
import requests

from app.services.prompt_router import detect_intent
from app.services.prompt_manager import get_prompt

from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")


def generate_tutor_response(
    message: str,
    level: str,
    profile
):

    intent = detect_intent(message)

    selected_prompt = get_prompt(intent)

    print(f"Intent detected: {intent}")

    student_context = f"""
Student Profile

Name: {profile.name}
Age: {profile.age}
Native Language: {profile.native_language}
English Level: {profile.english_level}
Learning Goal: {profile.learning_goal}
"""

    prompt = f"""
{selected_prompt}

{student_context}

Conversation History:
{message}

Current Level:
{level}
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(
        OLLAMA_URL,
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    return response.json()["response"]