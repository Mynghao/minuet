# backend/app/routers/audio.py
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from sqlmodel import select, Session
from typing import Optional
import aiofiles, time, json

from app.models.db import Audio, VAD, Transcript, Summary, Response, Music
from app.core.db import get_session, engine
from app.services import storage
from app.services import vad as vad_service
from app.services import transcribe as tx_service
from app.services import summary as sm_service
from app.services import response as rp_service


router = APIRouter(prefix="/api", tags=["audio"])

# --------------------------
# Upload
# --------------------------
@router.post("/upload")
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    session=Depends(get_session),
):
    # 1) Save to tmp
    tmp_path = storage.TMP_DIR / f"{int(time.time()*1000)}_{file.filename}"
    async with aiofiles.open(tmp_path, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            await out.write(chunk)

    # 2) Create DB row (processing)
    audio = Audio(filename=file.filename, storage_path="", user_id=user_id, session_id=session_id)
    session.add(audio); session.commit(); session.refresh(audio)

    # 3) Move to final location and update
    final_name = f"{audio.id}_{file.filename}"
    final_path = storage.move_to_audio(str(tmp_path), final_name)
    audio.storage_path = final_path
    session.add(audio); session.commit()

    # 4) Start background jobs (VAD + Transcription ONLY)
    background_tasks.add_task(run_vad, audio.id)
    background_tasks.add_task(run_transcription, audio.id)

    return {
        "id": audio.id,
        "status": audio.status,
        "vad_ready": audio.vad_ready,
        "transcript_ready": audio.transcript_ready,
        "summary_ready": audio.summary_ready,
        "response_ready": audio.response_ready,
    }

# --------------------------
# Background jobs
# --------------------------
# def run_vad(audio_id: int):
#     with Session(engine) as s:
#         a = s.get(Audio, audio_id)
#         if not a:
#             return
#         try:
#             result = vad_service.compute_vad_from_wav(a.storage_path)
#             path = storage.vad_json_path(a.id)
#             vad_service.save_vad_json(result, path)
#             row = VAD(audio_id=a.id, storage_path=path)
#             s.add(row)
#             a.vad_ready = True
#             # mark ready only when all modular steps are done
#             if a.transcript_ready and a.summary_ready and a.response_ready:
#                 a.status = "ready"
#             s.add(a); s.commit()
#         except Exception:
#             a.status = "failed"; s.add(a); s.commit()
# at top with other imports
from app.services import audio_utils

def run_vad(audio_id: int):
    with Session(engine) as s:
        a = s.get(Audio, audio_id)
        if not a:
            return
        try:
            src_path = a.storage_path

            # If the uploaded file is mp3, convert to wav for VAD
            if src_path.lower().endswith(".mp3"):
                if not audio_utils.ffmpeg_ok():
                    raise RuntimeError("ffmpeg is required to convert mp3 → wav for VAD.")
                # write the converted wav into tmp; no need to keep permanently
                wav_tmp = storage.TMP_DIR / f"{a.id}_vad.wav"
                src_path = audio_utils.convert_mp3_to_wav(a.storage_path, str(wav_tmp), sample_rate=16000)

            result = vad_service.compute_vad_from_wav(src_path)
            path = storage.vad_json_path(a.id)
            vad_service.save_vad_json(result, path)

            row = VAD(audio_id=a.id, storage_path=path)
            s.add(row)
            a.vad_ready = True
            if a.transcript_ready and a.summary_ready and a.response_ready:
                a.status = "ready"
            s.add(a); s.commit()

        except Exception:
            a.status = "failed"; s.add(a); s.commit()


def run_transcription(audio_id: int):
    with Session(engine) as s:
        a = s.get(Audio, audio_id)
        if not a:
            return
        try:
            tx = tx_service.transcribe(a.storage_path)  # ONLY transcript now
            path = storage.transcript_json_path(a.id)
            tx_service.save_transcript_json(tx, path)
            row = Transcript(audio_id=a.id, storage_path=path, summary=None)  # keep column for back-compat
            s.add(row)
            a.transcript_ready = True
            if a.vad_ready and a.summary_ready and a.response_ready:
                a.status = "ready"
            s.add(a); s.commit()

            run_summary(audio_id)
        except Exception:
            a.status = "failed"; s.add(a); s.commit()

def run_summary(audio_id: int):
    with Session(engine) as s:
        a = s.get(Audio, audio_id)
        if not a:
            return
        tx = s.exec(select(Transcript).where(Transcript.audio_id == audio_id)).first()
        if not tx:
            return
        try:
            obj = sm_service.summarize_from_transcript(tx.storage_path)
            path = storage.summary_json_path(a.id)
            sm_service.save_summary_json(obj, path)
            row = Summary(audio_id=a.id, storage_path=path, source=obj.get("summary_source"))
            s.add(row)
            a.summary_ready = True
            if a.vad_ready and a.transcript_ready and a.response_ready:
                a.status = "ready"
            s.add(a); s.commit()

            run_response(audio_id)
        except Exception:
            a.status = "failed"; s.add(a); s.commit()

def run_response(audio_id: int):
    with Session(engine) as s:
        a = s.get(Audio, audio_id)
        if not a:
            return
        tx = s.exec(select(Transcript).where(Transcript.audio_id == audio_id)).first()
        sm = s.exec(select(Summary).where(Summary.audio_id == audio_id)).first()
        vd = s.exec(select(VAD).where(VAD.audio_id == audio_id)).first()
        if not tx or not sm:
            return
        try:
            emotion_path = vd.storage_path if vd else None
            obj = rp_service.generate_response(
                transcript_path=tx.storage_path,
                summary_path=sm.storage_path,
                emotion_path=emotion_path,
            )
            path = storage.response_json_path(a.id)
            rp_service.save_response_json(obj, path)
            row = Response(audio_id=a.id, storage_path=path)
            s.add(row)
            a.response_ready = True
            if a.vad_ready and a.transcript_ready and a.summary_ready:
                a.status = "ready"
            s.add(a); s.commit()
        except Exception:
            a.status = "failed"; s.add(a); s.commit()

# --------------------------
# Triggers
# --------------------------
@router.post("/audio/{audio_id}/summarize")
def start_summary(audio_id: int, background_tasks: BackgroundTasks, session=Depends(get_session)):
    a = session.get(Audio, audio_id)
    if not a:
        raise HTTPException(404, "Audio not found")
    background_tasks.add_task(run_summary, audio_id)
    return {"ok": True}

@router.post("/audio/{audio_id}/respond")
def start_response(audio_id: int, background_tasks: BackgroundTasks, session=Depends(get_session)):
    a = session.get(Audio, audio_id)
    if not a:
        raise HTTPException(404, "Audio not found")
    background_tasks.add_task(run_response, audio_id)
    return {"ok": True}
# --------------------------
# Getters
# --------------------------
@router.get("/audio/{audio_id}/vad")
def get_vad(audio_id: int, session=Depends(get_session)):
    v = session.exec(select(VAD).where(VAD.audio_id == audio_id)).first()
    if not v:
        raise HTTPException(404, "VAD not ready")
    with open(v.storage_path) as f:
        return json.load(f)
@router.get("/audio/{audio_id}/status")
def get_status(audio_id: int, session=Depends(get_session)):
    a = session.get(Audio, audio_id)
    if not a:
        raise HTTPException(404, "Not found")
    return {
        "id": a.id,
        "status": a.status,
        "vad_ready": a.vad_ready,
        "transcript_ready": a.transcript_ready,
        "summary_ready": a.summary_ready,
        "response_ready": a.response_ready,
    }

@router.get("/audio/{audio_id}/vad")
def get_vad(audio_id: int, session=Depends(get_session)):
    v = session.exec(select(VAD).where(VAD.audio_id == audio_id)).first()
    if not v:
        raise HTTPException(404, "VAD not ready")
    with open(v.storage_path) as f:
        return json.load(f)

@router.get("/audio/{audio_id}/transcript")
def get_transcript(audio_id: int, session=Depends(get_session)):
    t = session.exec(select(Transcript).where(Transcript.audio_id == audio_id)).first()
    if not t:
        raise HTTPException(404, "Transcript not ready")
    with open(t.storage_path) as f:
        return json.load(f)

@router.get("/audio/{audio_id}/summary")
def get_summary(audio_id: int, session=Depends(get_session)):
    sm = session.exec(select(Summary).where(Summary.audio_id == audio_id)).first()
    if not sm:
        raise HTTPException(404, "Summary not ready")
    with open(sm.storage_path) as f:
        return json.load(f)

@router.get("/audio/{audio_id}/response")
def get_response(audio_id: int, session=Depends(get_session)):
    rp = session.exec(select(Response).where(Response.audio_id == audio_id)).first()
    if not rp:
        raise HTTPException(404, "Response not ready")
    with open(rp.storage_path) as f:
        return json.load(f)

@router.get("/audio")
def list_audio(
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    session=Depends(get_session),
):
    q = select(Audio)
    if user_id:
        q = q.where(Audio.user_id == user_id)
    if session_id:
        q = q.where(Audio.session_id == session_id)
    rows = session.exec(q.order_by(Audio.created_at.desc())).all()
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "session_id": a.session_id,
            "filename": a.filename,
            "created_at": a.created_at.isoformat(),
            "status": a.status,
            "vad_ready": a.vad_ready,
            "transcript_ready": a.transcript_ready,
            "summary_ready": a.summary_ready,
            "response_ready": a.response_ready,
        }
        for a in rows
    ]


