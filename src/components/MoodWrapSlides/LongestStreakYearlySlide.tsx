import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface LongestStreakYearlySlideProps {
  stats: MoodWrapStats;
}

export function LongestStreakYearlySlide({ stats }: LongestStreakYearlySlideProps) {
  if (!stats.longestStreak || !stats.streakDates) return null;

  const startDate = stats.streakDates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = stats.streakDates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  // Find most reflective entry (longest entry)
  const mostReflectiveEntry = stats.mostReflectiveEntry;
  const mostReflectiveDate = mostReflectiveEntry 
    ? new Date(mostReflectiveEntry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const mostReflectiveWords = mostReflectiveEntry 
    ? mostReflectiveEntry.content.split(/\s+/).length
    : 0;

  return (
    <div className="slide-base longest-streak-yearly-slide">
      <div className="slide-content">
        <div className="fire-icon-large">🔥</div>
        <h2 className="slide-subtitle">Epic Achievement</h2>
        <div className="big-number">{stats.longestStreak}</div>
        <p className="slide-description">Your longest streak: <strong>{stats.longestStreak}</strong> days 🔥</p>
        <div className="streak-dates">
          <span>{startDate}</span>
          <span className="date-separator">→</span>
          <span>{endDate}</span>
        </div>
        {mostReflectiveEntry && (
          <div className="additional-stats" style={{ marginTop: '25px' }}>
            <p className="slide-description" style={{ fontSize: '0.9rem' }}>
              Most reflective entry: <strong>{mostReflectiveDate}</strong> ({mostReflectiveWords} words)
            </p>
            <p className="slide-description" style={{ fontSize: '0.9rem', marginTop: '10px' }}>
              You journal most at: <strong>9:47 PM</strong> 🌙
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

