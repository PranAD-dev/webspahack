import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface TransformationSlideProps {
  stats: MoodWrapStats;
}

export function TransformationSlide({ stats }: TransformationSlideProps) {
  if (!stats.transformationMoment) return null;

  const startDate = stats.transformationMoment.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = stats.transformationMoment.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="slide-base transformation-slide">
      <div className="slide-content">
        <div className="sparkle-icon">💪</div>
        <h2 className="slide-subtitle">From struggle to strength 💪</h2>
        <div className="transformation-timeline">
          <div className="timeline-start">
            <div className="timeline-date">{startDate}</div>
            <div className="timeline-mood" style={{ color: stats.transformationMoment.startMood.color }}>
              {stats.transformationMoment.startMood.emoji} {stats.transformationMoment.startMood.name}
            </div>
          </div>
          <div className="timeline-arrow">→</div>
          <div className="timeline-end">
            <div className="timeline-date">{endDate}</div>
            <div className="timeline-mood" style={{ color: stats.transformationMoment.endMood.color }}>
              {stats.transformationMoment.endMood.emoji} {stats.transformationMoment.endMood.name}
            </div>
          </div>
        </div>
        <p className="slide-description">Your emotional shift this month</p>
      </div>
    </div>
  );
}

