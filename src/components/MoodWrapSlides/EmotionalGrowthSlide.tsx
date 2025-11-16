import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface EmotionalGrowthSlideProps {
  stats: MoodWrapStats;
}

export function EmotionalGrowthSlide({ stats }: EmotionalGrowthSlideProps) {
  if (!stats.emotionalGrowth) return null;

  return (
    <div className="slide-base emotional-growth-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Evolution Story</h2>
        <div className="growth-comparison">
          <div className="growth-start">
            <div className="growth-label">January You</div>
            <div className="growth-mood" style={{ color: stats.emotionalGrowth.startMood.color }}>
              {stats.emotionalGrowth.startMood.emoji} {stats.emotionalGrowth.startMood.name}
            </div>
          </div>
          <div className="growth-arrow">→</div>
          <div className="growth-end">
            <div className="growth-label">December You</div>
            <div className="growth-mood" style={{ color: stats.emotionalGrowth.endMood.color }}>
              {stats.emotionalGrowth.endMood.emoji} {stats.emotionalGrowth.endMood.name}
            </div>
          </div>
        </div>
        <p className="slide-description">Before/after emotional comparison</p>
        <p className="slide-description" style={{ marginTop: '10px' }}>
          Look how far you've come ✨
        </p>
      </div>
    </div>
  );
}

