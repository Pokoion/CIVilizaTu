import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameIntro.css';

const GameIntro: React.FC = () => {
  const navigate = useNavigate();

  const handleVideoEnd = () => {
    navigate('/game'); // Navigate to the main game screen after the video
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/game'); // Skip the video when Esc is pressed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]); // Only include `navigate` in the dependency array

  return (
    <div className="game-intro-container">
      <video
        src={require('../assets/others/videos/game-intro.mp4')}
        autoPlay
        onEnded={handleVideoEnd}
        controls={false}
        className="intro-video"
      />
    </div>
  );
};

export default GameIntro;
