from pathlib import Path
import shutil

AUDIO_DIR = Path("data/audio")
VAD_DIR = Path("data/vad")
TX_DIR = Path("data/transcripts")
SUMMARY_DIR = Path("data/summary")
RESPONSE_DIR = Path("data/response")
MUSIC_DIR = Path("data/music")
TMP_DIR = Path("data/tmp")

for d in (AUDIO_DIR, VAD_DIR, TX_DIR, SUMMARY_DIR, RESPONSE_DIR, TMP_DIR, MUSIC_DIR):
    d.mkdir(parents=True, exist_ok=True)

def move_to_audio(tmp_upload_path: str, final_name: str) -> str:
    dest = AUDIO_DIR / final_name
    shutil.move(tmp_upload_path, dest)
    return str(dest)

def vad_json_path(audio_id: int) -> str:
    return str(VAD_DIR / f"{audio_id}.json")

def transcript_json_path(audio_id: int) -> str:
    return str(TX_DIR / f"{audio_id}.json")

def summary_json_path(audio_id: int) -> str:
    return str(SUMMARY_DIR / f"{audio_id}.json")

def response_json_path(audio_id: int) -> str:
    return str(RESPONSE_DIR / f"{audio_id}.json")

def music_mp3_path(audio_id: int) -> str:
    return str(MUSIC_DIR / f"{audio_id}.mp3")