import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getSongs, BACKEND_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AllSongs.css';

const AllSongs = () => {
  const audioRef = useRef(null);
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const moodEmojis = {
    high: '🎉',
    low: '💙',
    neutral: '😌',
    mixed: '🎵'
  };

  useEffect(() => {
    loadAllSongs();
  }, []);

  const loadAllSongs = async () => {
    try {
      const data = await getSongs('mixed');
      
      if (data.songs.length === 0) {
        setError('No songs found. Please add songs to backend/songs/mixed folder.');
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSongEnd = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      playSong(songs[nextIndex], nextIndex);
    } else {
      playSong(songs[0], 0);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="allsongs-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="allsongs-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🎵 ALL SONGS</h1>
          <p>Browse and play all available songs - all moods mixed together!</p>
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
              <p>Category: {currentSong.mood.toUpperCase()}</p>
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
              <div className="song-mood">Category: {song.mood.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllSongs;
