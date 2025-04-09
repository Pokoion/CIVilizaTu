import React from 'react';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="CIVilizaTu Logo" className="logo" />
        <span className="brand-name">CIVilizaTu</span>
      </div>
      <ul className="navbar-links">
        <li className="navbar-item active">
          <span>Asistente</span>
        </li>
        <li className="navbar-item">
          <span>Juego</span>
        </li>
        <li className="navbar-item">
          <span>Manual</span>
        </li>
        <li className="navbar-item">
          <span>Acerca de</span>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
