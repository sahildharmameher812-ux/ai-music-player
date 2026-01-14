import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Playlist from './pages/Playlist';
import AllSongs from './pages/AllSongs';
import Chatbot from './pages/Chatbot';
import Features from './pages/Features';
import History from './pages/History';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/playlist" element={<Playlist />} />
            <Route path="/allsongs" element={<AllSongs />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/features" element={<Features />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
