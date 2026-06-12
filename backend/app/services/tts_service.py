import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_URL     = "https://api.elevenlabs.io/v1/text-to-speech"
USE_ELEVENLABS     = bool(ELEVENLABS_API_KEY)
BEGINNER_LEVELS    = {"beginner", "elementary"}

VOICE_EN = os.getenv("ELEVENLABS_VOICE_EN", "cgSgspJ2msm6clMCkdW9")
VOICE_ES = os.getenv("ELEVENLABS_VOICE_ES", "nTkjq09AuYgsNR8E4sDe")


def split_bilingual(text):
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
            spanish = [r'[áéíóúüñ¡¿]', r'\b(hola|gracias|muy|bien|soy|estoy|puedes|vamos|también|pero|porque|decir|hablar|practicar|ahora|intenta|repite)\b']
            is_es = any(re.search(p, part.lower()) for p in spanish)
            segments.append({"text": part, "lang": "es" if is_es else "en"})
    return segments if segments else [{"text": text, "lang": "en"}]


async def _tts_request(text, lang):
    voice_id = VOICE_ES if lang == "es" else VOICE_EN
    headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "language_code": lang,
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.85, "style": 0.25, "use_speaker_boost": True},
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(f"{ELEVENLABS_URL}/{voice_id}", headers=headers, json=payload)
        if r.status_code == 200:
            return r.content
        print(f"[TTS] Error {r.status_code} ({lang}): {r.text[:200]}")
        return None


async def text_to_speech_bilingual(text, level):
    if not USE_ELEVENLABS:
        return None
    if level not in BEGINNER_LEVELS:
        return await _tts_request(text, "en")
    has_spanish = bool(re.search(r'\([^)]+\)|[áéíóúüñ¡¿]|\b(hola|gracias|soy|estoy|vamos|también|pero|porque|puedes|decir)\b', text.lower()))
    if not has_spanish:
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
