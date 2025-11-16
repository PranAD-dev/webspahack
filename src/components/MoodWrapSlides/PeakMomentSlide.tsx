import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface PeakMomentSlideProps {
  stats: MoodWrapStats;
}

export function PeakMomentSlide({ stats }: PeakMomentSlideProps) {
  if (!stats.peakDay) return null;

  const dayName = stats.peakDay.date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = stats.peakDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const quote = stats.peakDay.entry.content.length > 100 
    ? stats.peakDay.entry.content.substring(0, 100) + '...'
    : stats.peakDay.entry.content;

  return (
    <div 
      className="slide-base peak-moment-slide"
      style={{
        background: `radial-gradient(circle at center, ${stats.peakDay.mood.color}30 0%, transparent 70%)`,
      }}
    >
      <div className="slide-content">
        <div className="sun-icon">☀️</div>
        <h2 className="slide-subtitle">Your brightest moment was</h2>
        <div className="peak-day">{dayName} ☀️</div>
        <div className="peak-date">{dateStr}</div>
        <div className="quote-box">
          <p className="quote-text">"{quote}"</p>
        </div>
        <div className="peak-mood-badge">
          {stats.peakDay.mood.emoji} {stats.peakDay.mood.name}
        </div>
      </div>
    </div>
  );
}

