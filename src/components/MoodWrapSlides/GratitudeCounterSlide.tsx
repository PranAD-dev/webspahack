import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface GratitudeCounterSlideProps {
  stats: MoodWrapStats;
}

export function GratitudeCounterSlide({ stats }: GratitudeCounterSlideProps) {
  if (!stats.gratitudeCount) return null;

  const percentile = stats.percentile || 0;
  const percentileText = percentile <= 15 ? 'Top 15%' : percentile <= 30 ? 'Top 30%' : percentile <= 50 ? 'Top 50%' : '';

  return (
    <div className="slide-base gratitude-counter-slide">
      <div className="slide-content">
        <div className="heart-icon">🙏</div>
        <h2 className="slide-subtitle">Gratitude & Growth</h2>
        <div className="big-number">{stats.gratitudeCount}</div>
        <p className="slide-description">You practiced gratitude <strong>{stats.gratitudeCount}</strong> times 🙏</p>
        {stats.consistencyScore && percentileText && (
          <div className="consistency-badge" style={{ marginTop: '20px' }}>
            <p className="slide-description">
              Consistency badge: <strong>{percentileText} of SoulSpace users!</strong>
            </p>
            <div className="achievement-icon" style={{ fontSize: '3rem', marginTop: '10px' }}>🏆</div>
            <p className="slide-description" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              Celebration of dedication
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

