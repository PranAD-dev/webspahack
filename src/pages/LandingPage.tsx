import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/features');
  };

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="holographic-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      
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

