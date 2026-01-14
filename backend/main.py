# -----------------------------
# AI POWERED MUSIC PLAYER - BACKEND
# -----------------------------
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch
from transformers import pipeline, Wav2Vec2FeatureExtractor, Wav2Vec2ForSequenceClassification
from PIL import Image
import threading
import base64
import io
import numpy as np
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import json
import google.generativeai as genai
import os


app = FastAPI(title="AIzaSyCAql65Fi_OnY-19ueE0XT8OyPObElbxtc", version="3.0")


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount songs folder
SONGS_DIR = Path(__file__).parent / "songs"
if not SONGS_DIR.exists():
    SONGS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/songs", StaticFiles(directory=str(SONGS_DIR)), name="songs")


# -----------------------------
# CONFIGURE GEMINI API
# -----------------------------
GEMINI_API_KEY = "AIzaSyCAql65Fi_OnY-19ueE0XT8OyPObElbxtc"
genai.configure(api_key=GEMINI_API_KEY)


# Model family (working one)
MODEL_NAME = "gemini-flash-latest"   # ya "gemini-2.5-flash" agar isme issue aaye
chat_model = genai.GenerativeModel(MODEL_NAME)


# -----------------------------
# REQUEST MODELS
# -----------------------------
class ImageRequest(BaseModel):
    image: str


class AudioRequest(BaseModel):
    audio: str


class MoodRequest(BaseModel):
    face_emotion: str
    voice_emotion: str


class MoodHistoryEntry(BaseModel):
    mood: str
    timestamp: str
    face_emotion: str
    voice_emotion: str


class ChatRequest(BaseModel):
    message: str
    mode: str


# -----------------------------
# GLOBAL MODELS & DATA
# -----------------------------
face_model = None
voice_processor = None
voice_model = None
mood_history: List[Dict] = []
chat_history: Dict[str, list] = {}


# -----------------------------
# 🆕 HISTORY HELPER FUNCTION (NEW)
# -----------------------------
def calculate_mood_stats():
    """Calculate statistics from mood history"""
    if not mood_history:
        return {
            "total": 0,
            "most_common_mood": None,
            "mood_counts": {"high": 0, "neutral": 0, "low": 0},
            "last_7_moods": []
        }
    
    # Count moods
    mood_counts = {"high": 0, "neutral": 0, "low": 0}
    for entry in mood_history:
        mood = entry.get("mood", "neutral")
        if mood in mood_counts:
            mood_counts[mood] += 1
    
    # Most common mood
    most_common = max(mood_counts, key=mood_counts.get) if sum(mood_counts.values()) > 0 else None
    
    # Last 7 moods
    last_7 = mood_history[-7:] if len(mood_history) >= 7 else mood_history
    
    return {
        "total": len(mood_history),
        "most_common_mood": most_common,
        "mood_counts": mood_counts,
        "last_7_moods": last_7
    }


# -----------------------------
# LOAD AI MODELS (HUGGINGFACE)
# -----------------------------
def load_face_model():
    global face_model
    print("🔄 Loading face emotion model...")
    # HuggingFace image classification pipeline
    face_model = pipeline(
        "image-classification",
        model="dima806/facial_emotions_image_detection"
    )
    print("✅ Face emotion model loaded!")


