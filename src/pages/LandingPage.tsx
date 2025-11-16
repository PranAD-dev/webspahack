import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/features');
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="soulspace-title">
          <span className="title-gradient">SoulSpace</span>
        </h1>
        <p className="landing-subtitle">Your thoughts deserve space</p>
        <button className="start-button" onClick={handleStart}>
          <span className="button-text">Start</span>
          <span className="button-glow"></span>
        </button>
      </div>
    </div>
  );
}

