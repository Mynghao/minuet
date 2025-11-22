# backend/app/services/audio_utils.py
import subprocess
from pathlib import Path

def ffmpeg_ok() -> bool:
    try:
        return subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).returncode == 0
    except Exception:
        return False

def convert_mp3_to_wav(mp3_path: str, wav_path: str, sample_rate: int = 16000) -> str:
    """
    Convert an MP3 file to WAV using ffmpeg (mono, PCM16, given sample rate).
    Returns the output wav_path.
    """
    mp3_path = Path(mp3_path)
    wav_path = Path(wav_path)
    wav_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(mp3_path),
        "-ac", "1",
        "-ar", str(sample_rate),
        "-sample_fmt", "s16",
        str(wav_path),
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg conversion failed: {proc.stderr.decode(errors='ignore')[:4000]}")
    return str(wav_path)
