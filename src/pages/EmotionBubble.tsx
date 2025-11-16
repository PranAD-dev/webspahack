import { useEffect, useState } from 'react';
import { MOODS, type JournalEntry } from '../types';
import { BackButton } from '../components/BackButton';
import './EmotionBubble.css';

interface Bubble {
  emotion: string;
  color: string;
  moodId: string;
}

export function EmotionBubble() {
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

  
  const calculateMoodPercentages = () => {
    if (entries.length === 0) {
      return {};
    }

    const moodCounts: Record<string, number> = {};
    
    // Count all entries by their mood ID
    entries.forEach(entry => {
      // Handle both cases: entry.mood.id or entry.mood (if it's already a string)
      const moodId = typeof entry.mood === 'string' ? entry.mood : entry.mood.id;
      
      if (moodId) {
        moodCounts[moodId] = (moodCounts[moodId] || 0) + 1;
      }
    });

    // Calculate percentages based on total entries
    const totalEntries = entries.length;
    const percentages: Record<string, number> = {};
    
    Object.keys(moodCounts).forEach(moodId => {
      percentages[moodId] = (moodCounts[moodId] / totalEntries) * 100;
    });

    // Also handle mood aliases/mappings (e.g., "anxious" for "angry")
    // Map "happy" entries to "excited" if needed
    if (moodCounts['happy'] && !moodCounts['excited']) {
      percentages['excited'] = (moodCounts['happy'] / totalEntries) * 100;
    } else if (moodCounts['happy'] && moodCounts['excited']) {
      // If both exist, combine them
      percentages['excited'] = ((moodCounts['happy'] + moodCounts['excited']) / totalEntries) * 100;
    }

    console.log('📊 Mood Percentages:', percentages);
    console.log('📝 Total Entries:', totalEntries);
    console.log('📈 Mood Counts:', moodCounts);

    return percentages;
  };

  const moodPercentages = calculateMoodPercentages();

  // 8 bubbles with different colors and emotions
  const bubbles: Bubble[] = [
    { emotion: 'Sad', color: '#6BB6FF', moodId: 'sad' },           // Blue
    { emotion: 'Angry', color: '#FF6B6B', moodId: 'angry' },       // Red
    { emotion: 'Anxious', color: '#FFD93D', moodId: 'anxious' },  // Yellow
    { emotion: 'Calm', color: '#6BCB77', moodId: 'calm' },         // Green
    { emotion: 'Excited', color: '#FF8CC8', moodId: 'excited' },  // Pink
    { emotion: 'Grateful', color: '#A78BFA', moodId: 'grateful' }, // Purple
    { emotion: 'Reflective', color: '#FF8C42', moodId: 'reflective' }, // Orange
    { emotion: 'Overwhelmed', color: '#9B59B6', moodId: 'overwhelmed' }, // Deep Purple
  ];

  const handleBubbleClick = (bubble: Bubble) => {
    const moodId = bubble.moodId;
    // Use URL constructor to ensure proper URL formatting
    const basePath = typeof __XR_ENV_BASE__ !== 'undefined' ? __XR_ENV_BASE__ : '/';
    const pathSegments = [basePath.replace(/^\/|\/$/g, ''), 'emotion-entries', moodId].filter(Boolean);
    const path = '/' + pathSegments.join('/');
    const url = new URL(path, window.location.origin);
    // Add color as URL parameter to ensure exact match
    url.searchParams.set('color', bubble.color);
    window.open(url.href, `emotionScene-${moodId}`);
  };

  return (
    <div
      className="emotion-bubble-page"
    >
      <BackButton />
      
      <div className="bubbles-container">
        <div className="bubbles-grid">
          {bubbles.map((bubble, index) => {
            const fillPercentage = moodPercentages[bubble.moodId] || 0;

            return (
              <div
                key={index}
                className="emotion-bubble glass-jar"
                style={{
                  '--bubble-color': bubble.color,
                  '--fill-percentage': `${fillPercentage}%`,
                } as React.CSSProperties}
                onClick={() => handleBubbleClick(bubble)}
              >
                <div className="jar-fill" style={{ height: `${fillPercentage}%` }}></div>
                <div className="jar-content">
                  <span className="bubble-emotion">{bubble.emotion}</span>
                  <span className="bubble-percentage">{fillPercentage.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
