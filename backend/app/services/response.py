import os, json, logging, traceback
from pathlib import Path
from typing import Dict, Any, Optional
import anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
#ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")

log = logging.getLogger("response")
if not log.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

def load_json(path: str) -> Dict[str, Any]:
    with open(path) as f:
        return json.load(f)

def generate_response(transcript_path: str, summary_path: str, emotion_path: Optional[str]) -> Dict[str, Any]:
    tx = load_json(transcript_path)
    sm = load_json(summary_path)
    em = load_json(emotion_path) if (emotion_path and Path(emotion_path).exists()) else None

    transcript_text = tx.get("transcript", "") or ""
    summary_text = sm.get("summary", "") or transcript_text
    valence = em["vad"]["valence"] if em else None
    arousal = em["vad"]["arousal"] if em else None
    dominance = em["vad"]["dominance"] if em else None

    prompt = (
        "You are an empathetic assistant for a mental health journaling app.\n"
        "Using the provided summary (and emotion cues if present), write a 1–3 sentence response "
        "that acknowledges feelings and offers a gentle next step.\n\n"
        f"Summary: {summary_text}\n"
        f"Emotion (optional): valence={valence}, arousal={arousal}, dominance={dominance}\n\n"
        '''
**Instructions:**
1. Interpret the users emotional state from these three values.
   - If Valence is low -> assume sadness, frustration, or distress.
   - If Valence is high -> assume happiness or satisfaction.
   - If Arousal is high -> assume agitation, restlessness, or excitement.
   - If Arousal is low -> assume calmness or fatigue.
   - If Dominance is low -> assume vulnerability or lack of control.
   - If Dominance is high -> assume confidence or empowerment.
2. Combine this interpretation with the journal transcript/summary to understand the context.
3. Respond in a warm, supportive, nonjudgmental tone.
   - **If Valence < 0.5 and Arousal > 0.6:** SUBTLY acknowledge their negative feelings, offer grounding advice.
   - **If Valence < 0.5 and Arousal < 0.4:** gently validate sadness or fatigue, offer comfort and encouragement.
   - **If Valence > 0.5 and Arousal > 0.6:** celebrate the excitement, but encourage balance.
   - **If Valence > 0.5 and Arousal < 0.4:** encourage gratitude, reflection, or savoring calm moments.
   - **If Dominance < 0.4:** focus on empowerment, reminding the user of small steps they can control.
   - **If Dominance > 0.6:** reinforce their sense of agency while reminding them to stay compassionate toward themselves.
4. Write ~1.5 ***SHORT*** sentences maximum with GOOD READABILITY for this part of the response.
   - Don't try to intentionally acknowledge their emotion or day; that just reminds them more of their negativity
   - SLIGHTLY ackenlowledge what they have done in the day based on the transcript and summary, but don't make the response too overly or obviously dependent on the content.
   - Offer supportive or inspirational suggestions
   - Do NOT make it too formal; more cordial, light-hearted, friend-like, without being TOO informal
   - Never give medical advice or directives beyond safe coping strategies.'''
   "Output format: Respond only with the text of your reply. the end of the response should ALWAYS end with **And finally, here is a tune to wrap up your day :)**. No JSON. No additional commentary."
    )
    #print(prompt)
    reply = summary_text  # fallback
    if ANTHROPIC_API_KEY:
        try:
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            msg = client.messages.create(
                model="claude-opus-4-1-20250805",
                max_tokens=300,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}],
            )
            reply = (msg.content[0].text or "").strip() or summary_text
        except Exception:
            #print(e)
            log.warning("Anthropic response failed; using summary as reply.\n" + traceback.format_exc())

    return {"response": reply}

def save_response_json(obj: Dict[str, Any], out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(obj, f)
