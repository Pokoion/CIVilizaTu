import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MainMenu from './components/MainMenu';
import GameSetup from './components/GameSetup';
import GameIntro from './components/GameIntro';
import ProtectedRoute from './components/ProtectedRoute';
import Map from './components/game/Map';
import './styles/index.css';

const Home: React.FC = () => (
  <div className="hero">
    <div className="overlay">
      <header>
        <h1>CIVilizaTu</h1>
        <p>Ongi etorri zure zibilizazioa sortzeko abenturara!</p>
      </header>
      <main>
        <button onClick={() => window.location.href = '/login'}>Saioa Hasi</button>
      </main>
    </div>
    <footer>
      <p>&copy; 2023 CIVilizaTu. Eskubide guztiak erreserbatuta.</p>
    </footer>
  </div>
);

const App: React.FC = () => {
  console.log('App renderizado correctamente');
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main-menu" element={<ProtectedRoute><MainMenu /></ProtectedRoute> } />
        <Route path="/game-setup" element={<ProtectedRoute><GameSetup /></ProtectedRoute>} />
        <Route path="/game-intro" element={<ProtectedRoute><GameIntro /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Map /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
