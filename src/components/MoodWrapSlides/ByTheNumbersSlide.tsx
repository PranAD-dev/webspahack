import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface ByTheNumbersSlideProps {
  stats: MoodWrapStats;
}

export function ByTheNumbersSlide({ stats }: ByTheNumbersSlideProps) {
  return (
    <div className="slide-base by-numbers-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">By The Numbers</h2>
        <div className="numbers-grid">
          <div className="stat-box">
            <div className="stat-number">{stats.totalEntries}</div>
            <div className="stat-label">Entries</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalWords?.toLocaleString() || 0}</div>
            <div className="stat-label">Words</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.daysJournaled || 0}</div>
            <div className="stat-label">Days Active</div>
          </div>
        </div>
        <p className="slide-description">
          You showed up for yourself <strong>{stats.daysJournaled || 0}</strong> days this month
        </p>
      </div>
    </div>
  );
}

