import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface InsightSlideProps {
  stats: MoodWrapStats;
}

export function InsightSlide({ stats }: InsightSlideProps) {
  const insight = stats.insights[0] || "You're on a journey of self-discovery 🌟";

  return (
    <div className="slide-base insight-slide">
      <div className="slide-content">
        <div className="insight-icon">💡</div>
        <h2 className="slide-subtitle">Growth Insight</h2>
        <p className="insight-text">{insight}</p>
        {stats.totalEntries >= 5 && (
          <div className="achievement-badge">
            <span className="badge-icon">🏆</span>
            <span>Consistency Champion!</span>
          </div>
        )}
      </div>
    </div>
  );
}

