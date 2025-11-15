import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface ConsistencySlideProps {
  stats: MoodWrapStats;
}

export function ConsistencySlide({ stats }: ConsistencySlideProps) {
  if (!stats.consistencyScore) return null;

  return (
    <div className="slide-base consistency-slide">
      <div className="slide-content">
        <div className="star-icon">🌟</div>
        <h2 className="slide-subtitle">Your Self-Care Consistency</h2>
        <div className="grade-display">{stats.consistencyScore.grade}</div>
        <div className="progress-bar-large">
          <div
            className="progress-fill-large"
            style={{
              width: `${stats.consistencyScore.percentage}%`,
              background: `linear-gradient(90deg, #ffb6c1 0%, #e6e6fa 50%, #b0e0e6 100%)`,
            }}
          ></div>
        </div>
        <p className="slide-description">
          {stats.consistencyScore.percentage >= 80
            ? "Amazing consistency! Keep it up! 💪"
            : stats.consistencyScore.percentage >= 60
            ? "Great progress! You're building a habit 🌱"
            : "Every day is a new opportunity to grow ✨"
          }
        </p>
      </div>
    </div>
  );
}

