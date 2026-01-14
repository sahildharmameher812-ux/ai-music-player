import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  return (
    <motion.header 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <NavLink to="/" className="logo">
          🎵 AI MUSIC PLAYER
        </NavLink>
        
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            HOME
          </NavLink>
          <NavLink to="/detect" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            DETECT
          </NavLink>
          <NavLink to="/allsongs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            ALL SONGS
          </NavLink>
          <NavLink to="/chatbot" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            AI CHAT
          </NavLink>
          <NavLink to="/features" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            FEATURES
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            HISTORY
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            ABOUT
          </NavLink>
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;
