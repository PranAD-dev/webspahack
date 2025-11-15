import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface StreakSlideProps {
  stats: MoodWrapStats;
}

export function StreakSlide({ stats }: StreakSlideProps) {
  return (
    <div className="slide-base streak-slide">
      <div className="slide-content">
        <div className="fire-icon">🔥</div>
        <h2 className="slide-subtitle">Your Longest Streak</h2>
        <div className="big-number">{stats.longestStreak || 0}</div>
        <p className="slide-description">days in a row</p>
        <div className="trophy-badge">
          <span className="trophy-emoji">🏆</span>
          <span>Streak Champion!</span>
        </div>
      </div>
    </div>
  );
}

