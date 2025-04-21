import React from 'react';
import './LoginOptions.css';

const LoginOptions: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleEmailLogin = () => {
    window.location.href = '/api/auth/email';
  };

  return (
    <div className="login-options-container">
      <h2>Saioa Hasi</h2>
      <p>Aukeratu zure saioa hasteko metodoa:</p>
      <button className="google-login" onClick={handleGoogleLogin}>
        Google bidez saioa hasi
      </button>
      <button className="email-login" onClick={handleEmailLogin}>
        Email bidez saioa hasi
      </button>
    </div>
  );
};

export default LoginOptions;
