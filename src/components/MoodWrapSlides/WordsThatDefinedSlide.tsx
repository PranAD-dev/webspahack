import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface WordsThatDefinedSlideProps {
  stats: MoodWrapStats;
  year: number;
}

export function WordsThatDefinedSlide({ stats, year }: WordsThatDefinedSlideProps) {
  if (!stats.wordCloud || stats.wordCloud.length === 0) return null;

  const topWords = stats.wordCloud.slice(0, 15);
  const maxCount = Math.max(...topWords.map(w => w.count));

  return (
    <div className="slide-base words-defined-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Words That Defined You</h2>
        <p className="slide-description" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          Your {year} vocabulary
        </p>
        <div className="defined-words-grid">
          {topWords.map((word, index) => {
            const size = 1 + (word.count / maxCount) * 2;
            const rotation = (Math.random() - 0.5) * 15;
            return (
              <div
                key={index}
                className="defined-word"
                style={{
                  fontSize: `${size}rem`,
                  transform: `rotate(${rotation}deg)`,
                  fontWeight: word.count > maxCount * 0.7 ? 600 : 400,
                }}
              >
                {word.word}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

