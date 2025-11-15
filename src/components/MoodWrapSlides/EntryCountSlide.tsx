import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface EntryCountSlideProps {
  stats: MoodWrapStats;
}

export function EntryCountSlide({ stats }: EntryCountSlideProps) {
  return (
    <div className="slide-base entry-count-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">You wrote</h2>
        <div className="big-number">{stats.totalEntries}</div>
        <p className="slide-description">
          {stats.totalEntries === 1 
            ? "That's 1 moment of self-reflection 💭"
            : `That's ${stats.totalEntries} moments of self-reflection 💭`
          }
        </p>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min((stats.totalEntries / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

