import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface WordCloudSlideProps {
  stats: MoodWrapStats;
  monthName: string;
}

export function WordCloudSlide({ stats, monthName }: WordCloudSlideProps) {
  if (!stats.wordCloud || stats.wordCloud.length === 0) return null;

  const maxCount = Math.max(...stats.wordCloud.map(w => w.count));
  const minSize = 1;
  const maxSize = 3;

  return (
    <div className="slide-base word-cloud-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Words That Matter</h2>
        <p className="slide-description" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          These words defined your {monthName}
        </p>
        <div className="word-cloud">
          {stats.wordCloud.slice(0, 10).map((word, index) => {
            const size = minSize + (word.count / maxCount) * (maxSize - minSize);
            const rotation = (Math.random() - 0.5) * 20;
            return (
              <span
                key={index}
                className="cloud-word"
                style={{
                  fontSize: `${size}rem`,
                  transform: `rotate(${rotation}deg)`,
                  opacity: 0.7 + (word.count / maxCount) * 0.3,
                }}
              >
                {word.word}
              </span>
            );
          })}
        </div>
        <p className="slide-description">Most used words in your entries</p>
      </div>
    </div>
  );
}

