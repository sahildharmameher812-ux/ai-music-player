import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMoodHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ high: 0, low: 0, neutral: 0 });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getMoodHistory();
      
      if (data.history.length === 0) {
        setError('No mood history yet. Detect your mood first!');
        setLoading(false);
        return;
      }

      setHistory(data.history);
      calculateStats(data.history);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load history. Check backend connection.');
      setLoading(false);
    }
  };

  const calculateStats = (historyData) => {
    const counts = { high: 0, low: 0, neutral: 0 };
    historyData.forEach(entry => {
      if (counts[entry.mood] !== undefined) {
        counts[entry.mood]++;
      }
    });
    setStats(counts);
  };

  const moodEmojis = {
    high: '🎉',
    low: '💙',
    neutral: '😌'
  };

  const moodColors = {
    high: '#10b981',
    low: '#3b82f6',
    neutral: '#8b5cf6'
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="history-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const total = stats.high + stats.low + stats.neutral;
  const highPercent = total > 0 ? ((stats.high / total) * 100).toFixed(1) : 0;
  const lowPercent = total > 0 ? ((stats.low / total) * 100).toFixed(1) : 0;
  const neutralPercent = total > 0 ? ((stats.neutral / total) * 100).toFixed(1) : 0;

  return (
    <div className="history-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>📊 MOOD HISTORY</h1>
          <p>Track your emotional journey over time</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card high"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">🎉</div>
            <div className="stat-label">HIGH MOOD</div>
            <div className="stat-count">{stats.high}</div>
            <div className="stat-percent">{highPercent}%</div>
          </motion.div>

          <motion.div 
            className="stat-card low"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">💙</div>
            <div className="stat-label">LOW MOOD</div>
            <div className="stat-count">{stats.low}</div>
            <div className="stat-percent">{lowPercent}%</div>
          </motion.div>

          <motion.div 
            className="stat-card neutral"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">😌</div>
            <div className="stat-label">NEUTRAL MOOD</div>
            <div className="stat-count">{stats.neutral}</div>
            <div className="stat-percent">{neutralPercent}%</div>
          </motion.div>
        </div>

        {/* Visual Bar Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>📈 Mood Distribution</h2>
          <div className="bar-chart">
            <div className="bar-wrapper">
              <div className="bar high" style={{ width: `${highPercent}%` }}>
                <span>{highPercent}%</span>
              </div>
              <div className="bar-label">HIGH</div>
            </div>
            <div className="bar-wrapper">
              <div className="bar low" style={{ width: `${lowPercent}%` }}>
                <span>{lowPercent}%</span>
              </div>
              <div className="bar-label">LOW</div>
            </div>
            <div className="bar-wrapper">
              <div className="bar neutral" style={{ width: `${neutralPercent}%` }}>
                <span>{neutralPercent}%</span>
              </div>
              <div className="bar-label">NEUTRAL</div>
            </div>
          </div>
        </motion.div>

        {/* History Timeline */}
        <motion.div 
          className="timeline-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2>🕒 Recent Activity</h2>
          <div className="timeline">
            {history.slice().reverse().map((entry, index) => (
              <motion.div
                key={index}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.05) }}
              >
                <div className="timeline-icon" style={{ background: moodColors[entry.mood] }}>
                  {moodEmojis[entry.mood]}
                </div>
                <div className="timeline-content">
                  <div className="timeline-mood">
                    MOOD: <strong>{entry.mood.toUpperCase()}</strong>
                  </div>
                  <div className="timeline-emotions">
                    <span>😊 Face: {entry.face_emotion}</span>
                    <span>🎤 Voice: {entry.voice_emotion}</span>
                  </div>
                  <div className="timeline-time">{entry.timestamp}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
