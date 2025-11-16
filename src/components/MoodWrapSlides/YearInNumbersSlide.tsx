import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface YearInNumbersSlideProps {
  stats: MoodWrapStats;
}

export function YearInNumbersSlide({ stats }: YearInNumbersSlideProps) {
  const therapySavings = Math.round((stats.daysJournaled || 0) * 9.7); // Approximate $9.70 per journal session
  
  return (
    <div className="slide-base year-numbers-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Year in Big Numbers</h2>
        <div className="year-numbers-list">
          <div className="year-number-item">
            <p className="year-number-text">Total entries: <strong>{stats.totalEntries}</strong> entries written</p>
          </div>
          <div className="year-number-item">
            <p className="year-number-text">Total words: <strong>{stats.totalWords?.toLocaleString() || 0}</strong> words - that's a novel! 📚</p>
          </div>
          <div className="year-number-item">
            <p className="year-number-text">Days journaled: <strong>{stats.daysJournaled || 0}</strong> out of <strong>365</strong> days</p>
          </div>
          <div className="year-number-item">
            <p className="year-number-text">Therapy savings: <strong>${therapySavings.toLocaleString()}</strong> 💰</p>
          </div>
        </div>
      </div>
    </div>
  );
}

