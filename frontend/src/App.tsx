import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginOptions from './components/Login';
import Register from './components/Register';
import MainMenu from './components/MainMenu';
import GameSetup from './components/GameSetup';
import GameIntro from './components/GameIntro';
import './styles/App.css'; // Actualizar la referencia a App.css

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
        <Route path="/login" element={<LoginOptions />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/game-setup" element={<GameSetup />} />
        <Route path="/game-intro" element={<GameIntro />} />
      </Routes>
    </Router>
  );
};

export default App;
