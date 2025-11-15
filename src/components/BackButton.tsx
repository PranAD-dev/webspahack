import { useNavigate } from 'react-router-dom';
import './BackButton.css';

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button className="back-button" onClick={handleBack}>
      <span className="back-icon">←</span>
      <span className="back-text">Back</span>
    </button>
  );
}

