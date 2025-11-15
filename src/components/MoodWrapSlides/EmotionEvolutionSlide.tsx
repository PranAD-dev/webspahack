import type { MoodWrapStats } from '../../services/moodWrapService';
import { MOODS } from '../../types';
import './SlideBase.css';

interface EmotionEvolutionSlideProps {
  stats: MoodWrapStats;
}

export function EmotionEvolutionSlide({ stats }: EmotionEvolutionSlideProps) {
  if (!stats.emotionEvolution || stats.emotionEvolution.length === 0) {
    return null;
  }

  const maxHeight = 200;
  const moodCounts = new Map<string, number>();
  stats.emotionEvolution.forEach(e => {
    moodCounts.set(e.mood, (moodCounts.get(e.mood) || 0) + 1);
  });
  const maxCount = Math.max(...Array.from(moodCounts.values()));

  return (
    <div className="slide-base emotion-evolution-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Your Emotional Journey</h2>
        <div className="evolution-chart">
          {stats.emotionEvolution.slice(-14).map((point, index) => {
            const mood = MOODS.find(m => m.id === point.mood);
            const height = (moodCounts.get(point.mood) || 0) / maxCount * maxHeight;
            return (
              <div key={index} className="evolution-bar">
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.max(height, 20)}px`,
                    background: `linear-gradient(180deg, ${mood?.color || '#ffb6c1'} 0%, ${mood?.color || '#ffb6c1'}dd 100%)`,
                  }}
                ></div>
                <div className="bar-label">{point.date.split(' ')[1]}</div>
              </div>
            );
          })}
        </div>
        <p className="slide-description">Emotion trends over the month</p>
      </div>
    </div>
  );
}

