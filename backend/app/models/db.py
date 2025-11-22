from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Audio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    filename: str
    storage_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "processing"         # processing | ready | failed
    vad_ready: bool = False
    transcript_ready: bool = False
    summary_ready: bool = False
    response_ready: bool = False
    music_ready: bool = False

class VAD(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    audio_id: int
    storage_path: str          # data/vad/{audio_id}.json
    duration: Optional[float] = None

class Transcript(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    audio_id: int
    storage_path: str          # data/transcripts/{audio_id}.json
    summary: Optional[str] = None

class Summary(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    audio_id: int
    storage_path: str                    # data/summary/{audio_id}.json
    source: Optional[str] = None         # "anthropic" | "transcript-fallback"

class Response(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    audio_id: int
    storage_path: str                    # data/response/{audio_id}.json

class Music(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    audio_id: int
    file_path: str   # data/music/{audio_id}.mp3
