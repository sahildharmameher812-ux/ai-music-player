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

app = FastAPI(title="AI Music Player Backend", version="3.0")

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
# --- 🚨 FINAL ERROR FIX 🚨 ---
genai.configure(api_key="AIzaSyCAql65Fi_OnY-19ueE0XT8OyPObElbxtc")

# Model ka naam hum string me hardcode karenge mismatch se bachne ke liye
chat_model = genai.GenerativeModel('gemini-1.5-flash')
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

# -----------------------------
# HISTORY HELPER FUNCTIONS
# -----------------------------
def calculate_mood_stats():
    if not mood_history:
        return {"total": 0, "most_common_mood": None, "mood_counts": {"high": 0, "neutral": 0, "low": 0}, "last_7_moods": []}
    
    mood_counts = {"high": 0, "neutral": 0, "low": 0}
    for entry in mood_history:
        m = entry.get("mood", "neutral")
        if m in mood_counts: mood_counts[m] += 1
    
    most_common = max(mood_counts, key=mood_counts.get)
    return {"total": len(mood_history), "most_common_mood": most_common, "mood_counts": mood_counts, "last_7_moods": mood_history[-7:]}

# -----------------------------
# LOAD AI MODELS
# -----------------------------
def load_face_model():
    global face_model
    face_model = pipeline("image-classification", model="dima806/facial_emotions_image_detection")

def load_voice_model():
    global voice_processor, voice_model
    voice_processor = Wav2Vec2FeatureExtractor.from_pretrained("ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")
    voice_model = Wav2Vec2ForSequenceClassification.from_pretrained("ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")

@app.on_event("startup")
def load_models():
    t1 = threading.Thread(target=load_face_model)
    t2 = threading.Thread(target=load_voice_model)
    t1.start()
    t2.start()
    t1.join()
    t2.join()

# -----------------------------
# CORE LOGIC FUNCTIONS
# -----------------------------
def decode_image(base64_str):
    if "," in base64_str: base64_str = base64_str.split(",")[1]
    return Image.open(io.BytesIO(base64.b64decode(base64_str))).convert("RGB")

def decode_audio(base64_str):
    if "," in base64_str: base64_str = base64_str.split(",")[1]
    return np.frombuffer(base64.b64decode(base64_str), dtype=np.float32)

def detect_voice_emotion(audio_data, fs=16000):
    if not voice_model: return "neutral"
    inputs = voice_processor(audio_data, sampling_rate=fs, return_tensors="pt", padding=True)
    with torch.no_grad():
        logits = voice_model(**inputs).logits
    return voice_model.config.id2label[torch.argmax(logits, dim=-1).item()]

def map_emotion_to_mood(face, voice):
    low = ["sad", "angry", "fear", "disgust"]
    high = ["happy", "surprise"]
    if face.lower() in low or voice.lower() in low: return "low"
    if face.lower() in high or voice.lower() in high: return "high"
    return "neutral"

def get_local_songs(mood=None):
    folder = SONGS_DIR / (mood if mood and mood != "mixed" else "mixed")
    if not folder.exists(): return []
    songs = []
    for f in folder.iterdir():
        if f.suffix.lower() in ['.mp3', '.wav', '.ogg', '.m4a']:
            songs.append({"id": f.stem, "name": f.stem.replace('-', ' ').title(), "path": f"/songs/{folder.name}/{f.name}", "mood": mood or "mixed"})
    return songs

# -----------------------------
# API ENDPOINTS
# -----------------------------
@app.get("/")
def read_root():
    return {"status": "🎧 AI Music Player Running", "version": "3.0"}

@app.post("/analyze-face")
def analyze_face(request: ImageRequest):
    try:
        res = face_model(decode_image(request.image))
        return {"face_emotion": res[0]["label"]}
    except: return {"face_emotion": "neutral"}

@app.post("/analyze-voice")
def analyze_voice(request: AudioRequest):
    try:
        return {"voice_emotion": detect_voice_emotion(decode_audio(request.audio))}
    except: return {"voice_emotion": "neutral"}

@app.post("/get-mood")
def get_mood(request: MoodRequest):
    mood = map_emotion_to_mood(request.face_emotion, request.voice_emotion)
    mood_history.append({"mood": mood, "timestamp": datetime.now().isoformat(), "face_emotion": request.face_emotion, "voice_emotion": request.voice_emotion})
    return {"mood": mood}

@app.get("/get-songs")
def get_songs_endpoint(mood: str = "mixed"):
    return {"songs": get_local_songs(mood), "mood": mood}

@app.get("/mood-history")
def get_mood_history():
    return {"stats": calculate_mood_stats(), "history": mood_history}

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # Prompt logic
        prompts = {
            "roast": "Reply ONLY with 2-4 spicy roast lines in Hinglish. No explanation.",
            "bollywood": "Reply ONLY with 2-4 Bollywood-style dialogues in Hinglish. No explanation.",
            "advice": "Reply ONLY with 3-5 short bullet-point life advice lines in Hinglish."
        }
        sys_msg = prompts.get(request.mode, "You are a helpful general AI assistant.")
        full_prompt = f"{sys_msg}\n\nUser: {request.message}"
        
        response = chat_model.generate_content(full_prompt)
        return {"response": response.text if response.text else "Bhai, AI ne kuch nahi bola."}
    except Exception as e:
        return {"response": "Bhai, Gemini API thoda busy hai, page refresh karo!"}