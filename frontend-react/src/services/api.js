// Backend API Base URL
export const BACKEND_URL = "https://sahil-ai-ai-music-backend.hf.space";

// Analyze Face
export const analyzeFace = async (imageBase64) => {
  const response = await fetch(`${BACKEND_URL}/analyze-face`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 }),
  });
  return response.json();
};

// Analyze Voice
export const analyzeVoice = async (audioBase64) => {
  const response = await fetch(`${BACKEND_URL}/analyze-voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio: audioBase64 }),
  });
  return response.json();
};

// Get Mood
export const getMood = async (faceEmotion, voiceEmotion) => {
  const response = await fetch(`${BACKEND_URL}/get-mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      face_emotion: faceEmotion,
      voice_emotion: voiceEmotion,
    }),
  });
  return response.json();
};

// Get Songs by Mood
export const getSongs = async (mood = "mixed") => {
  const response = await fetch(`${BACKEND_URL}/get-songs?mood=${mood}`);
  return response.json();
};

// Get Mood History
export const getMoodHistory = async () => {
  const response = await fetch(`${BACKEND_URL}/mood-history`);
  return response.json();
};

// Chat with AI
export const chatWithAI = async (message, mode) => {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode }),
  });
  return response.json();
};
