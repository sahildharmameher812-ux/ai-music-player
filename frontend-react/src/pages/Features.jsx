import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Features.css';

const Features = () => {
  const [memeData, setMemeData] = useState(null);
  const [gameData, setGameData] = useState({ score: 0, timer: 30, started: false, targetMood: '' });
  const [personalityData, setPersonalityData] = useState(null);

  const moodEmojis = {
    happy: ['😊', '😄', '🥳', '😁'],
    sad: ['😢', '😭', '🥺', '😔'],
    neutral: ['😐', '😶', '🙂', '😌']
  };

  // Meme Generator
  const generateMeme = () => {
    const mood = localStorage.getItem('detectedMood') || 'neutral';
    
    const memes = {
      high: [
        { emoji: '🎉', text: 'When AI detects you\'re HAPPY:\n"Finally, some good vibes!"' },
        { emoji: '😄', text: 'Your mood is so HIGH,\neven sad songs sound happy!' },
        { emoji: '🎊', text: 'POV: AI detected your\nparty mode activated! 🕺' }
      ],
      low: [
        { emoji: '💙', text: 'When you\'re SAD but AI still\nplays the perfect songs 🎵' },
        { emoji: '😢', text: 'Mood: LOW\nMusic: ON\nFeels: REAL' },
        { emoji: '🌧️', text: 'AI: "I see you\'re sad"\nYou: "Play rain sounds"' }
      ],
      neutral: [
        { emoji: '😌', text: 'Perfectly balanced,\nas all moods should be ⚖️' },
        { emoji: '🧘', text: 'NEUTRAL mood =\nPeace mode activated ✨' },
        { emoji: '☯️', text: 'Not happy, not sad,\njust vibing 🎵' }
      ]
    };
    
    const moodMemes = memes[mood] || memes.neutral;
    const meme = moodMemes[Math.floor(Math.random() * moodMemes.length)];
    setMemeData(meme);
  };

  const shareMeme = (type) => {
    if (type === 'text' && memeData) {
      navigator.clipboard.writeText(memeData.text).then(() => {
        alert('💬 Meme text copied to clipboard!');
      });
    } else {
      alert('📸 Meme image copied! (In real app, this would generate a shareable image)');
    }
  };

  // Mood Game
  const startGame = () => {
    const moods = ['happy', 'sad', 'neutral'];
    const targetMood = moods[Math.floor(Math.random() * moods.length)];
    
    setGameData({ score: 0, timer: 30, started: true, targetMood });
    
    const interval = setInterval(() => {
      setGameData(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          alert(`🎮 Game Over!\n\nYour Score: ${prev.score}\n\n${prev.score >= 100 ? 'Amazing! 🏆' : prev.score >= 50 ? 'Good job! 👍' : 'Keep trying! 💪'}`);
          return { ...prev, started: false, timer: 0 };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
  };

  const checkEmoji = (emoji) => {
    if (!gameData.started) return;
    
    const targetEmojis = moodEmojis[gameData.targetMood];
    if (targetEmojis.includes(emoji)) {
      setGameData(prev => ({ ...prev, score: prev.score + 10 }));
    }
  };

  // Personality Test
  const showPersonality = () => {
    const personalities = [
      {
        icon: '🌙',
        title: 'Night Thinker',
        desc: 'You\'re a deep, introspective soul who finds clarity in quiet moments. Music is your therapy, and emotions are your language.'
      },
      {
        icon: '☀️',
        title: 'Day Dreamer',
        desc: 'You\'re full of energy and optimism! You see music as celebration and life as an adventure waiting to unfold.'
      },
      {
        icon: '🎭',
        title: 'Emotional Artist',
        desc: 'You feel everything deeply and express through creativity. Your moods shape your world, and that\'s your superpower!'
      },
      {
        icon: '🧘',
        title: 'Zen Master',
        desc: 'Balanced and grounded, you use music to maintain harmony. You\'re the calm in everyone\'s storm.'
      },
      {
        icon: '🔥',
        title: 'Mood Chameleon',
        desc: 'You adapt and flow with every emotion! Your versatility is your strength, and music amplifies your journey.'
      }
    ];
    
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    setPersonalityData(personality);
  };

  const sharePersonality = () => {
    if (personalityData) {
      const text = `I'm a "${personalityData.title}" according to AI Music Player! 🎵`;
      navigator.clipboard.writeText(text).then(() => {
        alert('📤 Personality result copied to clipboard!');
      });
    }
  };

  return (
    <div className="features-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🎮 FUN FEATURES</h1>
          <p>Memes, Games, Personality Tests & More!</p>
        </motion.div>

        <div className="features-grid">
          
          {/* Meme Generator */}
          <motion.div 
            className="feature-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="feature-header">
              <div className="feature-icon">📸</div>
              <h2>Mood Meme Generator</h2>
            </div>
            <p className="feature-desc">
              Generate funny memes based on your detected mood! Share them with friends and spread the vibes.
            </p>
            <motion.button 
              className="btn btn-primary"
              onClick={generateMeme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              GENERATE MEME
            </motion.button>
            
            {memeData && (
              <motion.div 
                className="meme-result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="meme-image">{memeData.emoji}</div>
                <div className="meme-text">{memeData.text}</div>
                <div className="share-btns">
                  <button className="share-btn" onClick={() => shareMeme('image')}>📸 SHARE IMAGE</button>
                  <button className="share-btn" onClick={() => shareMeme('text')}>💬 SHARE TEXT</button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Mood Game */}
          <motion.div 
            className="feature-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-header">
              <div className="feature-icon">🎯</div>
              <h2>Mood Match Game</h2>
            </div>
            <p className="feature-desc">
              30-second emoji matching game! Click on emojis that match the target mood. How many can you get?
            </p>
            <motion.button 
              className="btn btn-primary"
              onClick={startGame}
              disabled={gameData.started}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              START GAME
            </motion.button>
            
            {gameData.started && (
              <div className="game-area">
                <div className="game-score">Score: {gameData.score}</div>
                <div className="game-timer">Time: {gameData.timer}s</div>
                <div className="target-mood">
                  Target: {moodEmojis[gameData.targetMood][0]}
                </div>
                <div className="emoji-grid">
                  {[...moodEmojis.happy, ...moodEmojis.sad, ...moodEmojis.neutral]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 8)
                    .map((emoji, i) => (
                      <motion.button
                        key={i}
                        className="emoji-btn"
                        onClick={() => checkEmoji(emoji)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Personality Test */}
          <motion.div 
            className="feature-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="feature-header">
              <div className="feature-icon">🧬</div>
              <h2>Personality Result</h2>
            </div>
            <p className="feature-desc">
              Discover your music personality based on your mood history and listening patterns!
            </p>
            <motion.button 
              className="btn btn-primary"
              onClick={showPersonality}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SHOW MY PERSONALITY
            </motion.button>
            
            {personalityData && (
              <motion.div 
                className="personality-result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="personality-icon">{personalityData.icon}</div>
                <div className="personality-title">{personalityData.title}</div>
                <div className="personality-desc">{personalityData.desc}</div>
                <button className="share-btn" onClick={sharePersonality}>📤 SHARE RESULT</button>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Features;
