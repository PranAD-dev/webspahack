import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface LookingAheadSlideProps {
  stats: MoodWrapStats;
  nextMonth: string;
}

export function LookingAheadSlide({ stats, nextMonth }: LookingAheadSlideProps) {
  const consistencyGrade = stats.consistencyScore?.grade || 'N/A';
  const consistencyPercentage = stats.consistencyScore?.percentage || 0;

  return (
    <div className="slide-base looking-ahead-slide">
      <div className="slide-content">
        <div className="unlock-icon">🔓</div>
        <h2 className="slide-subtitle">Your {nextMonth} Intention</h2>
        <p className="goal-suggestion">{stats.goal}</p>
        {stats.consistencyScore && (
          <div className="consistency-badge" style={{ marginTop: '20px' }}>
            <p className="slide-description">
              Self-care grade: <strong>{consistencyGrade}</strong> 🌟
            </p>
            <p className="slide-description" style={{ fontSize: '0.9rem', marginTop: '10px' }}>
              {consistencyPercentage}% consistency this month
            </p>
          </div>
        )}
        <div className="quote-box" style={{ marginTop: '20px' }}>
          <p className="quote-text">Keep going! Every entry matters 💫</p>
        </div>
      </div>
    </div>
  );
}

