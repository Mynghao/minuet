# backend/app/services/transcribe.py
# Compatible with our pipeline:
# - expose transcribe(filepath: str) -> Dict
# - expose save_transcript_json(tx: Dict, out_path: str) -> None
# Keeps your original functionality (Faster-Whisper + Anthropic + Suno).

import os
import logging
import subprocess
import traceback
from pathlib import Path
from typing import Optional, Dict, Any, List
import json
import requests

import anthropic
from faster_whisper import WhisperModel

# --------------------------
# Config (env-driven)
# --------------------------
MODEL_NAME   = os.getenv("STT_MODEL", "base.en")
DEVICE       = os.getenv("STT_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("STT_COMPUTE", "int8")
LANGUAGE     = os.getenv("STT_LANGUAGE", "")   # "" = auto
VAD_FILTER   = os.getenv("STT_VAD", "1") == "1"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SUNO_API_KEY      = os.getenv("SUNO_API_KEY")

# --------------------------
# Logging
# --------------------------
log = logging.getLogger("stt")
if not log.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

# --------------------------
# Model cache
# --------------------------
_MODEL: Optional[WhisperModel] = None

def ffmpeg_ok() -> bool:
    try:
        out = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        return out.returncode == 0
    except Exception:
        return False

def get_model() -> WhisperModel:
    """Lazy-load Faster-Whisper."""
    global _MODEL
    if _MODEL is None:
        log.info(f"Loading Faster-Whisper model '{MODEL_NAME}' on {DEVICE} ({COMPUTE_TYPE})...")
        _MODEL = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
        log.info("Model loaded.")
    return _MODEL

# --------------------------
# Voice Emotion Stub (replace with ML model later)
# --------------------------
def get_emotion_data(audio_path: str) -> Dict[str, float]:
    """
    Placeholder: Return valence/arousal/dominance from audio.
    Replace with your real neural network model or API.
    """
    return {"valence": 0.7, "arousal": 0.4, "dominance": 0.6}

# --------------------------
# Suno client
# --------------------------
def generate_music_from_prompt(prompt: Dict[str, Any]) -> Optional[str]:
    """
    Calls Suno API and returns URL of generated audio (if available).
    """
    if not SUNO_API_KEY:
        return None
    url = "https://api.suno.ai/v1/generate"
    headers = {
        "Authorization": f"Bearer {SUNO_API_KEY}",
        "Content-Type": "application/json"
    }
    r = requests.post(url, headers=headers, json=prompt, timeout=120)
    r.raise_for_status()
    data = r.json()
    return data.get("audioUrl") or data.get("audio")

# --------------------------
# Public API expected by our routers
# --------------------------
# def transcribe(filepath: str) -> Dict[str, Any]:
#     """
#     Run Faster-Whisper on an audio FILE PATH (not UploadFile), then:
#       - build a short empathetic reply via Anthropic (if key present)
#       - generate a Suno music prompt (if key present) and call Suno
#     Returns a JSON-serializable dict with at least:
#       { "summary": <reply text>, "words": [...], "segments": [...], ... }
#     (routers will store this JSON and also persist 'summary' into DB.)
#     """
#     # Basic checks
#     p = Path(filepath)
#     if not p.exists() or not p.is_file():
#         raise RuntimeError(f"Audio file does not exist: {filepath}")
#     if not ffmpeg_ok():
#         raise RuntimeError("ffmpeg is not installed or not on PATH.")

#     # Transcribe
#     model = get_model()
#     lang = LANGUAGE.strip() or None
#     log.info(f"Transcribing '{p.name}' (lang={lang or 'auto'}, vad={VAD_FILTER})")

#     segments, info = model.transcribe(
#         str(p),
#         vad_filter=VAD_FILTER,
#         word_timestamps=True,
#         language=lang,
#         beam_size=5
#     )

#     # Aggregate raw text
#     transcript_text = " ".join(seg.text.strip() for seg in segments if getattr(seg, "text", None))

#     # Emotion (stub -> replace later)
#     emotion = get_emotion_data(str(p))

#     # Build LLM prompt (same content as your original)
#     llm_prompt = f"""
# You are an empathetic assistant for a mental health journaling app.
# The user has recorded this journal entry:

# \"{transcript_text}\"

# The detected voice emotions are:
# Valence: {emotion['valence']}, Arousal: {emotion['arousal']}, Dominance: {emotion['dominance']}

# Do two things:
# 1) Generate a 1-3 sentence comforting reply.
# 2) Generate a Suno music prompt object internally (do NOT return JSON to the user, just use it to generate music).

# Respond with a JSON containing only:
# {{
#     "response": "<comforting reply>",
#     "musicPrompt": {{
#         "prompt": "<description for Suno>",
#         "style": "Classical",
#         "title": "Peaceful Piano Meditation",
#         "customMode": true,
#         "instrumental": true,
#         "model": "V3_5",
#         "negativeTags": "Heavy Metal, Upbeat Drums",
#         "vocalGender": "m",
#         "styleWeight": 0.65,
#         "weirdnessConstraint": 0.65,
#         "audioWeight": 0.65,
#         "callBackUrl": "https://api.example.com/callback"
#     }}
# }}
# """.strip()

#     # Call Anthropic (fallbacks if key missing or error)
#     reply_text: str = transcript_text  # fallback to raw transcript
#     music_prompt: Optional[Dict[str, Any]] = None
#     try:
#         if ANTHROPIC_API_KEY:
#             client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
#             completion = client.completions.create(
#                 model="claude-3",
#                 prompt=llm_prompt,
#                 max_tokens_to_sample=500,
#                 temperature=0.7
#             )
#             llm_output = completion.completion
#             data = json.loads(llm_output)
#             reply_text = data.get("response", transcript_text) or transcript_text
#             music_prompt = data.get("musicPrompt")
#         else:
#             log.warning("ANTHROPIC_API_KEY not set; using transcript text as summary.")
#     except Exception:
#         log.error("Anthropic call failed:\n" + traceback.format_exc())
#         # keep reply_text fallback

#     # Generate music via Suno (optional)
#     audio_url: Optional[str] = None
#     try:
#         if music_prompt:
#             audio_url = generate_music_from_prompt(music_prompt)
#         elif SUNO_API_KEY:
#             # Build a minimal default prompt if LLM didn't return one
#             audio_url = generate_music_from_prompt({
#                 "prompt": "Calm, reflective piano to match a thoughtful journal entry.",
#                 "style": "Classical",
#                 "title": "Peaceful Piano Meditation",
#                 "customMode": True,
#                 "instrumental": True,
#                 "model": "V3_5"
#             })
#     except Exception:
#         log.error("Suno generation failed:\n" + traceback.format_exc())

#     # Convert segments/words for return (keep your original structure)
#     out_segments: List[Dict[str, Any]] = [
#         {
#             "id": getattr(seg, "id", None),
#             "start": getattr(seg, "start", None),
#             "end": getattr(seg, "end", None),
#             "text": getattr(seg, "text", None),
#             "avg_logprob": getattr(seg, "avg_logprob", None),
#             "no_speech_prob": getattr(seg, "no_speech_prob", None),
#             "compression_ratio": getattr(seg, "compression_ratio", None),
#         }
#         for seg in segments
#     ]
#     out_words: List[Dict[str, Any]] = [
#         {"word": w.word, "start": w.start, "end": w.end, "prob": getattr(w, "probability", None)}
#         for seg in segments for w in getattr(seg, "words", []) or []
#     ]

#     # IMPORTANT: return must include "summary" (routers persist this to DB)
#     return {
#         "engine": "faster-whisper",
#         "model": MODEL_NAME,
#         "device": DEVICE,
#         "compute_type": COMPUTE_TYPE,
#         "duration": getattr(info, "duration", None),
#         "language": getattr(info, "language", None),
#         "summary": reply_text,              # <- key expected by our router/DB
#         "audio_url": audio_url,
#         "segments": out_segments,
#         "words": out_words,
#         # Keep the raw transcript too (optional)
#         "transcript": transcript_text,
#         # Also echo detected emotion (optional)
#         "emotion": emotion,
#         # And the LLM prompt we used (optional, helps debugging)
#         "llm_used": bool(ANTHROPIC_API_KEY),
#     }


def transcribe(filepath: str) -> Dict[str, Any]:
    p = Path(filepath)
    if not p.exists() or not p.is_file():
        raise RuntimeError(f"Audio not found: {filepath}")
    if not ffmpeg_ok():
        raise RuntimeError("ffmpeg is not installed or not on PATH.")

    model = get_model()
    lang = LANGUAGE.strip() or None
    segments, info = model.transcribe(
        str(p), vad_filter=VAD_FILTER, word_timestamps=True, language=lang, beam_size=5
    )

    transcript_text = " ".join((getattr(seg, "text", "") or "").strip() for seg in segments if getattr(seg, "text", None))

    out_segments: List[Dict[str, Any]] = [
        {
            "id": getattr(seg, "id", None),
            "start": getattr(seg, "start", None),
            "end": getattr(seg, "end", None),
            "text": getattr(seg, "text", None),
            "avg_logprob": getattr(seg, "avg_logprob", None),
            "no_speech_prob": getattr(seg, "no_speech_prob", None),
            "compression_ratio": getattr(seg, "compression_ratio", None),
        }
        for seg in segments
    ]
    out_words: List[Dict[str, Any]] = [
        {"word": w.word, "start": w.start, "end": w.end, "prob": getattr(w, "probability", None)}
        for seg in segments for w in (getattr(seg, "words", []) or [])
    ]

    return {
        "engine": "faster-whisper",
        "model": MODEL_NAME,
        "device": DEVICE,
        "compute_type": COMPUTE_TYPE,
        "duration": getattr(info, "duration", None),
        "language": getattr(info, "language", None),
        "transcript": transcript_text,   # <-- ONLY transcription here
        "segments": out_segments,
        "words": out_words,
    }

# def transcribe(filepath: str) -> Dict[str, Any]:
#     """
#     Run Faster-Whisper on an audio FILE PATH (not UploadFile), then:
#       - build a short empathetic reply via Anthropic (if key present)
#       - generate a Suno music prompt (if key present) and call Suno
#     Returns a JSON-serializable dict with at least:
#       { "summary": <reply text>, "words": [...], "segments": [...], ... }
#     (routers will store this JSON and also persist 'summary' into DB.)
#     """
#     # Basic checks
#     p = Path(filepath)
#     if not p.exists() or not p.is_file():
#         raise RuntimeError(f"Audio file does not exist: {filepath}")
#     if not ffmpeg_ok():
#         raise RuntimeError("ffmpeg is not installed or not on PATH.")

#     # Transcribe
#     model = get_model()
#     lang = LANGUAGE.strip() or None
#     log.info(f"Transcribing '{p.name}' (lang={lang or 'auto'}, vad={VAD_FILTER})")

#     segments, info = model.transcribe(
#         str(p),
#         vad_filter=VAD_FILTER,
#         word_timestamps=True,
#         language=lang,
#         beam_size=5,
#     )

#     # Aggregate raw text
#     transcript_text = " ".join(seg.text.strip() for seg in segments if getattr(seg, "text", None)) or ""

#     # Emotion (stub -> replace later)
#     emotion = get_emotion_data(str(p))

#     # Build LLM prompt (same content as your original)
#     llm_prompt = f"""
# You are an empathetic assistant for a mental health journaling app.
# The user has recorded this journal entry:

# \"{transcript_text}\"

# The detected voice emotions are:
# Valence: {emotion['valence']}, Arousal: {emotion['arousal']}, Dominance: {emotion['dominance']}

# Do two things:
# 1) Generate a 1-3 sentence comforting reply.
# 2) Generate a Suno music prompt object internally (do NOT return JSON to the user, just use it to generate music).

# Respond with a JSON containing only:
# {{
#     "response": "<comforting reply>",
#     "musicPrompt": {{
#         "prompt": "<description for Suno>",
#         "style": "Classical",
#         "title": "Peaceful Piano Meditation",
#         "customMode": true,
#         "instrumental": true,
#         "model": "V3_5",
#         "negativeTags": "Heavy Metal, Upbeat Drums",
#         "vocalGender": "m",
#         "styleWeight": 0.65,
#         "weirdnessConstraint": 0.65,
#         "audioWeight": 0.65,
#         "callBackUrl": "https://api.example.com/callback"
#     }}
# }}
# """.strip()

#     # Call Anthropic (fallbacks if key missing or error)
#     reply_text: str = transcript_text  # fallback to raw transcript
#     summary_source: str = "transcript"
#     music_prompt: Optional[Dict[str, Any]] = None
#     try:
#         if ANTHROPIC_API_KEY:
#             client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
#             completion = client.completions.create(
#                 model="claude-3",
#                 prompt=llm_prompt,
#                 max_tokens_to_sample=500,
#                 temperature=0.7,
#             )
#             llm_output = completion.completion or ""
#             # Try JSON parse; if it fails, keep transcript fallback
#             try:
#                 data = json.loads(llm_output)
#                 reply_text = (data.get("response") or transcript_text) or transcript_text
#                 music_prompt = data.get("musicPrompt")
#                 summary_source = "anthropic"
#             except Exception:
#                 log.warning("Anthropic returned non-JSON; using transcript as summary.")
#         else:
#             log.warning("ANTHROPIC_API_KEY not set; using transcript text as summary.")
#     except Exception:
#         log.error("Anthropic call failed:\n" + traceback.format_exc())
#         # keep reply_text fallback

#     # Generate music via Suno (optional)
#     audio_url: Optional[str] = None
#     try:
#         if music_prompt and SUNO_API_KEY:
#             audio_url = generate_music_from_prompt(music_prompt)
#         elif SUNO_API_KEY:
#             # Minimal default prompt if LLM didn't return one
#             audio_url = generate_music_from_prompt({
#                 "prompt": "Calm, reflective piano to match a thoughtful journal entry.",
#                 "style": "Classical",
#                 "title": "Peaceful Piano Meditation",
#                 "customMode": True,
#                 "instrumental": True,
#                 "model": "V3_5",
#             })
#     except Exception:
#         log.error("Suno generation failed:\n" + traceback.format_exc())

#     # Convert segments/words for return (keep your original structure)
#     out_segments: List[Dict[str, Any]] = [
#         {
#             "id": getattr(seg, "id", None),
#             "start": getattr(seg, "start", None),
#             "end": getattr(seg, "end", None),
#             "text": getattr(seg, "text", None),
#             "avg_logprob": getattr(seg, "avg_logprob", None),
#             "no_speech_prob": getattr(seg, "no_speech_prob", None),
#             "compression_ratio": getattr(seg, "compression_ratio", None),
#         }
#         for seg in segments
#     ]
#     out_words: List[Dict[str, Any]] = [
#         {"word": w.word, "start": w.start, "end": w.end, "prob": getattr(w, "probability", None)}
#         for seg in segments for w in (getattr(seg, "words", []) or [])
#     ]

#     # IMPORTANT: return must include "summary" (routers persist this to DB)
#     return {
#         "engine": "faster-whisper",
#         "model": MODEL_NAME,
#         "device": DEVICE,
#         "compute_type": COMPUTE_TYPE,
#         "duration": getattr(info, "duration", None),
#         "language": getattr(info, "language", None),
#         "summary": reply_text,                 # <- stored to DB
#         "summary_source": summary_source,      # <- helpful for debugging/UX
#         "audio_url": audio_url,
#         "segments": out_segments,
#         "words": out_words,
#         # Optional/debug fields:
#         "transcript": transcript_text,
#         "emotion": emotion,
#         "llm_used": (summary_source == "anthropic"),
#     }

def save_transcript_json(tx: Dict[str, Any], out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(tx, f)

# def save_transcript_json(tx: Dict[str, Any], out_path: str) -> None:
#     Path(out_path).parent.mkdir(parents=True, exist_ok=True)
#     with open(out_path, "w") as f:
#         json.dump(tx, f)
