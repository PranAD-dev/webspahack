import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface StreakSlideProps {
  stats: MoodWrapStats;
}

export function StreakSlide({ stats }: StreakSlideProps) {
  const mostActiveDay = stats.mostActiveDay;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="slide-base streak-slide">
      <div className="slide-content">
        <div className="fire-icon">🔥</div>
        <h2 className="slide-subtitle">Streak Power</h2>
        <div className="big-number">{stats.longestStreak || 0}</div>
        <p className="slide-description">Your longest streak: <strong>{stats.longestStreak || 0}</strong> days 🔥</p>
        {mostActiveDay && (
          <p className="slide-description" style={{ marginTop: '15px' }}>
            You journal most on <strong>{mostActiveDay.day}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

