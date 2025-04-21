import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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

const Login: React.FC = () => (
  <div className="hero">
    <div className="overlay">
      <header>
        <h1>CIVilizaTu</h1>
        <p>Saioa hasteko metodo bat aukeratu:</p>
      </header>
      <main>
        <button onClick={() => alert('Google login')}>Google bidez saioa hasi</button>
        <button onClick={() => alert('Email login')}>Email bidez saioa hasi</button>
      </main>
    </div>
    <footer>
      <p>&copy; 2025 CIVilizaTu. Eskubide guztiak erreserbatuta.</p>
    </footer>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
