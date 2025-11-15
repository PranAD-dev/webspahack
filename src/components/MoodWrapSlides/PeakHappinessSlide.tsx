import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface PeakHappinessSlideProps {
  stats: MoodWrapStats;
}

export function PeakHappinessSlide({ stats }: PeakHappinessSlideProps) {
  if (!stats.peakHappinessMonth) return null;

  const monthName = stats.peakHappinessMonth.month.split(' ')[0];
  const happyEntries = stats.peakHappinessMonth.entries
    .filter(e => ['happy', 'grateful', 'excited', 'calm'].includes(e.mood.id))
    .slice(0, 3);

  return (
    <div className="slide-base peak-happiness-slide">
      <div className="slide-content">
        <div className="sun-icon-large">☀️</div>
        <h2 className="slide-subtitle">You were happiest in {monthName}</h2>
        <div className="happy-entries">
          {happyEntries.map((entry, index) => (
            <div key={index} className="happy-quote">
              <p>"{entry.content.substring(0, 80)}{entry.content.length > 80 ? '...' : ''}"</p>
              <span className="quote-mood">{entry.mood.emoji} {entry.mood.name}</span>
            </div>
          ))}
        </div>
        <p className="slide-description">A reminder of your good times ✨</p>
      </div>
    </div>
  );
}

