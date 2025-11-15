import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface YearInNumbersSlideProps {
  stats: MoodWrapStats;
}

export function YearInNumbersSlide({ stats }: YearInNumbersSlideProps) {
  const novelEquivalent = stats.totalWords && stats.totalWords > 50000 ? "That's like writing a novel! 📚" : 
                         stats.totalWords && stats.totalWords > 20000 ? "That's like writing a novella! 📖" :
                         "Keep writing to reach novel length! ✍️";

  return (
    <div className="slide-base year-numbers-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Year in Numbers</h2>
        <div className="year-stat">
          <div className="year-stat-number">{stats.totalEntries}</div>
          <div className="year-stat-label">entries this year!</div>
        </div>
        <div className="year-stat">
          <div className="year-stat-number">{stats.totalWords?.toLocaleString() || 0}</div>
          <div className="year-stat-label">words of self-reflection</div>
        </div>
        <p className="novel-equivalent">{novelEquivalent}</p>
        <div className="days-stat">
          <strong>{stats.daysJournaled || 0}</strong> out of <strong>365</strong> days
        </div>
      </div>
    </div>
  );
}

