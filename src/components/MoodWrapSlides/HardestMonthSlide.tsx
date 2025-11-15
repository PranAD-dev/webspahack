import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface HardestMonthSlideProps {
  stats: MoodWrapStats;
}

export function HardestMonthSlide({ stats }: HardestMonthSlideProps) {
  if (!stats.hardestMonth) return null;

  const monthName = stats.hardestMonth.month.split(' ')[0];

  return (
    <div className="slide-base hardest-month-slide">
      <div className="slide-content">
        <div className="strength-icon">💪</div>
        <h2 className="slide-subtitle">{monthName} was tough, but you made it through</h2>
        <div className="resilience-message">
          <p>You showed incredible resilience</p>
          <p>Every challenge made you stronger</p>
        </div>
        <div className="growth-badge">
          <span className="badge-icon">🌱</span>
          <span>Growth from adversity</span>
        </div>
      </div>
    </div>
  );
}

