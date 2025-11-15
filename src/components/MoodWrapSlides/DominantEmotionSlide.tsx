import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface DominantEmotionSlideProps {
  stats: MoodWrapStats;
  monthName: string;
}

export function DominantEmotionSlide({ stats, monthName }: DominantEmotionSlideProps) {
  if (!stats.topMood) return null;

  const moodData = stats.moodBreakdown.find(m => m.mood.id === stats.topMood?.id);
  const count = moodData?.count || 0;

  return (
    <div 
      className="slide-base dominant-emotion-slide"
      style={{
        background: `linear-gradient(135deg, ${stats.topMood.color}20 0%, ${stats.topMood.color}40 100%)`,
      }}
    >
      <div className="slide-content">
        <h2 className="slide-subtitle">{monthName} was your</h2>
        <div className="emotion-display">
          <div className="emotion-emoji">{stats.topMood.emoji}</div>
          <div className="emotion-name">{stats.topMood.name.toUpperCase()}</div>
        </div>
        <div className="percentage-badge">{moodData?.percentage || 0}%</div>
        <p className="slide-description">
          You mentioned {stats.topMood.name.toLowerCase()} <strong>{count}</strong> times
        </p>
      </div>
    </div>
  );
}

