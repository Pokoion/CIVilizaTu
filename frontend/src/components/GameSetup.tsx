import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameSetup.css';

const GameSetup: React.FC = () => {
  const [difficulty, setDifficulty] = useState('');
  const [civilization, setCivilization] = useState('');
  const navigate = useNavigate();

  const handleStartGame = () => {
    if (!difficulty || !civilization) {
      alert('Mesedez, aukeratu zailtasuna eta zibilizazioa.');
      return;
    }
    navigate('/game-intro'); // Navigate to the game intro video
  };

  return (
    <div className="game-setup-container">
      <h1>Partida Konfigurazioa</h1>
      <div className="setup-section">
        <h2>Zailtasuna Aukeratu</h2>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">Aukeratu...</option>
          <option value="easy">Erraza</option>
          <option value="medium">Ertaina</option>
          <option value="hard">Zaila</option>
        </select>
      </div>
      <div className="setup-section">
        <h2>Zibilizazioa Aukeratu</h2>
        <select value={civilization} onChange={(e) => setCivilization(e.target.value)}>
          <option value="">Aukeratu...</option>
          <option value="rome">Erroma</option>
          <option value="greece">Grezia</option>
          <option value="egypt">Egipto</option>
        </select>
      </div>
      <button onClick={handleStartGame}>Partida Hasi</button>
    </div>
  );
};

export default GameSetup;
