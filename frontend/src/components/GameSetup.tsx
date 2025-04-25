import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameSetup.css';
import { fetchCivilizations } from '../services/api'; // Importar la función de la API

const GameSetup: React.FC = () => {
  const [difficulty, setDifficulty] = useState('');
  const [civilization, setCivilization] = useState('');
  const [civilizations, setCivilizations] = useState<{ name: string; attack: number; defense: number }[]>([]); // Estado para las civilizaciones con atributos
  const navigate = useNavigate();

  useEffect(() => {
    // Llamar a la API para obtener las civilizaciones
    const loadCivilizations = async () => {
      try {
        const data = await fetchCivilizations();
        setCivilizations(data);
      } catch (error) {
        console.error('Error fetching civilizations:', error);
      }
    };

    loadCivilizations();
  }, []);

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
        <div className="difficulty-buttons">
          <button
            className={difficulty === 'easy' ? 'selected' : ''}
            onClick={() => setDifficulty('easy')}
          >
            Erraza
          </button>
          <button
            className={difficulty === 'medium' ? 'selected' : ''}
            onClick={() => setDifficulty('medium')}
          >
            Ertaina
          </button>
          <button
            className={difficulty === 'hard' ? 'selected' : ''}
            onClick={() => setDifficulty('hard')}
          >
            Zaila
          </button>
        </div>
      </div>
      <div className="setup-section">
        <h2>Zibilizazioa Aukeratu</h2>
        <div className="civilization-buttons">
          {civilizations.map((civ) => (
            <button
              key={civ.name}
              className={civilization === civ.name ? 'selected' : ''}
              onClick={() => setCivilization(civ.name)}
            >
              <img
                src={require(`../assets/others/images/${civ.name}.png`)}
                alt={civ.name}
              />
              <div>
                <strong>{civ.name.charAt(0).toUpperCase() + civ.name.slice(1)}</strong>
                <p>Attack: {civ.attack}</p>
                <p>Defense: {civ.defense}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleStartGame}>Partida Hasi</button>
    </div>
  );
};

export default GameSetup;