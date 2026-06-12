import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech"
USE_ELEVENLABS = bool(ELEVENLABS_API_KEY)
BEGINNER_LEVELS = {"beginner", "elementary"}

# Jessica — young American female, warm, conversational
# eleven_multilingual_v2 with lang="en" → natural American English
# eleven_multilingual_v2 with lang="es" → neutral Latin American Spanish
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "cgSgspJ2msm6clMCkdW9")


def split_bilingual(text: str) -> list[dict]:
    """
    Split mixed EN/ES text into segments.
    Spanish is typically in parentheses: "Good morning! (¡Buenos días!)"
    Returns: [{"text": "...", "lang": "en"}, {"text": "...", "lang": "es"}, ...]
    """
    segments = []
    # Split on (Spanish text) parenthetical translations
    parts = re.split(r'(\([^)]+\))', text)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if part.startswith('(') and part.endswith(')'):
            inner = part[1:-1].strip()
            if inner:
                segments.append({"text": inner, "lang": "es"})
        else:
            # Check if this chunk is primarily Spanish
            spanish_indicators = [
                r'[áéíóúüñ¡¿]',
                r'\b(hola|gracias|muy bien|soy|estoy|puedes|vamos|también|además|pero|porque)\b',
            ]
            is_spanish = any(re.search(p, part.lower()) for p in spanish_indicators)
            if part:
                segments.append({"text": part, "lang": "es" if is_spanish else "en"})

    return segments if segments else [{"text": text, "lang": "en"}]


async def _tts_request(text: str, lang: str) -> bytes | None:
    """Single ElevenLabs request for one language segment."""
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "language_code": lang,
        "voice_settings": {
            "stability": 0.42,
            "similarity_boost": 0.85,
            "style": 0.28,
            "use_speaker_boost": True,
        },
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{ELEVENLABS_URL}/{VOICE_ID}",
            headers=headers,
            json=payload,
        )
        if r.status_code == 200:
            return r.content
        print(f"[TTS] Error {r.status_code}: {r.text[:200]}")
        return None


async def text_to_speech_bilingual(text: str, level: str) -> bytes | None:
    """
    For beginner/elementary with mixed content:
      → Split into EN and ES segments
      → Call ElevenLabs separately for each with the correct language_code
      → Concatenate the MP3 bytes (browsers handle this fine)

    For intermediate+:
      → Single call with lang="en"

    Result: English parts sound American, Spanish parts sound Latin American.
    """
    if not USE_ELEVENLABS:
        return None

    # Intermediate and above: pure English
    if level not in BEGINNER_LEVELS:
        return await _tts_request(text, "en")

    # Check if text actually has Spanish content
    has_spanish = bool(re.search(
        r'\([^)]+\)|[áéíóúüñ¡¿]|\b(hola|gracias|soy|estoy|vamos|también|pero|porque)\b',
        text.lower()
    ))

    if not has_spanish:
        return await _tts_request(text, "en")

    # Split and synthesize each segment with its correct language
    segments = split_bilingual(text)

    # If only one segment, do single request
    if len(segments) == 1:
        return await _tts_request(segments[0]["text"], segments[0]["lang"])

    # Multiple segments: request each and concatenate
    audio_parts = []
    for seg in segments:
        if not seg["text"].strip():
            continue
        audio = await _tts_request(seg["text"], seg["lang"])
        if audio:
            audio_parts.append(audio)

    if not audio_parts:
        return None

    # Concatenate raw MP3 bytes — browsers decode this correctly
    return b"".join(audio_parts)
