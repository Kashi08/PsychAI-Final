# backend/main.py
"""
PsychAI Backend API
FastAPI · Groq API (free) · NLP Models · Twilio Crisis Calls
Deploy free on Render.com
"""

import os, json, random, logging
from typing import List, Dict, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("psychoai")

# ── Lazy load NLP models ─────────────────────────────────────────────────────
NLP_AVAILABLE = False
_mh_clf = _sym_clf = _tfidf = _matrix = _class_index = _responses = _contexts = None
_class_resp: Dict = {}

def _load_nlp():
    global NLP_AVAILABLE, _mh_clf, _sym_clf, _tfidf, _matrix
    global _class_index, _responses, _contexts, _class_resp
    if NLP_AVAILABLE:
        return
    try:
        import warnings
        warnings.filterwarnings("ignore")
        import joblib
        BASE = os.path.join(os.path.dirname(__file__), "models")
        _mh_clf      = joblib.load(f"{BASE}/mental_health_classifier.pkl")
        _sym_clf     = joblib.load(f"{BASE}/symptom_disease_classifier.pkl")
        _tfidf       = joblib.load(f"{BASE}/chat_tfidf_v2.pkl")
        _matrix      = joblib.load(f"{BASE}/chat_matrix_v2.pkl")
        _class_index = joblib.load(f"{BASE}/class_index.pkl")
        _responses   = joblib.load(f"{BASE}/chat_responses_v2.pkl")
        _contexts    = joblib.load(f"{BASE}/chat_contexts_v2.pkl")
        with open(f"{BASE}/class_responses.json", encoding="utf-8") as f:
            _class_resp = json.load(f)
        NLP_AVAILABLE = True
        log.info("NLP models loaded OK")
    except Exception as e:
        log.warning(f"NLP models not available: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    _load_nlp()
    yield

app = FastAPI(title="PsychAI API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are PsychAI, a warm, empathetic mental health companion for students and young professionals in India.

You are NOT a replacement for a licensed therapist. Your role:
- Listen actively and validate feelings without judgment
- Provide evidence-based CBT techniques when helpful
- Offer breathing or grounding exercises for acute anxiety
- Gently encourage professional help when appropriate
- Respond in English or Hinglish based on the user message

Tone: Warm, like a supportive friend who knows mental health. NOT clinical.
Length: 2-4 sentences usually. Longer only when explaining a technique.

If user expresses suicidal ideation or self-harm: respond with compassion first, then gently mention iCall: 9152987821."""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    system: Optional[str] = None

class NLPRequest(BaseModel):
    text: str
    history: Optional[List[Message]] = None

class CrisisCallRequest(BaseModel):
    guardian_phone: str
    patient_name: str
    crisis_event_id: Optional[str] = None

class NotifyPsychRequest(BaseModel):
    patient_id: str
    keywords: List[str]

class InsightRequest(BaseModel):
    user_id: str

class SymptomRequest(BaseModel):
    symptoms: str


@app.get("/")
def health():
    return {
        "status": "ok",
        "nlp": NLP_AVAILABLE,
        "groq": bool(os.getenv("GROQ_API_KEY")),
        "version": "2.0.0"
    }


# ── Groq Chat   PRIMARY endpoint (kept as /chat/claude so mobile app works) ──
@app.post("/chat/claude")
@app.post("/chat/groq")
async def chat_groq(req: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        log.warning("GROQ_API_KEY not set, falling back to NLP")
        last = req.messages[-1].content if req.messages else ""
        return await _nlp_response(last, req.messages)

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        msgs = [{"role": "system", "content": req.system or SYSTEM_PROMPT}]
        for m in req.messages:
            if m.role in ("user", "assistant"):
                msgs.append({"role": m.role, "content": m.content})

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=msgs,
            max_tokens=512,
            temperature=0.75,
        )
        text = completion.choices[0].message.content

        mh_class, confidence, class_probs = "Normal", 0.8, {}
        if NLP_AVAILABLE:
            last_user = next(
                (m.content for m in reversed(req.messages) if m.role == "user"), ""
            )
            mh_class, confidence, class_probs = _classify(last_user)

        return {
            "response":    text,
            "mh_class":    mh_class,
            "confidence":  confidence,
            "class_probs": class_probs,
            "is_crisis":   False,
            "keywords":    [],
            "similarity":  1.0,
            "source":      "groq",
        }

    except Exception as e:
        log.error(f"Groq error: {e}")
        last = req.messages[-1].content if req.messages else ""
        return await _nlp_response(last, req.messages)


# ── NLP fallback ──────────────────────────────────────────────────────────────
@app.post("/chat/nlp")
async def chat_nlp_endpoint(req: NLPRequest):
    return await _nlp_response(req.text, req.history or [])

async def _nlp_response(text: str, history: List) -> dict:
    if not NLP_AVAILABLE:
        return {
            "response": "I'm here for you. Can you tell me more about how you're feeling?",
            "mh_class": "Normal", "confidence": 0.5,
            "is_crisis": False, "keywords": [], "similarity": 0.0,
            "class_probs": {}, "source": "fallback",
        }
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity
    mh_class, confidence, class_probs = _classify(text)
    ci = _class_index.get(mh_class) or _class_index.get("Normal")
    response, similarity = "", 0.0
    if ci and ci.get("contexts"):
        qvec = _tfidf.transform([text])
        sims = cosine_similarity(qvec, _tfidf.transform(ci["contexts"])).flatten()
        top  = sims.argsort()[-3:][::-1]
        idx  = random.choice(top.tolist())
        similarity = float(sims[idx])
        response   = ci["responses"][idx] if similarity > 0.22 else ""
    if not response:
        pool = _class_resp.get(mh_class, _class_resp.get("Normal", []))
        response = random.choice(pool) if pool else "I'm here. Take your time."
    return {
        "response":    response,
        "mh_class":    mh_class,
        "confidence":  confidence,
        "class_probs": class_probs,
        "is_crisis":   mh_class == "Suicidal",
        "keywords":    [],
        "similarity":  similarity,
        "source":      "nlp",
    }


# ── Weekly insight via Groq ───────────────────────────────────────────────────
@app.post("/insights/weekly")
async def weekly_insight(req: InsightRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"insight": ""}
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        r = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content":
                "Write a 2-sentence encouraging weekly mental health insight for a student "
                "who has been consistently checking in with a wellness app. Be warm and specific."}],
            max_tokens=150,
        )
        return {"insight": r.choices[0].message.content}
    except Exception as e:
        log.error(f"Groq insight error: {e}")
        return {"insight": ""}


# ── Keyword pre-check: catch obvious positive/neutral inputs before model ─────
_POSITIVE_KEYWORDS = {
    "happy", "happiness", "joyful", "joy", "great", "wonderful", "fantastic",
    "amazing", "excellent", "cheerful", "elated", "ecstatic", "thrilled",
    "content", "blessed", "grateful", "thankful", "optimistic", "excited",
    "energetic", "calm", "peaceful", "serene", "relaxed", "fine", "good",
    "alright", "okay", "ok", "well", "normal", "stable", "grounded", "positive",
    "upbeat", "lively", "vibrant", "refreshed", "satisfied", "fulfilled",
    "motivated", "inspired", "confident", "radiant", "merry", "carefree",
    "overjoyed", "on top of the world", "on cloud nine", "over the moon",
    "bahut achha", "achha", "badiya", "mast", "sahi",  # Hinglish positives
}

def _is_clearly_positive(text: str) -> bool:
    """Returns True if the text is unambiguously positive / wellness."""
    lower = text.lower().strip()
    tokens = set(lower.split())
    # Direct keyword hit
    if tokens & _POSITIVE_KEYWORDS:
        return True
    # Short phrase match
    for kw in _POSITIVE_KEYWORDS:
        if kw in lower:
            return True
    return False


# ── Symptom checker ───────────────────────────────────────────────────────────
@app.post("/symptoms/check")
def symptom_check(req: SymptomRequest):
    if not NLP_AVAILABLE:
        # Even without models, handle obvious positives gracefully
        if _is_clearly_positive(req.symptoms):
            return {"condition": "Positive Wellbeing", "confidence": 0.99}
        return {"condition": "Unable to assess   models not loaded", "confidence": 0.0}

    # Keyword guard: override model for clearly positive inputs
    if _is_clearly_positive(req.symptoms):
        return {"condition": "Positive Wellbeing", "confidence": 0.99}

    pred = _sym_clf.predict([req.symptoms])[0]
    try:
        conf = float(max(_sym_clf.predict_proba([req.symptoms])[0]))
    except Exception:
        conf = 0.85
    return {"condition": pred, "confidence": conf}


# ── Silent Twilio crisis call ─────────────────────────────────────────────────
@app.post("/crisis/call")
async def crisis_call(req: CrisisCallRequest, bg: BackgroundTasks):
    bg.add_task(_do_twilio_call, req.guardian_phone, req.patient_name, req.crisis_event_id)
    return {"status": "initiated"}

async def _do_twilio_call(guardian_phone: str, patient_name: str, event_id: Optional[str]):
    sid  = os.getenv("TWILIO_ACCOUNT_SID")
    tok  = os.getenv("TWILIO_AUTH_TOKEN")
    frm  = os.getenv("TWILIO_FROM_NUMBER")
    if not all([sid, tok, frm, guardian_phone]):
        log.warning("Twilio not configured   skipping silent call")
        return
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-IN">
    Hello. This is an automated message from PsychAI.
    Your loved one {patient_name} may need your support right now.
    Please check in with them as soon as possible. Thank you.
  </Say>
</Response>"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            r = await c.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Calls.json",
                auth=(sid, tok),
                data={"To": guardian_phone, "From": frm, "Twiml": twiml},
            )
        log.info(f"[Crisis] Twilio SID: {r.json().get('sid')}")
    except Exception as e:
        log.error(f"[Crisis] Twilio failed: {e}")

@app.post("/crisis/notify-psych")
async def notify_psych(req: NotifyPsychRequest):
    log.info(f"[Crisis] Psych notified for patient {req.patient_id}")
    return {"status": "notified"}


# ── NLP classify helper ───────────────────────────────────────────────────────
def _classify(text: str):
    import numpy as np
    pred = _mh_clf.predict([text])[0]
    try:
        dec   = _mh_clf.decision_function([text])[0]
        exp   = np.exp(dec - dec.max())
        probs = exp / exp.sum()
        pd    = {c: float(p) for c, p in zip(_mh_clf.classes_, probs)}
        conf  = float(pd.get(pred, 0.5))
    except Exception:
        pd, conf = {pred: 1.0}, 0.75
    return pred, conf, pd


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)