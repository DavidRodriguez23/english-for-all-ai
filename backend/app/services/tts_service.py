import os
import httpx
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# High quality voices — free tier available
# English: Rachel (natural, warm, clear)
# Spanish: Valentina (native Spanish, natural)
VOICE_EN = os.getenv("ELEVENLABS_VOICE_EN", "21m00Tcm4TlvDq8ikWAM")  # Rachel
VOICE_ES = os.getenv("ELEVENLABS_VOICE_ES", "XB0fDUnXU5powFXDhCwa")  # Charlotte (multilingual)

USE_ELEVENLABS = bool(ELEVENLABS_API_KEY)


async def text_to_speech(text: str, language: str = "en") -> bytes | None:
    """
    Convert text to speech using ElevenLabs.
    Returns audio bytes (MP3) or None if unavailable.
    language: 'en' or 'es'
    """
    if not USE_ELEVENLABS:
        return None

    voice_id = VOICE_ES if language == "es" else VOICE_EN

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",  # supports EN + ES natively
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.2,
            "use_speaker_boost": True,
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{ELEVENLABS_URL}/{voice_id}",
            headers=headers,
            json=payload,
        )
        if response.status_code == 200:
            return response.content
        else:
            print(f"[TTS] ElevenLabs error: {response.status_code} {response.text}")
            return None


async def text_to_speech_bilingual(text: str, level: str) -> bytes | None:
    """
    For beginner/elementary: detect if text has Spanish content and use
    multilingual model. For higher levels: English only.
    """
    beginner_levels = ["beginner", "elementary"]

    if level not in beginner_levels:
        return await text_to_speech(text, "en")

    # Use multilingual model for mixed content — it handles both
    # English and Spanish in the same utterance naturally
    return await text_to_speech(text, "en")
