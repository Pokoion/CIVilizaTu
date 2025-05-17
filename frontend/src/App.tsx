import React from 'react';
import { Navigate, useLocation, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MainMenu from './components/MainMenu';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import GameUI from './components/game/GameUI';
import { GameProvider } from './context/GameContext';
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
      <p>&copy; 2025 CIVilizaTu. Eskubide guztiak erreserbatuta.</p>
    </footer>
  </div>
);

const GameRouteWrapper: React.FC = () => {
  const location = useLocation();
  // Solo deja pasar si hay partida en el state (viene de MainMenu)
  const partida = location.state?.partida || null;
  if (!partida) {
    // Si no hay partida, redirige al menú principal
    return <Navigate to="/main-menu" replace />;
  }

  return (
    <GameProvider initialGameState={partida}>
      <GameUI />
    </GameProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/main-menu" element={<ProtectedRoute><MainMenu /></ProtectedRoute>} />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GameRouteWrapper />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
