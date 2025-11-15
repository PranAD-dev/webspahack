import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface ConsistencyBadgeSlideProps {
  stats: MoodWrapStats;
}

export function ConsistencyBadgeSlide({ stats }: ConsistencyBadgeSlideProps) {
  if (!stats.percentile) return null;

  return (
    <div className="slide-base consistency-badge-slide">
      <div className="slide-content">
        <div className="badge-icon-large">🏆</div>
        <h2 className="slide-subtitle">You're in the top {stats.percentile}%</h2>
        <p className="slide-description">of SoulSpace users!</p>
        <div className="achievement-badge-large">
          <div className="badge-title">Consistency Champion</div>
          <div className="badge-subtitle">Keep up the amazing work!</div>
        </div>
      </div>
    </div>
  );
}

