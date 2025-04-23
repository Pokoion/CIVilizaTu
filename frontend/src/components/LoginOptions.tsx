import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import '../styles/LoginOptions.css';

const LoginOptions: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Saioa hasi da!');
      navigate('/main-menu'); // Redirect to main menu
    } catch (error: any) {
      const errorMessage = error?.message || 'Errore ezezaguna saioa hastean.';
      alert(`Errorea saioa hastean: ${errorMessage}`);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert('Google bidez saioa hasi da!');
      navigate('/main-menu');
    } catch (error: any) {
      const errorMessage = error?.message || 'Errore ezezaguna Google bidez saioa hastean.';
      alert(`Errorea Google bidez saioa hastean: ${errorMessage}`);
    }
  };

  const handleGitHubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert('GitHub bidez saioa hasi da!');
      navigate('/main-menu');
    } catch (error: any) {
      const errorMessage = error?.message || 'Errore ezezaguna GitHub bidez saioa hastean.';
      alert(`Errorea GitHub bidez saioa hastean: ${errorMessage}`);
    }
  };

  return (
    <div className="login-options-container">
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
      <p>edo</p>
      <button className="google-login" onClick={handleGoogleLogin}>
        <img src={require('../assets/others/images/google-logo.png')} alt="Google logo" />
        Google bidez saioa hasi
      </button>
      <button className="github-login" onClick={handleGitHubLogin}>
        <img src={require('../assets/others/images/github-logo.png')} alt="GitHub logo" />
        GitHub bidez saioa hasi
      </button>
      <p className="not-registered">
        Ez zaude erregistratuta? <a href="/register">Erregistratu</a>
      </p>
    </div>
  );
};

export default LoginOptions;
