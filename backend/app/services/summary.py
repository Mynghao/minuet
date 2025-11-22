import os, json, logging, traceback
from pathlib import Path
from typing import Dict, Any, Optional
import anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
#ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")

log = logging.getLogger("summary")
if not log.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

def summarize_from_transcript(transcript_json_path: str) -> Dict[str, Any]:
    with open(transcript_json_path) as f:
        tx = json.load(f)
    transcript_text = tx.get("transcript", "") or ""

    summary_text = transcript_text
    source = "transcript"
    if ANTHROPIC_API_KEY:
        try:
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            msg = client.messages.create(
                model="claude-opus-4-1-20250805",
                max_tokens=300,
                temperature=0.7,
                messages=[{
                    "role": "user",
                    "content": (
                        "You are an empathetic assistant for a mental health journaling app.\n"
                        "Summarize the user's journal entry in 1–3 sentences. Be more objective than giving advice, while still sounding nice.\n\n"
                        f'Journal entry (verbatim):\n"{transcript_text}"\n\n'
                        "Reply with only the summary text."
                    ),
                }],
            )
            summary_text = (msg.content[0].text or "").strip() or transcript_text
            source = "anthropic"
        except Exception:
            log.warning("Anthropic summary failed; falling back to transcript.\n" + traceback.format_exc())

    return {"summary": summary_text, "summary_source": source}

def save_summary_json(obj: Dict[str, Any], out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(obj, f)
