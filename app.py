# app.py
# Minuet STT Backend with frontend serving and transcription + music generation

import os
import tempfile
import logging
import traceback
import subprocess
from pathlib import Path
from typing import Optional
import json
import requests
import anthropic

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel

# --------------------------
# Config
# --------------------------
MODEL_NAME   = os.getenv("STT_MODEL", "base.en")
DEVICE       = os.getenv("STT_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("STT_COMPUTE", "int8")
LANGUAGE     = os.getenv("STT_LANGUAGE", "")
VAD_FILTER   = os.getenv("STT_VAD", "1") == "1"
ALLOW_ORIGIN_REGEX = os.getenv("STT_ALLOW_ORIGIN_REGEX", ".*")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SUNO_API_KEY = os.getenv("SUNO_API_KEY")

# --------------------------
# Logging
# --------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
log = logging.getLogger("stt")

# --------------------------
# App & CORS
# --------------------------
app = FastAPI(title="Minuet STT Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ALLOW_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --------------------------
# Utilities
# --------------------------
_MODEL: Optional[WhisperModel] = None

def ffmpeg_ok() -> bool:
    try:
        out = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        return out.returncode == 0
    except Exception:
        return False

def get_model() -> WhisperModel:
    global _MODEL
    if _MODEL is None:
        log.info(f"Loading Faster-Whisper model '{MODEL_NAME}' on {DEVICE} ({COMPUTE_TYPE})...")
        _MODEL = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
        log.info("Model loaded.")
    return _MODEL

def friendly_error(detail: str, status: int = 400) -> HTTPException:
    return HTTPException(status_code=status, detail=detail)

def get_emotion_data(audio_path: str) -> dict:
    return {"valence": 0.7, "arousal": 0.4, "dominance": 0.6}

def generate_music_from_prompt(prompt: dict) -> str:
    url = "https://api.suno.ai/v1/generate"
    headers = {
        "Authorization": f"Bearer {SUNO_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=prompt)
    response.raise_for_status()
    data = response.json()
    return data.get("audioUrl") or data.get("audio")

# --------------------------
# Routes
# --------------------------
@app.get("/health")
def health():
    return {
        "ok": True,
        "ffmpeg": ffmpeg_ok(),
        "model": MODEL_NAME,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE,
        "language": LANGUAGE or None,
        "vad_filter": VAD_FILTER,
    }

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    log.info(f"Incoming file: name='{audio.filename}' type='{audio.content_type}'")
    suffix = Path(audio.filename or "").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = Path(tmp.name)
        file_bytes = await audio.read()
        if not file_bytes:
            raise friendly_error("Uploaded file is empty.", 400)
        tmp.write(file_bytes)

    try:
        if not ffmpeg_ok():
            raise friendly_error("ffmpeg is not installed or not on PATH.", 500)

        model = get_model()
        lang = LANGUAGE if LANGUAGE.strip() else None

        log.info(f"Transcribing '{tmp_path.name}' (lang={lang or 'auto'}, vad={VAD_FILTER})")
        segments, info = model.transcribe(
            str(tmp_path),
            vad_filter=VAD_FILTER,
            word_timestamps=True,
            language=lang,
            beam_size=5
        )

        transcript = " ".join(seg.text.strip() for seg in segments if seg.text)
        emotion = get_emotion_data(str(tmp_path))

        llm_prompt = f"""
You are an empathetic assistant for a mental health journaling app. You will read a user's journal entry and the detected emotions in their voice, then respond with a comforting reply and a music prompt to generate soothing music.
The user has recorded this journal entry:

"{transcript}"

The detected voice emotions are:
Valence: {emotion['valence']}, Arousal: {emotion['arousal']}, Dominance: {emotion['dominance']}

Respond with a JSON containing only:
{{
    "response": "<comforting reply>",
    "musicPrompt": {{}}
}}
"""

        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        completion = client.completions.create(
            model="claude-3",
            prompt=llm_prompt,
            max_tokens_to_sample=500,
            temperature=0.7
        )
        llm_output = completion.completion
        data = json.loads(llm_output)

        audio_url = generate_music_from_prompt(data["musicPrompt"])

        out_segments = [
            {
                "id": seg.id,
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
                "avg_logprob": seg.avg_logprob,
                "no_speech_prob": getattr(seg, "no_speech_prob", None),
                "compression_ratio": getattr(seg, "compression_ratio", None)
            }
            for seg in segments
        ]
        out_words = [
            {"word": w.word, "start": w.start, "end": w.end, "prob": w.probability}
            for seg in segments for w in getattr(seg, "words", [])
        ]

        return JSONResponse({
            "engine": "faster-whisper",
            "model": MODEL_NAME,
            "device": DEVICE,
            "compute_type": COMPUTE_TYPE,
            "duration": getattr(info, "duration", None),
            "language": getattr(info, "language", None),
            "text": data["response"],
            "audio_url": audio_url,
            "segments": out_segments,
            "words": out_words
        })

    except HTTPException:
        raise
    except Exception as e:
        log.error("Transcription failed:\n" + traceback.format_exc())
        raise friendly_error(f"Transcription failed: {e}", 500)
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass

# --------------------------
# Serve frontend at /frontend
# --------------------------
app.mount("/frontend", StaticFiles(directory=".", html=True), name="frontend")

# --------------------------
# Optional redirect from root to your main HTML page
# --------------------------
@app.get("/")
def root_redirect():
    return RedirectResponse(url="/frontend/chatgptsecondui.html")
