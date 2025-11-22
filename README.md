# **Minuet: Voice-Journaling with Emotional Intelligence**
*A lightweight, privacy-first platform for reflective voice journaling and real-time emotional insight.*

Minuet is an experimental project that turns everyday voice memos into a richer form of self-reflection. It combines **speech processing**, **voice-activity detection (VAD)**, and **emotion classification** to help users understand not just *what* they say, but *how* they say it.

Designed for students, creators, and anyone curious about emotional patterns in their daily life.

---

## ✨ Features

### 🎙️ Voice Journaling  
Record short or long-form audio journals directly in the browser. Audio is processed locally, then sent to the backend for analysis.

### 🔎 Voice-Activity Detection (VAD)  
Automatic segmentation of speech vs. silence for cleaner emotional modeling and better diarization.

### 😊 Emotional Analysis  
A lightweight emotional-regression model (fine-tuned on robust speech features) predicts continuous affective dimensions (e.g., valence, arousal) from voice.

### 🖥️ Full-Stack Architecture  
- **Frontend:** Next.js + Tailwind, custom UI for recording, waveform visualization, and playback.  
- **Backend:** FastAPI server handling audio uploads, feature extraction, and model inference.  
- **ML Pipeline:** wav2vec2-style encoder used to extract robust speech embeddings, regressed through a lightweight head.

### 🔐 Privacy-First  
All journal entries remain local unless the user explicitly chooses to save or export them.

---

## 🏗️ Tech Stack

**Frontend**
- Next.js  
- React Hooks for audio handling  
- Canvas / Web Audio API visualization  
- TailwindCSS  

**Backend**
- FastAPI  
- Python audio preprocessing (librosa, torchaudio)  
- Emotion-regression inference  
- REST endpoints for upload + analysis  

**Machine Learning**
- wav2vec2-large-robust-12-ft-emotion-msp-dim encoder  
- Custom regression head for continuous emotion prediction  
- VAD segmentation and smoothing  
