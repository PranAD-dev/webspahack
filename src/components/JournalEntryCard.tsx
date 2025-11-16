import type { JournalEntry } from '../types';
import './JournalEntryCard.css';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onClick?: () => void;
}

export function JournalEntryCard({ entry, onClick }: JournalEntryCardProps) {
  const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Open entry in a new spatial window
      const entryData = encodeURIComponent(JSON.stringify(entry));
      const url = `${__XR_ENV_BASE__}/entry?entry=${entryData}`;
      window.open(url, `entry-${entry.id}`);
    }
  };

  return (
    <div
      className="journal-entry-card"
      style={{
        borderColor: entry.mood.color,
        boxShadow: `0 4px 20px ${entry.mood.color}40`,
        animationDelay: `${Math.random() * 2}s`
      }}
      onClick={handleClick}
    >
      <div className="entry-header">
        <span className="entry-mood" style={{ color: entry.mood.color }}>
          {entry.mood.emoji} {entry.mood.name}
        </span>
        <span className="entry-date">{formattedDate}</span>
      </div>
      {entry.title && (
        <div className="entry-title">
          {entry.title}
        </div>
      )}
      <div className="entry-content">
        {entry.content}
      </div>
      <div className="open-hint">
        <span>Click to open in spatial view</span>
      </div>
    </div>
  );
}
