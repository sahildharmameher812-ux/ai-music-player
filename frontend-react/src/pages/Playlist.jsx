import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSongs, BACKEND_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Playlist.css';

const Playlist = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mood, setMood] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const moodEmojis = {
    high: '🎉',
    low: '💙',
    neutral: '😌'
  };

  useEffect(() => {
    const detectedMood = localStorage.getItem('detectedMood');
    
    if (!detectedMood) {
      setError('No mood detected! Please detect your mood first.');
      setLoading(false);
      return;
    }

    setMood(detectedMood);
    loadSongs(detectedMood);
  }, []);

  const loadSongs = async (moodType) => {
    try {
      const data = await getSongs(moodType);
      
      if (data.songs.length === 0) {
        setError('No songs found for this mood.');
        setLoading(false);
        return;
      }

      setSongs(data.songs);
      setLoading(false);
      
      // Auto-play first song
      if (data.songs[0]) {
        playSong(data.songs[0], 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load songs. Check backend connection.');
      setLoading(false);
    }
  };

  const playSong = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);

    if (audioRef.current) {
      audioRef.current.src = `${BACKEND_URL}${song.path}`;
      audioRef.current.load();
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSongEnd = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      playSong(songs[nextIndex], nextIndex);
    } else {
      playSong(songs[0], 0); // Loop back
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="playlist-page">
        <div className="container">
          <div className="error-message">
            {error}
            <br />
            <motion.button 
              className="btn btn-primary"
              onClick={() => navigate('/detect')}
              whileHover={{ scale: 1.05 }}
              style={{ marginTop: '20px' }}
            >
              🎭 Detect Mood
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-page">
      <div className="container">
        <motion.button 
          className="back-btn"
          onClick={() => navigate('/detect')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← BACK TO DETECTION
        </motion.button>

        <motion.div 
          className="playlist-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🎧 YOUR PERSONALIZED PLAYLIST</h1>
          <div className="mood-badge">
            MOOD: <span>{mood.toUpperCase()}</span>
          </div>
        </motion.div>

        {/* Now Playing */}
        {currentSong && (
          <motion.div 
            className="now-playing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="np-icon">{moodEmojis[currentSong.mood] || '🎵'}</div>
            <div className="np-info">
              <h2>{currentSong.name}</h2>
              <p>Mood: {currentSong.mood.toUpperCase()}</p>
              <audio 
                ref={audioRef}
                controls
                onEnded={handleSongEnd}
              />
            </div>
          </motion.div>
        )}

        {/* Songs Grid */}
        <div className="songs-grid">
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              className={`song-card ${currentSong?.id === song.id ? 'playing' : ''}`}
              onClick={() => playSong(song, index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10 }}
            >
              <div className="song-icon">{moodEmojis[song.mood] || '🎵'}</div>
              <div className="song-title">{song.name}</div>
              <div className="song-mood">Mood: {song.mood.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlist;
