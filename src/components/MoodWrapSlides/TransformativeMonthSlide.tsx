import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface TransformativeMonthSlideProps {
  stats: MoodWrapStats;
}

export function TransformativeMonthSlide({ stats }: TransformativeMonthSlideProps) {
  if (!stats.mostTransformativeMonth) return null;

  const monthName = stats.mostTransformativeMonth.month.split(' ')[0];
  const entryCount = stats.mostTransformativeMonth.entries.length;
  const topMood = stats.mostTransformativeMonth.topMood;

  return (
    <div 
      className="slide-base transformative-month-slide"
      style={{
        background: topMood 
          ? `radial-gradient(circle at center, ${topMood.color}30 0%, transparent 70%)`
          : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="slide-content">
        <div className="butterfly-icon">🦋</div>
        <h2 className="slide-subtitle">{monthName} changed everything</h2>
        <div className="month-stats">
          <div className="month-stat-item">
            <div className="stat-value">{entryCount}</div>
            <div className="stat-label">entries</div>
          </div>
          {topMood && (
            <div className="month-stat-item">
              <div className="stat-value">{topMood.emoji}</div>
              <div className="stat-label">{topMood.name}</div>
            </div>
          )}
        </div>
        <p className="slide-description">
          This month marked a significant shift in your journey
        </p>
      </div>
    </div>
  );
}

