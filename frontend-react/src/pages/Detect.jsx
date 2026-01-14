import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as faceapi from '@vladmandic/face-api';
import { analyzeFace, analyzeVoice, getMood } from '../services/api';
import './Detect.css';

const Detect = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [showInfo, setShowInfo] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [result, setResult] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);

  // Load Face-API models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face models:', err);
      }
    };
    loadModels();
  }, []);

  // Start Detection
  const startDetection = async () => {
    try {
      setShowInfo(false);
      setStatus('⏳ Requesting camera and microphone access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      const vStream = new MediaStream(stream.getVideoTracks());
      const aStream = new MediaStream(stream.getAudioTracks());

      setVideoStream(vStream);
      setAudioStream(aStream);

      if (videoRef.current) {
        videoRef.current.srcObject = vStream;
      }

      setStatus('✅ Ready! Click "Capture & Analyze" to begin');
      startFaceDetection();
    } catch (err) {
      setStatus('❌ Please allow camera & microphone access');
      console.error(err);
    }
  };

  // Real-time Face Detection
  const startFaceDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !modelsLoaded) return;

    const detectInterval = setInterval(async () => {
      if (!video.paused && video.readyState === 4) {
        const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
        faceapi.matchDimensions(canvas, displaySize);

        try {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw boxes
          resizedDetections.forEach(detection => {
            const box = detection.box;
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 10;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          });

          ctx.shadowBlur = 0;
        } catch (err) {
          console.error('Detection error:', err);
        }
      }
    }, 100);

    return () => clearInterval(detectInterval);
  };

  // Capture Image
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg').split(',')[1];
  };

  // Record Audio
  const recordAudio = (duration) => {
    return new Promise((resolve, reject) => {
      if (!audioStream) {
        reject('No audio stream');
        return;
      }

      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(audioStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const audioChunks = [];

      processor.onaudioprocess = (e) => {
        audioChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setTimeout(() => {
        processor.disconnect();
        source.disconnect();

        const totalLength = audioChunks.reduce((a, c) => a + c.length, 0);
        const audioData = new Float32Array(totalLength);
        let offset = 0;

        for (const chunk of audioChunks) {
          audioData.set(chunk, offset);
          offset += chunk.length;
        }

        const bytes = new Uint8Array(audioData.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 8192) {
          binary += String.fromCharCode.apply(null, bytes.slice(i, i + 8192));
        }

        resolve(btoa(binary));
        audioContext.close();
      }, duration);
    });
  };

  // Analyze
  const analyze = async () => {
    setIsDetecting(true);
    setResult(null);

    try {
      // Step 1: Capture Face
      setStatus('📷 Capturing your face...');
      await new Promise(r => setTimeout(r, 1000));
      const imageBase64 = captureImage();

      // Step 2: Analyze Face
      setStatus('🔄 Detecting facial emotion...');
      const faceData = await analyzeFace(imageBase64);

      // Step 3: Record Voice
      setStatus('🎤 Speak now for 3 seconds...');
      const audioBase64 = await recordAudio(3000);

      // Step 4: Analyze Voice
      setStatus('🔄 Analyzing voice emotion...');
      const voiceData = await analyzeVoice(audioBase64);

      // Step 5: Calculate Mood
      setStatus('🧠 Calculating your mood...');
      const moodData = await getMood(faceData.face_emotion, voiceData.voice_emotion);

      setResult({
        faceEmotion: faceData.face_emotion,
        voiceEmotion: voiceData.voice_emotion,
        mood: moodData.mood
      });

      setStatus('✅ Analysis Complete!');
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
      console.error(err);
    }

    setIsDetecting(false);
  };

  // Go to Playlist
  const goToPlaylist = () => {
    if (result?.mood) {
      localStorage.setItem('detectedMood', result.mood);
      navigate('/playlist');
    }
  };

  // Back to Info
  const backToInfo = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    setShowInfo(true);
    setResult(null);
    setStatus('');
  };

  return (
    <div className="detect-page">
      <div className="container">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎭 MOOD DETECTION
        </motion.h1>
        <p className="page-subtitle">Let AI analyze your emotions and play perfect music</p>

        {/* Info Section */}
        {showInfo && (
          <motion.div 
            className="info-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>How It Works</h2>
            <p>
              Our advanced AI uses facial recognition and voice analysis to detect your emotions. 
              Simply allow camera and microphone access, click the button, and speak for 3 seconds. 
              The AI will analyze your mood and recommend the perfect playlist!
            </p>

            <div className="steps-grid">
              {[
                { num: '1', title: 'Allow Access', desc: 'Grant camera & mic permissions' },
                { num: '2', title: 'Face Detection', desc: 'AI scans your facial expressions' },
                { num: '3', title: 'Voice Analysis', desc: 'Speak for 3 seconds' },
                { num: '4', title: 'Get Playlist', desc: 'Enjoy mood-based songs!' }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  className="step-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="step-number">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.button 
              className="btn btn-primary"
              onClick={startDetection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎥 START DETECTION
            </motion.button>
          </motion.div>
        )}

        {/* Detection Section */}
        {!showInfo && (
          <motion.div 
            className="detection-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline />
              <canvas ref={canvasRef} />
            </div>

            <div className="controls">
              <motion.button 
                className="btn btn-primary"
                onClick={analyze}
                disabled={isDetecting || !modelsLoaded}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎭 CAPTURE & ANALYZE
              </motion.button>
              
              <motion.button 
                className="btn btn-secondary"
                onClick={backToInfo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← BACK
              </motion.button>
            </div>

            {status && <div className="status">{status}</div>}

            {/* Result Box */}
            {result && (
              <motion.div 
                className="result-box"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="result-item">
                  <span>😊 Face Emotion:</span>
                  <strong>{result.faceEmotion}</strong>
                </div>
                <div className="result-item">
                  <span>🎤 Voice Emotion:</span>
                  <strong>{result.voiceEmotion}</strong>
                </div>
                <div className="mood-result">
                  🎧 YOUR MOOD: <strong>{result.mood.toUpperCase()}</strong>
                </div>
                <motion.button 
                  className="btn btn-primary"
                  onClick={goToPlaylist}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎵 PLAY MY PLAYLIST
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Detect;
