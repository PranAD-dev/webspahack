import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface LookingAheadSlideProps {
  stats: MoodWrapStats;
  nextMonth: string;
}

export function LookingAheadSlide({ stats, nextMonth }: LookingAheadSlideProps) {
  const motivationalQuotes = [
    "Every entry is a step toward self-discovery 🌟",
    "Your journey continues, one thought at a time 💭",
    "Keep writing, keep growing, keep shining ✨",
    "The best time to journal was yesterday, the second best is now 📔",
  ];
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="slide-base looking-ahead-slide">
      <div className="slide-content">
        <div className="unlock-icon">🔓</div>
        <h2 className="slide-subtitle">{nextMonth} Goals Unlocked</h2>
        <p className="goal-suggestion">{stats.goal}</p>
        <div className="quote-box">
          <p className="quote-text">"{quote}"</p>
        </div>
      </div>
    </div>
  );
}

