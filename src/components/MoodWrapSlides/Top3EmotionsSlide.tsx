import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface Top3EmotionsSlideProps {
  stats: MoodWrapStats;
}

export function Top3EmotionsSlide({ stats }: Top3EmotionsSlideProps) {
  if (!stats.top3Emotions || stats.top3Emotions.length === 0) return null;

  return (
    <div className="slide-base top3-emotions-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Your Emotional Podium</h2>
        <div className="podium-container">
          {stats.top3Emotions.map((emotion, index) => {
            const position = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
            const height = index === 0 ? 200 : index === 1 ? 150 : 100;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
            
            return (
              <div key={emotion.mood.id} className={`podium-item ${position}`}>
                <div className="podium-stand" style={{ height: `${height}px`, background: `linear-gradient(180deg, ${emotion.mood.color} 0%, ${emotion.mood.color}dd 100%)` }}>
                  <div className="medal">{medal}</div>
                  <div className="podium-emoji">{emotion.mood.emoji}</div>
                  <div className="podium-name">{emotion.mood.name}</div>
                  <div className="podium-percentage">{emotion.percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

