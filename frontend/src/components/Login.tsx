import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../services/authService';
import '../styles/LoginOptions.css';

const LoginOptions: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.successMessage || '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        navigate('/main-menu'); // Redirige al menú principal
      } else {
        setErrorMessage(result.message); // Mostrar mensaje de error
      }
    } catch (error: any) {
      setErrorMessage('Errore ezezaguna gertatu da.');
    }
  };

  return (
    <div className="login-options-container">
      {successMessage && <p className="success-message">{successMessage}</p>}
      <h2>Saioa Hasi</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Pasahitza"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Saioa Hasi</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <p className="not-registered">
        Ez zaude erregistratuta? <a href="/register">Erregistratu</a>
      </p>
    </div>
  );
};

export default LoginOptions;