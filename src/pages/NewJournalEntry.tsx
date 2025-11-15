import { useState, useEffect } from 'react';
import { BackButton } from '../components/BackButton';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { detectMood } from '../services/claudeService';
import { MOODS, type JournalEntry } from '../types';
import './NewJournalEntry.css';

type SortOption = 'date-desc' | 'date-asc' | 'mood';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export function NewJournalEntry() {
  const [entryText, setEntryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Load entries from localStorage
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const stored = localStorage.getItem('journalEntries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          mood: MOODS.find(m => m.id === entry.mood.id) || entry.mood,
        }));
        setEntries(entriesWithDates);
      } catch (e) {
        console.error('Error loading entries:', e);
      }
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionClass();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const newText = (finalTranscript || interimTranscript).trim();
        setEntryText(newText);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);


  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSave = async () => {
    if (!entryText.trim()) {
      alert('Please write something before saving.');
      return;
    }

    setIsSaving(true);

    try {
      // Detect mood when saving
      const result = await detectMood(entryText);
      let mood = MOODS[0]; // Default to first mood

      if ('mood' in result) {
        const foundMood = MOODS.find(m => m.id === result.mood);
        if (foundMood) {
          mood = foundMood;
        }
      }

      // Save to localStorage
      const stored = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const newEntry = {
        id: Date.now().toString(),
        content: entryText,
        mood: mood,
        timestamp: new Date().toISOString(),
        position: {
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5,
          z: (Math.random() - 0.5) * 2,
        }
      };
      stored.unshift(newEntry);
      localStorage.setItem('journalEntries', JSON.stringify(stored));

      // Reload entries and reset form
      loadEntries();
      setEntryText('');
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sort entries
  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'date-asc':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'mood':
        return a.mood.name.localeCompare(b.mood.name);
      default:
        return 0;
    }
  });

  return (
    <div className="new-journal-entry-page">
      <BackButton />
      
      <div className="journal-container">
        <h1 className="journal-title">Journal</h1>
        
        {/* New Entry Form */}
        <div className="new-entry-section">
          <h2 className="section-title">New Entry</h2>
          <div className="text-area-wrapper">
            <textarea
              className="journal-textarea"
              placeholder="Start writing or use the microphone to speak your thoughts..."
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
            />
          </div>

          <div className="action-buttons">
            <button
              className={`speech-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              <span className="mic-icon">{isListening ? '🔴' : '🎙️'}</span>
              <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
            </button>

            <button
              className="save-button"
              onClick={handleSave}
              disabled={!entryText.trim() || saved || isSaving}
            >
              {isSaving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Entry'}
            </button>
          </div>
        </div>

        {/* Past Entries */}
        <div className="past-entries-section">
          <div className="entries-header">
            <h2 className="section-title">Past Entries</h2>
            {entries.length > 0 && (
              <div className="sort-controls">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="sort-select"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="mood">By Mood</option>
                </select>
              </div>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="empty-entries">
              <p>No entries yet. Start writing above to create your first entry!</p>
            </div>
          ) : (
            <div className="entries-grid">
              {sortedEntries.map(entry => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

