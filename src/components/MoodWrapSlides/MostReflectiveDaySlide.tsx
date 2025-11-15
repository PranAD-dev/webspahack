import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface MostReflectiveDaySlideProps {
  stats: MoodWrapStats;
}

export function MostReflectiveDaySlide({ stats }: MostReflectiveDaySlideProps) {
  if (!stats.mostReflectiveEntry) return null;

  const entryDate = new Date(stats.mostReflectiveEntry.timestamp);
  const dateStr = entryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const wordCount = stats.mostReflectiveEntry.content.split(/\s+/).filter(w => w.length > 0).length;
  const quote = stats.mostReflectiveEntry.content.length > 150 
    ? stats.mostReflectiveEntry.content.substring(0, 150) + '...'
    : stats.mostReflectiveEntry.content;

  return (
    <div className="slide-base most-reflective-slide">
      <div className="slide-content">
        <div className="reflection-icon">💭</div>
        <h2 className="slide-subtitle">Your Most Reflective Entry</h2>
        <div className="reflective-date">{dateStr}</div>
        <div className="reflective-quote">
          <p>"{quote}"</p>
        </div>
        <div className="word-count-badge">{wordCount} words</div>
      </div>
    </div>
  );
}

