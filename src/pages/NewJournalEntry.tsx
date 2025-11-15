import { useState, useEffect, useRef } from 'react';
import { BackButton } from '../components/BackButton';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { detectMood } from '../services/claudeService';
import { MOODS, type Mood, type JournalEntry } from '../types';
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
  const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const detectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Auto-detect mood when text changes (with debounce)
  useEffect(() => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    if (entryText.trim().length > 20) {
      setIsDetecting(true);
      detectionTimeoutRef.current = setTimeout(async () => {
        const result = await detectMood(entryText);
        if ('mood' in result) {
          const mood = MOODS.find(m => m.id === result.mood);
          if (mood) {
            setDetectedMood(mood);
          }
        }
        setIsDetecting(false);
      }, 1500); // Wait 1.5 seconds after user stops typing
    } else {
      setDetectedMood(null);
      setIsDetecting(false);
    }

    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [entryText]);

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

  const handleSave = () => {
    if (!entryText.trim()) {
      alert('Please write something before saving.');
      return;
    }

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const newEntry = {
      id: Date.now().toString(),
      content: entryText,
      mood: detectedMood || MOODS[0],
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
    setDetectedMood(null);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
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
              style={{
                borderColor: detectedMood ? `${detectedMood.color}80` : 'rgba(255, 182, 193, 0.3)',
                boxShadow: detectedMood ? `0 0 30px ${detectedMood.color}40` : 'none',
              }}
            />
            
            <div className="mood-indicator">
              {isDetecting && (
                <div className="detecting-mood">
                  <span className="spinner"></span>
                  <span>Detecting mood...</span>
                </div>
              )}
              {detectedMood && !isDetecting && (
                <div 
                  className="detected-mood"
                  style={{
                    background: `${detectedMood.color}30`,
                    borderColor: detectedMood.color,
                  }}
                >
                  <span className="mood-emoji">{detectedMood.emoji}</span>
                  <span className="mood-name">{detectedMood.name}</span>
                </div>
              )}
            </div>
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
              disabled={!entryText.trim() || saved}
              style={{
                background: detectedMood
                  ? `linear-gradient(135deg, ${detectedMood.color} 0%, ${detectedMood.color}dd 100%)`
                  : 'linear-gradient(135deg, #ffb6c1 0%, #e6e6fa 100%)',
                opacity: saved ? 0.7 : 1,
              }}
            >
              {saved ? '✓ Saved!' : 'Save Entry'}
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

