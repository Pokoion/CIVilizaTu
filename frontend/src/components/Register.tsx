import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService'; // Importamos el servicio
import '../styles/LoginOptions.css'; // Reutilizamos los estilos de LoginOptions

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const result = await registerUser(email, password);
      if (result.success) {
        navigate('/login', { state: { successMessage: result.message } });
      } else {
        setErrorMessage(result.message); // Mostrar mensaje de error
      }
    } catch (error: any) {
      setErrorMessage('Errore ezezaguna gertatu da.');
    }
  };

  return (
    <div className="login-options-container">
      <h2>Erregistratu</h2>
      <form className="login-form" onSubmit={handleRegister}>
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
        <input
          type="password"
          placeholder="Pasahitza Berretsi"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Erregistratu</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <p className="not-registered">
        Jadanik kontua baduzu? <a href="/login">Saioa hasi</a>
      </p>
    </div>
  );
};

export default Register;
