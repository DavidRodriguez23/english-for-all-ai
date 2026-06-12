from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI(title="Kokoro TTS Service")


class TTSRequest(BaseModel):
    text: str
    voice: str = "af_heart"   # American female default
    speed: float = 1.0


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/tts")
async def tts(req: TTSRequest):
    try:
        import kokoro
        from kokoro import KPipeline
        import soundfile as sf
        import numpy as np

        # Detect language from voice name
        lang = "es" if req.voice.startswith("e") else "en-us"

        pipeline = KPipeline(lang_code=lang)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            tmp_path = f.name

        generator = pipeline(req.text, voice=req.voice, speed=req.speed)
        audio_chunks = []
        for _, _, audio in generator:
            audio_chunks.append(audio)

        if not audio_chunks:
            raise HTTPException(status_code=500, detail="No audio generated")

        audio_data = np.concatenate(audio_chunks)
        sf.write(tmp_path, audio_data, 24000)

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()

        os.unlink(tmp_path)

        return Response(content=audio_bytes, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
