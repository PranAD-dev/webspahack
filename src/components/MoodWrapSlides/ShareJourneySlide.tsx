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
        <div className="rocket-icon">🚀</div>
        <h2 className="slide-subtitle">2026 Awaits</h2>
        <p className="slide-description" style={{ marginBottom: '20px' }}>
          You've grown so much
        </p>
        <p className="slide-description" style={{ marginBottom: '30px', fontSize: '1rem' }}>
          Key {year} takeaway: {stats.topMood ? `Your year was defined by ${stats.topMood.name.toLowerCase()}` : 'Your journey of self-discovery continues'}
        </p>
        <p className="slide-description" style={{ marginBottom: '30px', fontSize: '1.1rem', fontWeight: 500 }}>
          Ready for your next chapter? 🚀
        </p>
        <button className="share-button" onClick={handleShare}>
          Share your {year} journey
        </button>
      </div>
    </div>
  );
}

