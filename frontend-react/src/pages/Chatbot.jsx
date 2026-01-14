import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { chatWithAI } from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
  const [currentMode, setCurrentMode] = useState('normal');
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 Hello! I\'m your AI assistant. Select a mode above and start chatting!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const modes = [
    { id: 'normal', icon: '🧠', name: 'Ask Anything', header: '🧠 ASK ANYTHING MODE' },
    { id: 'roast', icon: '🎭', name: 'Mood Roast Mode', header: '🎭 MOOD ROAST MODE' },
    { id: 'bollywood', icon: '🎬', name: 'Bollywood Dialogues', header: '🎬 BOLLYWOOD DIALOGUE GENERATOR' },
    { id: 'advice', icon: '💬', name: 'Life Advice', header: '💬 LIFE ADVICE MODE' }
  ];

  const currentModeData = modes.find(m => m.id === currentMode);

  const changeMode = (modeId) => {
    setCurrentMode(modeId);
    const modeData = modes.find(m => m.id === modeId);
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `Mode changed to: ${modeData.header}`
    }]);
  };

  const sendMessage = async () => {
    const message = inputText.trim();
    if (!message) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: message }]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await chatWithAI(message, currentMode);
      
      setIsTyping(false);
      
      // Format response
      let formattedResponse = data.response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      setMessages(prev => [...prev, {
        type: 'bot',
        text: formattedResponse
      }]);

    } catch (error) {
      console.error('Chat Error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '⚠️ Error connecting to AI. Please ensure backend is running.'
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-page">
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🤖 AI CHATBOT</h1>
          <p>Chat with AI in different modes - Ask anything!</p>
        </motion.div>

        {/* Mode Selector */}
        <div className="mode-selector">
          {modes.map((mode, index) => (
            <motion.button
              key={mode.id}
              className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
              onClick={() => changeMode(mode.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-name">{mode.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Chat Container */}
        <motion.div 
          className="chat-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Chat Header */}
          <div className="chat-header">
            {currentModeData.header}
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`message ${msg.type}`}
                initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <motion.button
              className="send-btn"
              onClick={sendMessage}
              disabled={!inputText.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SEND
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;
