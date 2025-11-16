import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface PeakValleySlideProps {
  stats: MoodWrapStats;
}

export function PeakValleySlide({ stats }: PeakValleySlideProps) {
  if (!stats.peakHappinessMonth || !stats.hardestMonth) return null;

  const peakMonthName = stats.peakHappinessMonth.month.split(' ')[0];
  const hardestMonthName = stats.hardestMonth.month.split(' ')[0];
  
  // Get a quote from the happiest month
  const happyEntry = stats.peakHappinessMonth.entries
    .filter(e => ['happy', 'grateful', 'excited', 'calm'].includes(e.mood.id))[0];
  const happyQuote = happyEntry?.content.substring(0, 100) || '';

  return (
    <div className="slide-base peak-valley-slide">
      <div className="slide-content">
        <h2 className="slide-subtitle">Peak & Valley</h2>
        <div className="peak-valley-split">
          <div className="peak-side">
            <div className="sun-icon-large">☀️</div>
            <h3 className="side-title">Happiest month: {peakMonthName} ☀️</h3>
            {happyQuote && (
              <div className="quote-box-small">
                <p className="quote-text-small">"{happyQuote}{happyQuote.length >= 100 ? '...' : ''}"</p>
              </div>
            )}
          </div>
          <div className="valley-side">
            <div className="strength-icon-large">💪</div>
            <h3 className="side-title">Hardest month: {hardestMonthName} 💪</h3>
            <div className="resilience-message-small">
              <p>Showing resilience</p>
              <p>Growth from adversity</p>
            </div>
          </div>
        </div>
        <p className="slide-description" style={{ marginTop: '20px' }}>
          Celebrate both as growth ✨
        </p>
      </div>
    </div>
  );
}

