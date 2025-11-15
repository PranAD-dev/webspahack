import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface GratitudeCounterSlideProps {
  stats: MoodWrapStats;
}

export function GratitudeCounterSlide({ stats }: GratitudeCounterSlideProps) {
  if (!stats.gratitudeCount) return null;

  return (
    <div className="slide-base gratitude-counter-slide">
      <div className="slide-content">
        <div className="heart-icon">💝</div>
        <h2 className="slide-subtitle">Gratitude Counter</h2>
        <div className="big-number">{stats.gratitudeCount}</div>
        <p className="slide-description">times you practiced gratitude this year</p>
        <div className="thank-you-message">
          <p>Thank you for choosing gratitude 🙏</p>
        </div>
      </div>
    </div>
  );
}

