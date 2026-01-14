import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '😊', title: 'Face Detection', desc: 'Advanced AI analyzes your facial expressions' },
    { icon: '🎤', title: 'Voice Analysis', desc: 'Voice emotion recognition from speech patterns' },
    { icon: '🎧', title: 'Mood-Based Music', desc: 'Personalized playlists for HIGH, LOW, NEUTRAL moods' },
    { icon: '🤖', title: 'AI Chatbot', desc: 'Chat with AI in multiple modes' },
    { icon: '🎮', title: 'Fun Features', desc: 'Meme generator, personality test, mood games' },
    { icon: '📊', title: 'Mood History', desc: 'Track your emotional journey with analytics' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section - Split Layout */}
      <section className="hero">
        <div className="hero-container">
          
          {/* Left Side - Content */}
          <motion.div 
            className="hero-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="hero-icon-small"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎧
            </motion.div>

            <h1 className="hero-title">AI MUSIC PLAYER</h1>
            <p className="hero-tagline">Your Emotions. Your Music. Powered by AI.</p>
            <p className="hero-description">
              Experience the future of personalized music. Our AI analyzes your facial expressions 
              and voice to detect your mood, then plays the perfect songs to match your emotions.
            </p>

            <div className="cta-buttons">
              <motion.button 
                className="btn btn-primary"
                onClick={() => navigate('/detect')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎭 DETECT MY MOOD
              </motion.button>
              
              <motion.button 
                className="btn btn-secondary"
                onClick={() => navigate('/allsongs')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎵 BROWSE SONGS
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side - 3D Animations */}
          <motion.div 
            className="hero-right"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Headphone */}
            <motion.div 
              className="big-headphone"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              🎧
            </motion.div>

            {/* Floating Music Notes */}
            <motion.div 
              className="float-note note-1"
              animate={{ 
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 360]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              🎵
            </motion.div>

            <motion.div 
              className="float-note note-2"
              animate={{ 
                y: [0, 25, 0],
                x: [0, -20, 0],
                rotate: [0, -360]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              🎶
            </motion.div>

            <motion.div 
              className="float-note note-3"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 7, repeat: Infinity }}
            >
              🎼
            </motion.div>

            {/* Glowing Circle */}
            <motion.div 
              className="glow-circle"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ✨ KEY FEATURES
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
