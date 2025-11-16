import { useEffect, useState } from 'react';
import { MOODS, type JournalEntry } from '../types';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { BackButton } from '../components/BackButton';
import './EmotionBubble.css';

interface Bubble {
  emotion: string;
  color: string;
  moodId: string;
}

export function EmotionBubble() {
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    try {
      const stored = localStorage.getItem('journalEntries');
      if (stored) {
        const parsed = JSON.parse(stored);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          mood: MOODS.find(m => m.id === entry.mood.id) || entry.mood,
        }));
        setEntries(entriesWithDates);
      }
    } catch (e) {
      console.error('Error loading entries:', e);
    }
  };

  // 6 bubbles with different colors and emotions
  const bubbles: Bubble[] = [
    { emotion: 'Sad', color: '#6BB6FF', moodId: 'sad' },           // Blue
    { emotion: 'Angry', color: '#FF6B6B', moodId: 'anxious' },    // Coral Red
    { emotion: 'Anxious', color: '#FFD93D', moodId: 'anxious' },  // Yellow
    { emotion: 'Calm', color: '#6BCB77', moodId: 'calm' },        // Green
    { emotion: 'Happy', color: '#FF8CC8', moodId: 'happy' },      // Pink
    { emotion: 'Grateful', color: '#A78BFA', moodId: 'grateful' }, // Purple
  ];

  const handleBubbleClick = (bubble: Bubble) => {
    const moodId = bubble.moodId;
    const filteredEntries = entries.filter(entry => entry.mood.id === moodId);
    setSelectedEntries(filteredEntries);
    setSelectedEmotion(bubble.emotion);
  };

  return (
    <div className="emotion-bubble-page">
      <BackButton />
      
      <div className="bubbles-container">
        <div className="bubbles-grid">
          {bubbles.map((bubble, index) => (
            <div
              key={index}
              className="emotion-bubble"
              style={{ 
                '--bubble-color': bubble.color,
                backgroundColor: bubble.color 
              } as React.CSSProperties}
              onClick={() => handleBubbleClick(bubble)}
            >
              <span className="bubble-emotion">{bubble.emotion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for showing entries */}
      {selectedEntries.length > 0 && selectedEmotion && (
        <div className="entries-modal" onClick={() => {
          setSelectedEntries([]);
          setSelectedEmotion(null);
        }}>
          <div className="entries-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="entries-modal-header">
              <h2 className="entries-modal-title">
                {selectedEmotion} Entries
              </h2>
              <button 
                className="entries-modal-close"
                onClick={() => {
                  setSelectedEntries([]);
                  setSelectedEmotion(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="entries-modal-list">
              {selectedEntries.length === 0 ? (
                <p className="entries-empty">No entries found for this emotion.</p>
              ) : (
                selectedEntries.map(entry => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
