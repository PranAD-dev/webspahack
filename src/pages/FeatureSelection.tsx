import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import './FeatureSelection.css';

export function FeatureSelection() {
  const navigate = useNavigate();

  const handleJournal = () => {
    navigate('/journal');
  };

  const handleMoodWrap = () => {
    navigate('/mood-wrap');
  };

  const handleEmotionBubble = () => {
    navigate('/emotion-bubble');
  };

  return (
    <div className="feature-selection-page">
      <BackButton onClick={() => navigate('/')} />
      <div className="feature-background">
        <div className="holographic-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      
      <div className="feature-content">
        <h2 className="feature-title">Choose Your Journey</h2>
        <p className="feature-subtitle">Select a feature to begin</p>
        
        <div className="feature-buttons">
          <button className="feature-button journal-button" onClick={handleJournal}>
            <div className="button-icon">📔</div>
            <span className="button-label">Journal</span>
            <span className="button-glow"></span>
          </button>
          
          <button className="feature-button mood-wrap-button" onClick={handleMoodWrap}>
            <div className="button-icon">🔮</div>
            <span className="button-label">Soul Summary</span>
            <span className="button-glow"></span>
          </button>
          
          <button className="feature-button emotion-bubble-button" onClick={handleEmotionBubble}>
            <div className="button-icon">💭</div>
            <span className="button-label">Emotion Sphere</span>
            <span className="button-glow"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

