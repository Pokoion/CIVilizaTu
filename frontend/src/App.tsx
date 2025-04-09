import React from 'react';
import Navbar from './components/Navbar';
import LLMQuery from './components/LLMQuery';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <LLMQuery />
      </main>
      <footer>
        <p>Proyecto CIVilizaTu - Juego de estrategia inspirado en Civilization © 2025</p>
      </footer>
    </div>
  );
}

export default App;
