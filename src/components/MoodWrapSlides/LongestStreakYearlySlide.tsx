import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface LongestStreakYearlySlideProps {
  stats: MoodWrapStats;
}

export function LongestStreakYearlySlide({ stats }: LongestStreakYearlySlideProps) {
  if (!stats.longestStreak || !stats.streakDates) return null;

  const startDate = stats.streakDates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = stats.streakDates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="slide-base longest-streak-yearly-slide">
      <div className="slide-content">
        <div className="fire-icon-large">🔥</div>
        <h2 className="slide-subtitle">Your Best Streak</h2>
        <div className="big-number">{stats.longestStreak}</div>
        <p className="slide-description">days in a row</p>
        <div className="streak-dates">
          <span>{startDate}</span>
          <span className="date-separator">→</span>
          <span>{endDate}</span>
        </div>
        <div className="celebration-graphic">🎉</div>
      </div>
    </div>
  );
}

