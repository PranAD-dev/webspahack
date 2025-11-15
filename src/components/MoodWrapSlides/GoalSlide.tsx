import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface GoalSlideProps {
  stats: MoodWrapStats;
}

export function GoalSlide({ stats }: GoalSlideProps) {
  return (
    <div className="slide-base goal-slide">
      <div className="slide-content">
        <div className="goal-icon">🎯</div>
        <h2 className="slide-subtitle">Your Next Step</h2>
        <p className="goal-text">{stats.goal}</p>
        <div className="encouragement">
          <p>Keep going! Every entry matters 💫</p>
        </div>
      </div>
    </div>
  );
}

