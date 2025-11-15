import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface MostActiveDaySlideProps {
  stats: MoodWrapStats;
}

export function MostActiveDaySlide({ stats }: MostActiveDaySlideProps) {
  if (!stats.mostActiveDay) return null;

  const maxCount = Math.max(...(stats.dayOfWeekBreakdown?.map(d => d.count) || [0]));

  return (
    <div className="slide-base active-day-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">You journal most on</h2>
        <div className="day-name">{stats.mostActiveDay.day}</div>
        <div className="day-chart">
          {stats.dayOfWeekBreakdown?.map((day, index) => {
            const height = (day.count / maxCount) * 150;
            return (
              <div key={index} className="day-bar">
                <div
                  className="day-bar-fill"
                  style={{
                    height: `${Math.max(height, 20)}px`,
                    background: day.day === stats.mostActiveDay?.day
                      ? 'linear-gradient(180deg, #ffb6c1 0%, #e6e6fa 100%)'
                      : 'linear-gradient(180deg, rgba(255, 182, 193, 0.5) 0%, rgba(230, 230, 250, 0.5) 100%)',
                  }}
                ></div>
                <div className="day-bar-label">{day.day.substring(0, 3)}</div>
                <div className="day-bar-count">{day.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

