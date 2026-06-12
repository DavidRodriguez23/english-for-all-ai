import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

# --- TTS Provider priority ---
# 1. Kokoro TTS  (KOKORO_URL set)        → open source, free, no limits
# 2. ElevenLabs  (ELEVENLABS_API_KEY)    → fallback if Kokoro unavailable
# 3. None        → frontend uses browser TTS

KOKORO_URL         = os.getenv("KOKORO_URL", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_URL     = "https://api.elevenlabs.io/v1/text-to-speech"

USE_KOKORO     = bool(KOKORO_URL)
USE_ELEVENLABS = bool(ELEVENLABS_API_KEY) and not USE_KOKORO

BEGINNER_LEVELS = {"beginner", "elementary"}

# Kokoro voice names
KOKORO_VOICE_EN = os.getenv("KOKORO_VOICE_EN", "af_heart")    # American female
KOKORO_VOICE_ES = os.getenv("KOKORO_VOICE_ES", "ef_dora")     # Spanish female

# ElevenLabs voice IDs (fallback)
VOICE_EN = os.getenv("ELEVENLABS_VOICE_EN", "cgSgspJ2msm6clMCkdW9")
VOICE_ES = os.getenv("ELEVENLABS_VOICE_ES", "nTkjq09AuYgsNR8E4sDe")


def split_bilingual(text: str) -> list[dict]:
    segments = []
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
            spanish = [
                r'[áéíóúüñ¡¿]',
                r'\b(hola|gracias|muy|bien|soy|estoy|puedes|vamos|también'
                r'|pero|porque|decir|hablar|practicar|ahora|intenta|repite)\b',
            ]
            is_es = any(re.search(p, part.lower()) for p in spanish)
            segments.append({"text": part, "lang": "es" if is_es else "en"})
    return segments if segments else [{"text": text, "lang": "en"}]


def has_spanish(text: str) -> bool:
    return bool(re.search(
        r'\([^)]+\)|[áéíóúüñ¡¿]'
        r'|\b(hola|gracias|soy|estoy|vamos|también|pero|porque|puedes|decir)\b',
        text.lower()
    ))


async def _kokoro_request(text: str, lang: str) -> bytes | None:
    """Call Kokoro TTS API."""
    voice = KOKORO_VOICE_ES if lang == "es" else KOKORO_VOICE_EN
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{KOKORO_URL}/tts",
                json={"text": text, "voice": voice, "speed": 1.0},
            )
            if r.status_code == 200:
                return r.content
            print(f"[TTS/Kokoro] Error {r.status_code}: {r.text[:200]}")
            return None
    except Exception as e:
        print(f"[TTS/Kokoro] Exception: {e}")
        return None


async def _elevenlabs_request(text: str, lang: str) -> bytes | None:
    """Call ElevenLabs TTS API."""
    voice_id = VOICE_ES if lang == "es" else VOICE_EN
    headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "language_code": lang,
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.85,
            "style": 0.25,
            "use_speaker_boost": True,
        },
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{ELEVENLABS_URL}/{voice_id}",
                headers=headers,
                json=payload,
            )
            if r.status_code == 200:
                return r.content
            print(f"[TTS/ElevenLabs] Error {r.status_code}: {r.text[:200]}")
            return None
    except Exception as e:
        print(f"[TTS/ElevenLabs] Exception: {e}")
        return None


async def _tts_request(text: str, lang: str) -> bytes | None:
    if USE_KOKORO:
        return await _kokoro_request(text, lang)
    elif USE_ELEVENLABS:
        return await _elevenlabs_request(text, lang)
    return None


async def text_to_speech_bilingual(text: str, level: str) -> bytes | None:
    if not USE_KOKORO and not USE_ELEVENLABS:
        return None

    # Intermediate+: pure English
    if level not in BEGINNER_LEVELS:
        return await _tts_request(text, "en")

    # Beginner/Elementary: split by language if Spanish detected
    if not has_spanish(text):
        return await _tts_request(text, "en")

    segments = split_bilingual(text)

    if len(segments) == 1:
        return await _tts_request(segments[0]["text"], segments[0]["lang"])

    parts = []
    for seg in segments:
        if seg["text"].strip():
            audio = await _tts_request(seg["text"], seg["lang"])
            if audio:
                parts.append(audio)

    return b"".join(parts) if parts else None
