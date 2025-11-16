import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface BreakdownSlideProps {
  stats: MoodWrapStats;
}

export function BreakdownSlide({ stats }: BreakdownSlideProps) {
  // Get top 5 emotions for monthly "Emotional Palette"
  const topEmotions = stats.moodBreakdown.slice(0, 5);
  
  return (
    <div className="slide-base breakdown-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Your Emotional Palette</h2>
        <p className="slide-description" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          Your emotions in color
        </p>
        <div className="breakdown-list">
          {topEmotions.map((item, index) => (
            <div key={item.mood.id} className="breakdown-item" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="breakdown-emoji">{item.mood.emoji}</div>
              <div className="breakdown-info">
                <div className="breakdown-name">{item.mood.name}</div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill"
                    style={{ 
                      width: `${item.percentage}%`,
                      background: `linear-gradient(90deg, ${item.mood.color} 0%, ${item.mood.color}dd 100%)`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="breakdown-percentage">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

