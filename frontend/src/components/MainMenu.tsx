import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainMenu.css';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/game-setup');
  };

  const handleLoadGame = () => {
    alert('Partida kargatzen.');
  };

  const handleExit = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div className="main-menu-container">
      <h1>Menu Nagusia</h1>
      <button onClick={handleNewGame}>Partida Berria</button>
      <button onClick={handleLoadGame}>Partida Kargatu</button>
      <button onClick={handleExit}>Irten</button>
    </div>
  );
};

export default MainMenu;
