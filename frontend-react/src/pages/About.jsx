import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  const techStack = [
    { icon: '🐍', name: 'FastAPI', desc: 'Modern Python web framework for backend APIs' },
    { icon: '🧠', name: 'Face Detection Model', desc: 'dima806/facial_emotions_image_detection' },
    { icon: '🎤', name: 'Voice Emotion Model', desc: 'wav2vec2-lg-xlsr-en-speech-emotion-recognition' },
    { icon: '🤖', name: 'Transformers', desc: 'Hugging Face library for AI models' },
    { icon: '📦', name: 'PyTorch', desc: 'Deep learning framework' },
    { icon: '🌐', name: 'React', desc: 'Modern UI library with hooks' },
    { icon: '📹', name: 'Face-API.js', desc: 'Real-time face detection in browser' },
    { icon: '🎵', name: 'Local Music Engine', desc: 'File-based music storage & streaming' }
  ];

  const futureScope = [
    '🎨 Advanced Emotion Recognition: Support for complex emotions (anxious, excited, nostalgic)',
    '🔊 Multi-language Support: Voice analysis for multiple languages and accents',
    '📱 Mobile Application: Native iOS and Android apps with offline support',
    '🤝 Social Features: Share playlists and mood insights with friends',
    '📊 ML Model Improvements: Fine-tune models with user feedback for better accuracy',
    '🎯 Personalized Recommendations: Learn user preferences over time',
    '🌐 Cloud Sync: Optional cloud backup for mood history and preferences',
    '🎮 Gamification: Achievements, streaks, and challenges based on mood patterns',
    '🧘 Wellness Integration: Meditation guides, breathing exercises based on detected stress',
    '🎼 Spotify Integration (Optional): Hybrid mode for Premium users'
  ];

  return (
    <div className="about-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>📖 ABOUT PROJECT</h1>
          <p>AI-Powered Emotion-Based Music Player</p>
        </motion.div>

        {/* Project Idea */}
        <motion.section 
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2>💡 PROJECT IDEA</h2>
          <p>
            <strong>AI Music Player</strong> is an innovative emotion-detection system that combines facial recognition 
            and voice analysis to understand your mood and play the perfect music to match your emotions.
          </p>
          <p>
            Unlike traditional music players that require manual selection, our AI automatically detects whether 
            you're feeling <strong>HIGH</strong> (happy/energetic), <strong>LOW</strong> (sad/melancholic), or 
            <strong>NEUTRAL</strong> (calm/balanced) and curates a personalized playlist accordingly.
          </p>
          <p>
            <strong>Key Innovation:</strong> Real-time emotion detection + Local music library = No dependency on 
            external APIs, complete privacy, and guaranteed playback!
          </p>
        </motion.section>

        {/* Tech Stack */}
        <motion.section 
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>🛠️ TECH STACK</h2>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                className="tech-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.05) }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="tech-icon">{tech.icon}</div>
                <div className="tech-name">{tech.name}</div>
                <div className="tech-desc">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Architecture */}
        <motion.section 
          className="section architecture-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>🏗️ SYSTEM ARCHITECTURE</h2>
          <div className="architecture">
            <h3>Data Flow Diagram</h3>
            
            <div className="flow-diagram">
              <div className="flow-box">📹 Camera Input</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box">😊 Face Detection</div>
            </div>
            
            <div className="flow-plus">+</div>
            
            <div className="flow-diagram">
              <div className="flow-box">🎤 Microphone Input</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box">🗣️ Voice Analysis</div>
            </div>
            
            <div className="flow-arrow-down">↓</div>
            
            <div className="flow-diagram">
              <div className="flow-box">🧠 AI Mood Calculation</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box">🎧 Music Recommendation</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box">▶️ Playback</div>
            </div>
          </div>

          <p className="architecture-desc">
            <strong>Backend:</strong> FastAPI server processes facial images and voice data through deep learning models, 
            calculates mood, and serves appropriate songs from local storage.
          </p>
          <p className="architecture-desc">
            <strong>Frontend:</strong> Real-time face detection using Face-API.js, audio recording via Web Audio API, 
            and seamless music playback with HTML5 Audio.
          </p>
        </motion.section>

        {/* Why No Spotify */}
        <motion.section 
          className="section why-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>❓ WHY SPOTIFY NOT USED</h2>
          <div className="why-box">
            <h3>🚫 Challenges with Spotify API:</h3>
            <ul>
              <li><strong>Limited Preview Access:</strong> Only 30-second previews available, not full songs</li>
              <li><strong>Preview Availability:</strong> Many songs don't have previews</li>
              <li><strong>API Rate Limits:</strong> Free tier has strict request limitations</li>
              <li><strong>Authentication Complexity:</strong> OAuth flow requires user login</li>
              <li><strong>Development Mode Restrictions:</strong> Limited to 25 users</li>
              <li><strong>Premium Requirement:</strong> Full playback requires Spotify Premium</li>
            </ul>
          </div>
          <p className="solution">
            <strong>Our Solution:</strong> Local music storage with copyright-free songs ensures 100% playback reliability, 
            no API dependencies, complete privacy, and consistent user experience!
          </p>
        </motion.section>

        {/* Future Scope */}
        <motion.section 
          className="section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2>🚀 FUTURE SCOPE</h2>
          <p className="future-intro">Planned enhancements and features for future versions:</p>
          <ul className="future-list">
            {futureScope.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + (index * 0.05) }}
                whileHover={{ x: 5 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Credits */}
        <motion.section 
          className="section credits-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2>👥 PROJECT INFO</h2>
          <div className="credits-content">
            <p><strong>Developed By:</strong> AI Music Player Team</p>
            <p><strong>Category:</strong> AI/ML + Web Development</p>
            <p><strong>Purpose:</strong> Academic Project / Portfolio Showcase</p>
            <p><strong>License:</strong> Open Source (Educational Use)</p>
          </div>
          <p className="thank-you">💚 Thank you for exploring AI Music Player! 💚</p>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
