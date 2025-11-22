import os
import random
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

# --------------------------
# App initialization
# --------------------------
app = FastAPI(title="Minuet Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Folder containing MP3 files
SUNO_FOLDER = os.path.join(os.path.dirname(__file__), "SUNO_tunes")

# --------------------------
# Routes
# --------------------------

@app.get("/")
def root():
    return {"message": "Minuet Backend is running! Go to /play_random to get a random MP3."}


@app.get("/play_random")
def play_random():
    # List only mp3 files
    mp3_files = [f for f in os.listdir(SUNO_FOLDER) if f.lower().endswith(".mp3")]
    if not mp3_files:
        return {"error": "No MP3 files found in SUNO_tunes"}

    # Pick a random file
    random_mp3 = random.choice(mp3_files)

    # Full path
    mp3_path = os.path.join(SUNO_FOLDER, random_mp3)

    # Return as FileResponse so frontend can fetch & play
    return FileResponse(
        mp3_path,
        media_type="audio/mpeg",
        filename=random_mp3  # preserves original name with spaces
    )
