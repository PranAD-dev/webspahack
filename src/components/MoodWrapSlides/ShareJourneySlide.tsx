import type { MoodWrapStats } from '../../services/moodWrapService';
import './SlideBase.css';

interface ShareJourneySlideProps {
  stats: MoodWrapStats;
  year: number;
}

export function ShareJourneySlide({ stats, year }: ShareJourneySlideProps) {
  const handleShare = () => {
    // Create shareable text
    const shareText = `My ${year} Soul Summary:
📔 ${stats.totalEntries} entries
💭 ${stats.totalWords?.toLocaleString() || 0} words
🔥 ${stats.longestStreak || 0} day streak
${stats.topMood ? `✨ Top emotion: ${stats.topMood.name}` : ''}

#SoulSpace #SoulSummary #Journaling #SelfReflection`;

    if (navigator.share) {
      navigator.share({
        title: `My ${year} Soul Summary`,
        text: shareText,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Journey summary copied to clipboard!');
    }
  };

  return (
    <div className="slide-base share-journey-slide">
      <div className="slide-content">
        <div className="share-icon">📤</div>
        <h2 className="slide-subtitle">Share Your Soul Summary</h2>
        <div className="share-stats-card">
          <div className="share-stat">
            <div className="share-number">{stats.totalEntries}</div>
            <div className="share-label">Entries</div>
          </div>
          <div className="share-stat">
            <div className="share-number">{stats.totalWords?.toLocaleString() || 0}</div>
            <div className="share-label">Words</div>
          </div>
          <div className="share-stat">
            <div className="share-number">{stats.longestStreak || 0}</div>
            <div className="share-label">Day Streak</div>
          </div>
        </div>
        <button className="share-button" onClick={handleShare}>
          Share Your {year} Soul Summary
        </button>
        <p className="slide-description">Share your Soul Summary!</p>
      </div>
    </div>
  );
}

