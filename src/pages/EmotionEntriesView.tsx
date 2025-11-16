import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MOODS, type JournalEntry } from '../types';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { BackButton } from '../components/BackButton';
import './EmotionBubble.css';

export function EmotionEntriesView() {
  const { moodId } = useParams<{ moodId: string }>();
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    loadEntries();
  }, [moodId]);

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
        
        // Find the mood and color
        if (moodId) {
          const mood = MOODS.find(m => m.id === moodId);
          if (mood) {
            setSelectedEmotion(mood.name);
            setSelectedColor(mood.color);
          }
        }
      }
    } catch (e) {
      console.error('Error loading entries:', e);
    }
  };

  // Filter entries based on moodId
  const filteredEntries = moodId 
    ? entries.filter(entry => {
        const entryMoodId = typeof entry.mood === 'string' ? entry.mood : entry.mood.id;
        // Handle excited/happy mapping
        if (moodId === 'excited') {
          return entryMoodId === 'excited' || entryMoodId === 'happy';
        }
        return entryMoodId === moodId;
      })
    : [];

  // Map moodId to bubble colors (matching EmotionBubble.tsx)
  const moodColorMap: Record<string, string> = {
    'sad': '#6BB6FF',           // Blue
    'angry': '#FF6B6B',         // Red
    'anxious': '#FFD93D',       // Yellow
    'calm': '#6BCB77',          // Green
    'excited': '#FF8CC8',       // Pink
    'grateful': '#A78BFA',      // Purple
    'reflective': '#FF8C42',    // Orange
    'overwhelmed': '#9B59B6',   // Deep Purple
  };

  // Get color from URL parameter first (exact bubble color), then fallback to mood color
  const colorFromUrl = searchParams.get('color');
  
  // Determine background color - prioritize URL parameter (exact bubble color)
  const backgroundColor = colorFromUrl || (moodId && moodColorMap[moodId]) || selectedColor || '#6BB6FF';

  return (
    <div 
      className="emotion-bubble-page"
      style={{
        background: backgroundColor,
        backgroundSize: '100% 100%',
        animation: 'none',
      }}
    >
      <BackButton />
      
      <div className="entries-view-container">
        <div className="entries-view-header">
          <button 
            className="back-to-bubbles-button"
            onClick={() => window.close()}
          >
            ← Close Tab
          </button>
          <h1 className="entries-view-title">
            {selectedEmotion || 'Emotion'} Entries
          </h1>
          <p className="entries-view-subtitle">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
          </p>
        </div>
        
        <div className="entries-view-list">
          {filteredEntries.length === 0 ? (
            <div className="entries-empty-state">
              <p className="entries-empty-text">No entries found for this emotion.</p>
              <button 
                className="back-to-bubbles-button"
                onClick={() => window.close()}
              >
                ← Close Tab
              </button>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

