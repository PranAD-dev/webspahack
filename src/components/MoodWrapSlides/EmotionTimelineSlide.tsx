import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface EmotionTimelineSlideProps {
  stats: MoodWrapStats;
}

export function EmotionTimelineSlide({ stats }: EmotionTimelineSlideProps) {
  if (!stats.monthlyBreakdown || stats.monthlyBreakdown.length === 0) return null;

  return (
    <div className="slide-base emotion-timeline-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">The Year Visualized</h2>
        <p className="slide-description" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          Your emotional seasons
        </p>
        <div className="timeline-heatmap">
          {stats.monthlyBreakdown.map((monthData, index) => {
            const monthName = monthData.month.split(' ')[0];
            const mood = monthData.topMood;
            const intensity = Math.min(monthData.entries.length / 10, 1);
            
            return (
              <div key={index} className="timeline-month">
                <div 
                  className="month-block"
                  style={{
                    background: mood 
                      ? `linear-gradient(135deg, ${mood.color}${Math.round(intensity * 100).toString(16).padStart(2, '0')} 0%, ${mood.color}${Math.round(intensity * 60).toString(16).padStart(2, '0')} 100%)`
                      : 'rgba(200, 200, 200, 0.3)',
                    height: `${50 + intensity * 100}px`,
                  }}
                >
                  {mood && <span className="month-emoji">{mood.emoji}</span>}
                </div>
                <div className="month-label">{monthName}</div>
              </div>
            );
          })}
        </div>
        <p className="slide-description">Seasonal patterns in your emotions</p>
      </div>
    </div>
  );
}