# from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException
# from fastapi.responses import StreamingResponse
# from sqlmodel import select
# from typing import Optional
# import aiofiles, os, time, json

# from app.models.db import Audio, VAD, Transcript
# from app.core.db import get_session, engine
# from app.services import storage, vad as vad_service, transcribe as tx_service
# from sqlmodel import Session

# router = APIRouter(prefix="/api", tags=["audio"])

# @router.post("/upload")
# async def upload_audio(
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
#     user_id: Optional[str] = Form(None),
#     session_id: Optional[str] = Form(None),
#     session=Depends(get_session),
# ):
#     # 1) Save to tmp
#     tmp_path = storage.TMP_DIR / f"{int(time.time()*1000)}_{file.filename}"
#     async with aiofiles.open(tmp_path, "wb") as out:
#         while chunk := await file.read(1024 * 1024):
#             await out.write(chunk)

#     # 2) Create DB row (processing)
#     audio = Audio(filename=file.filename, storage_path="", user_id=user_id, session_id=session_id)
#     session.add(audio); session.commit(); session.refresh(audio)

#     # 3) Move to final location and update
#     final_name = f"{audio.id}_{file.filename}"
#     final_path = storage.move_to_audio(str(tmp_path), final_name)
#     audio.storage_path = final_path
#     session.add(audio); session.commit()

