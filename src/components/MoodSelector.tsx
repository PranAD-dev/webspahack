import { type Mood, MOODS } from '../types';
import './MoodSelector.css';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onSelectMood: (mood: Mood) => void;
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <div className="mood-selector">
      <h3>How are you feeling?</h3>
      <div className="mood-grid">
        {MOODS.map((mood: Mood) => (
          <button
            key={mood.id}
            className={`mood-bubble ${selectedMood?.id === mood.id ? 'selected' : ''}`}
            style={{
              backgroundColor: mood.color,
              boxShadow: selectedMood?.id === mood.id
                ? `0 0 20px ${mood.color}`
                : `0 0 10px ${mood.color}40`
            }}
            onClick={() => onSelectMood(mood)}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-name">{mood.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
