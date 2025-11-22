from typing import Dict, List
import numpy as np, json
from pathlib import Path
import soundfile as sf
import numpy as np
import torch
import torch.nn as nn
from transformers import Wav2Vec2Processor
from transformers.models.wav2vec2.modeling_wav2vec2 import (
    Wav2Vec2Model,
    Wav2Vec2PreTrainedModel,
)
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import librosa
from datetime import datetime, timezone

def load_audio(path, sr=16000):
    x, _ = librosa.load(path, sr=sr, mono=True)
    peak = np.max(np.abs(x)) + 1e-9
    return (0.95 * x / peak) if peak > 0 else x, sr

class RegressionHead(nn.Module):
    r"""Classification head."""

    def __init__(self, config):

        super().__init__()

        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        self.dropout = nn.Dropout(config.final_dropout)
        self.out_proj = nn.Linear(config.hidden_size, config.num_labels)

    def forward(self, features, **kwargs):

        x = features
        x = self.dropout(x)
        x = self.dense(x)
        x = torch.tanh(x)
        x = self.dropout(x)
        x = self.out_proj(x)

        return x

class EmotionModel(Wav2Vec2PreTrainedModel):
    r"""Speech emotion classifier."""

    def __init__(self, config):

        super().__init__(config)

        self.config = config
        self.wav2vec2 = Wav2Vec2Model(config)
        self.classifier = RegressionHead(config)
        self.init_weights()

    def forward(
            self,
            input_values,
    ):

        outputs = self.wav2vec2(input_values)
        hidden_states = outputs[0]
        hidden_states = torch.mean(hidden_states, dim=1)
        logits = self.classifier(hidden_states)

        return hidden_states, logits

def process_func(
    x: np.ndarray,
    sampling_rate: int,
    embeddings: bool = False,
) -> np.ndarray:
    r"""Predict emotions or extract embeddings from raw audio signal."""
    device = 'cpu'
    model_name = 'audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim'
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    model = EmotionModel.from_pretrained(model_name).to(device)
    # run through processor to normalize signal
    # always returns a batch, so we just get the first entry
    # then we put it on the device
    y = processor(x, sampling_rate=sampling_rate)
    y = y['input_values'][0]
    y = y.reshape(1, -1)
    y = torch.from_numpy(y).to(device)

    # run through model
    with torch.no_grad():
        y = model(y)[0 if embeddings else 1]

    # convert to numpy
    y = y.detach().cpu().numpy()

    return y

def _guess_recorded_date(audio_path: str) -> str:
    """
    Best-effort: use file mtime as 'recording date'; fallback to today's date.
    Returns YYYY-MM-DD (local time).
    """
    try:
        ts = os.stat(audio_path).st_mtime
        local_dt = datetime.fromtimestamp(ts).astimezone()  # local tz
    except Exception:
        local_dt = datetime.now().astimezone()
    return local_dt.date().isoformat()

def compute_vad_from_wav(audio_path: str, fps: int = 25) -> Dict:

    y, sr = load_audio(audio_path)
    dur_ms = int(len(y) / sr * 1000) if len(y) else 0
    n = max(1, int((dur_ms/1000) * fps))
    t_ms = np.linspace(0, dur_ms, n, dtype=int)

    signal, sr = load_audio(audio_path, sr=16000)
    a = process_func(signal, sr)[0][0]
    d = process_func(signal, sr)[0][1]
    v = process_func(signal, sr)[0][2]
    
    return {
        "duration": float(dur_ms),
        "vad": {
            "valence": float(v),
            "arousal": float(a),
            "dominance": float(d),
        },
        "recorded_date": _guess_recorded_date(audio_path),
    }



# def compute_vad_from_wav(filepath: str) -> Dict:

#     # Demo synthetic curves (5 s @ 50 Hz)
#     duration_s = 5.0
#     frame_hz = 50
#     n = int(duration_s * frame_hz)
#     t = np.linspace(0, duration_s, n, endpoint=False)

#     # Replace these with your model outputs
#     valence = 0.5 + 0.5 * np.sin(2 * np.pi * 0.20 * t)       # 0..1
#     arousal = 0.5 + 0.5 * np.sin(2 * np.pi * 0.50 * t + 1.0) # 0..1
#     dominance = 0.5 + 0.5 * np.cos(2 * np.pi * 0.33 * t)     # 0..1

#     # Simple segmenter: contiguous regions where arousal > 0.6
#     segments: List[List[float]] = []
#     above = arousal > 0.6
#     start = None
#     for i, flag in enumerate(above):
#         if flag and start is None:
#             start = i / frame_hz
#         if not flag and start is not None:
#             segments.append([start, i / frame_hz])
#             start = None
#     if start is not None:
#         segments.append([start, n / frame_hz])

#     return {
#         "frame_hz": frame_hz,
#         # Keep this for the frontend sparkline (uses arousal)
#         "frames": np.round(arousal, 3).tolist(),
#         "vad": {
#             "valence": np.round(valence, 3).tolist(),
#             "arousal": np.round(arousal, 3).tolist(),
#             "dominance": np.round(dominance, 3).tolist(),
#         },
#         "summary": {
#             "valence_mean": float(np.mean(valence)),
#             "arousal_mean": float(np.mean(arousal)),
#             "dominance_mean": float(np.mean(dominance)),
#             "segments": segments,
#         },
#     }

def save_vad_json(vad: Dict, out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(vad, f)