def load_voice_model():
    global voice_processor, voice_model
    print("🔄 Loading voice emotion model...")
    voice_processor = Wav2Vec2FeatureExtractor.from_pretrained(
        "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    )
    voice_model = Wav2Vec2ForSequenceClassification.from_pretrained(
        "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    )
    print("✅ Voice emotion model loaded!")


@app.on_event("startup")
def load_models():
    print("🚀 Starting AI Music Player Backend...")
    # Dono models parallel threads me load
    t1 = threading.Thread(target=load_face_model)
    t2 = threading.Thread(target=load_voice_model)
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    print("✅ All models loaded successfully!")


# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def decode_image(base64_str):
    image_data = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return image


def decode_audio(base64_str):
    audio_data = base64.b64decode(base64_str)
    # frontend se float32 raw aa raha hai (detect.html waala)
    audio = np.frombuffer(audio_data, dtype=np.float32)
    return audio


def detect_voice_emotion(audio_data, fs=16000):
    """
    audio_data: numpy array (float32) mono, 16kHz
    """
    if voice_processor is None or voice_model is None:
        return "neutral"

    inputs = voice_processor(
        audio_data,
        sampling_rate=fs,
        return_tensors="pt",
        padding=True
    )
    with torch.no_grad():
        logits = voice_model(**inputs).logits
    predicted_id = torch.argmax(logits, dim=-1).item()
    emotion = voice_model.config.id2label[predicted_id]
    print(f"[VOICE] Emotion detected: {emotion}")
    return emotion


def map_emotion_to_mood(face, voice):
    low = ["sad", "angry", "fear", "disgust"]
    high = ["happy", "surprise"]
    if face.lower() in low or voice.lower() in low:
        return "low"
    elif face.lower() in high or voice.lower() in high:
        return "high"
    else:
        return "neutral"


def get_local_songs(mood=None):
    if mood and mood != "mixed":
        mood_folder = SONGS_DIR / mood
    else:
        mood_folder = SONGS_DIR / "mixed"
    if not mood_folder.exists():
        return []
    songs = []
    supported_formats = ['.mp3', '.wav', '.ogg', '.m4a']
    for file_path in mood_folder.iterdir():
        if file_path.suffix.lower() in supported_formats:
            songs.append({
                "id": file_path.stem,
                "name": file_path.stem.replace('-', ' ').title(),
                "path": f"/songs/{mood if mood != 'mixed' else 'mixed'}/{file_path.name}",
                "mood": mood or "mixed"
            })
    return songs


# -----------------------------
# API ENDPOINTS
# -----------------------------
@app.get("/")
def read_root():
    return {"status": "🎧 AI Music Player Running", "version": "3.0"}


# 👉 Real face emotion detection
@app.post("/analyze-face")
def analyze_face(request: ImageRequest):
    try:
        if face_model is None:
            raise HTTPException(status_code=500, detail="Face model not loaded")
        image = decode_image(request.image)
        result = face_model(image)
        face_emotion = result[0]["label"]
        print(f"[FACE] Emotion detected: {face_emotion}")
        return {"face_emotion": face_emotion}
    except Exception as e:
        print("Face analyze error:", e)
        # fallback so app doesn't crash
        return {"face_emotion": "neutral"}


# 👉 Real voice emotion detection
@app.post("/analyze-voice")
def analyze_voice(request: AudioRequest):
    try:
        if voice_processor is None or voice_model is None:
            raise HTTPException(status_code=500, detail="Voice model not loaded")
        audio = decode_audio(request.audio)
        voice_emotion = detect_voice_emotion(audio)
        return {"voice_emotion": voice_emotion}
    except Exception as e:
        print("Voice analyze error:", e)
        return {"voice_emotion": "neutral"}


@app.post("/get-mood")
def get_mood(request: MoodRequest):
    mood = map_emotion_to_mood(request.face_emotion, request.voice_emotion)
    mood_history.append({
        "mood": mood,
        "timestamp": datetime.now().isoformat(),
        "face_emotion": request.face_emotion,
        "voice_emotion": request.voice_emotion
    })
    return {"mood": mood}


@app.get("/get-songs")
def get_songs_endpoint(mood: str = "mixed"):
    return {"songs": get_local_songs(mood), "mood": mood}


# -----------------------------
# 🆕 MOOD HISTORY ENDPOINT (NEW)
# -----------------------------
@app.get("/mood-history")
def get_mood_history():
    """Get mood history with statistics"""
    try:
        stats = calculate_mood_stats()
        return {
            "stats": stats,
            "history": mood_history
        }
    except Exception as e:
        print(f"❌ Error getting history: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading history: {str(e)}")


# -----------------------------
# 🤖 GEMINI CHAT ENDPOINT (STRICT MODES)
# -----------------------------
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # Har mode ke liye alag strict instruction
        if request.mode == "roast":
            system_instruction = (
                "You are a savage but friendly roasting bot.\n"
                "- User will tell their mood or situation.\n"
                "- Reply ONLY with 2-4 spicy roast lines in Hinglish.\n"
                "- No explanation, no advice, no emojis list, no generic talk.\n"
                "- Har line choti, thodi savage but funny ho."
            )
        elif request.mode == "bollywood":
            system_instruction = (
                "You are a Bollywood dialogue generator.\n"
                "- User will tell their mood or situation.\n"
                "- Reply ONLY with 2-4 Bollywood-style dialogues in Hindi/Hinglish.\n"
                "- Har dialogue alag line me ho.\n"
                "- Dialogue me movie ka exact naam mat likho, sirf filmy style.\n"
                "- Koi explanation, advice ya normal baat mat likho."
            )
        elif request.mode == "advice":
            system_instruction = (
                "You are a life-advice coach.\n"
                "- User will tell feelings like sad, stressed, overthinking etc.\n"
                "- Reply ONLY with 3-5 short bullet-point life advice lines.\n"
                "- Har point 1 line ka ho, simple Hindi/Hinglish.\n"
                "- Koi roast, joke, Bollywood dialogue ya extra chit-chat mat karo."
            )
        else:  # normal = Ask Anything
            system_instruction = (
                "You are a helpful general AI assistant.\n"
                "- User can ask anything.\n"
                "- Give a clear, concise answer.\n"
                "- Use bullet points when useful."
            )

        full_prompt = (
            f"{system_instruction}\n\n"
            f"User message (mood / question): {request.message}"
        )

        response = chat_model.generate_content(full_prompt)
        return {"response": response.text}

    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return {"response": f"⚠️ Gemini Error: {e}"}