#     # 4) Start background jobs (VAD + Transcription)
#     background_tasks.add_task(run_vad, audio.id)
#     background_tasks.add_task(run_transcription, audio.id)

#     return {"id": audio.id, "status": audio.status, "vad_ready": audio.vad_ready, "transcript_ready": audio.transcript_ready}


# def run_vad(audio_id: int):
#     with Session(engine) as s:
#         a = s.get(Audio, audio_id)
#         if not a: return
#         result = vad_service.compute_vad_from_wav(a.storage_path)
#         path = storage.vad_json_path(a.id)
#         vad_service.save_vad_json(result, path)
#         row = VAD(audio_id=a.id, storage_path=path)
#         s.add(row)
#         a.vad_ready = True
#         if a.transcript_ready:
#             a.status = "ready"
#         s.add(a)
#         s.commit()
#         # try:
#         #     result = vad_service.compute_vad_from_wav(a.storage_path)
#         #     path = storage.vad_json_path(a.id)
#         #     vad_service.save_vad_json(result, path)
#         #     row = VAD(audio_id=a.id, storage_path=path)
#         #     s.add(row)
#         #     a.vad_ready = True
#         #     if a.transcript_ready:
#         #         a.status = "ready"
#         #     s.add(a)
#         #     s.commit()
#         # except Exception:
#         #     a.status = "failed"; s.add(a); s.commit()

# def run_transcription(audio_id: int):
#     with Session(engine) as s:
#         a = s.get(Audio, audio_id)
#         if not a: return
#         try:
#             tx = tx_service.transcribe(a.storage_path)
#             print("[run_transcription] summary len:", len(tx.get("summary","")))
#             path = storage.transcript_json_path(a.id)
#             tx_service.save_transcript_json(tx, path)
#             print("[run_transcription] wrote:", path)

#             row = Transcript(audio_id=a.id, storage_path=path, summary=tx.get("summary"))
#             s.add(row)
#             a.transcript_ready = True
#             if a.vad_ready: a.status = "ready"
#             s.add(a); s.commit()
#             print("[run_transcription] committed for audio_id", audio_id)
#         except Exception as e:
#             print("[run_transcription] ERROR:", e)
#             a.status = "failed"; s.add(a); s.commit()


# @router.get("/audio/{audio_id}/status")
# def get_status(audio_id: int, session=Depends(get_session)):
#     a = session.get(Audio, audio_id)
#     if not a: raise HTTPException(404, "Not found")
#     return {"id": a.id, "status": a.status, "vad_ready": a.vad_ready, "transcript_ready": a.transcript_ready}


# @router.get("/audio/{audio_id}/vad")
# def get_vad(audio_id: int, session=Depends(get_session)):
#     v = session.exec(select(VAD).where(VAD.audio_id == audio_id)).first()
#     if not v: raise HTTPException(404, "VAD not ready")
#     with open(v.storage_path) as f:
#         data = json.load(f)
#     return data


# @router.get("/audio/{audio_id}/transcript")
# def get_transcript(audio_id: int, session=Depends(get_session)):
#     t = session.exec(select(Transcript).where(Transcript.audio_id == audio_id)).first()
#     if not t: raise HTTPException(404, "Transcript not ready")
#     with open(t.storage_path) as f:
#         data = json.load(f)
#     return data


# @router.get("/audio/{audio_id}/download")
# def download_audio(audio_id: int, session=Depends(get_session)):
#     a = session.get(Audio, audio_id)
#     if not a: raise HTTPException(404, "Not found")
#     def iterfile():
#         with open(a.storage_path, "rb") as f:
#             yield from f
#     return StreamingResponse(iterfile(), media_type="application/octet-stream")


# @router.get("/audio")
# def list_audio(user_id: Optional[str] = None, session_id: Optional[str] = None, session=Depends(get_session)):
#     q = select(Audio)
#     if user_id: q = q.where(Audio.user_id == user_id)
#     if session_id: q = q.where(Audio.session_id == session_id)
#     rows = session.exec(q.order_by(Audio.created_at.desc())).all()
#     return [
#         {"id": a.id, "user_id": a.user_id, "session_id": a.session_id, "filename": a.filename, "created_at": a.created_at.isoformat(), "status": a.status, "vad_ready": a.vad_ready, "transcript_ready": a.transcript_ready}
#         for a in rows
#     ]


