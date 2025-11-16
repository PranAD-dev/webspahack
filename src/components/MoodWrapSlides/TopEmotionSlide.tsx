import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface TopEmotionSlideProps {
  stats: MoodWrapStats;
}

export function TopEmotionSlide({ stats }: TopEmotionSlideProps) {
  if (!stats.topMood) return null;

  const percentage = stats.moodBreakdown.find(m => m.mood.id === stats.topMood?.id)?.percentage || 0;

  return (
    <div 
      className="slide-base top-emotion-slide"
      style={{
        background: `linear-gradient(135deg, ${stats.topMood.color}20 0%, ${stats.topMood.color}40 100%)`,
      }}
    >
      <div className="slide-content">
        <h2 className="slide-subtitle">This week, you felt mostly</h2>
        <div className="emotion-display">
          <div className="emotion-emoji">{stats.topMood.emoji}</div>
          <div className="emotion-name">{stats.topMood.name.toUpperCase()}</div>
        </div>
        <div className="percentage-badge">{percentage}%</div>
        <p className="slide-description">of your entries</p>
      </div>
    </div>
  );
}

