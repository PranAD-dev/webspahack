import { useState, useEffect } from 'react';
import { BackButton } from '../components/BackButton';
import { JournalPrompts } from '../components/JournalPrompts';
import { AIFeedback } from '../components/AIFeedback';
import { detectMood, generateJournalTitle } from '../services/claudeService';
import { MOODS, type JournalEntry } from '../types';
import './NewJournalEntry.css';

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
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackEntry, setFeedbackEntry] = useState<{ content: string; mood: string; title?: string } | null>(null);

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
        title: entryTitle.trim() || undefined, // Only include title if it's not empty
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

      // Reload entries
      loadEntries();

      // Open the new entry in a popup window
      const entryData = encodeURIComponent(JSON.stringify({
        ...newEntry,
        timestamp: new Date(newEntry.timestamp)
      }));
      const url = `${__XR_ENV_BASE__}/entry?entry=${entryData}`;
      window.open(url, `entry-${newEntry.id}`);

      // Reset form
      setEntryText('');
      setEntryTitle('');
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

  // Commented out unused function - can be re-enabled if needed
  // const generateAllTitles = async () => {
  //   const entriesWithoutTitles = entries.filter(entry => !entry.title || entry.title.trim() === '');
  //
  //   if (entriesWithoutTitles.length === 0) {
  //     alert('All entries already have titles! 🎉');
  //     return;
  //   }
  //
  //   if (!confirm(`Generate AI titles for ${entriesWithoutTitles.length} entry/entries? This may take a moment.`)) {
  //     return;
  //   }
  //
  //   try {
  //     const stored = JSON.parse(localStorage.getItem('journalEntries') || '[]');
  //     let updatedCount = 0;
  //
  //     for (let i = 0; i < entriesWithoutTitles.length; i++) {
  //       const entry = entriesWithoutTitles[i];
  //
  //       try {
  //         const result = await generateJournalTitle(entry.content);
  //
  //         if (result.content && !result.error) {
  //           const entryIndex = stored.findIndex((e: any) => e.id === entry.id);
  //           if (entryIndex !== -1) {
  //             stored[entryIndex].title = result.content;
  //             updatedCount++;
  //           }
  //         }
  //
  //         if (i < entriesWithoutTitles.length - 1) {
  //           await new Promise(resolve => setTimeout(resolve, 500));
  //         }
  //       } catch (error) {
  //         console.error(`Error generating title for entry ${entry.id}:`, error);
  //       }
  //     }
  //
  //     localStorage.setItem('journalEntries', JSON.stringify(stored));
  //     loadEntries();
  //
  //     alert(`Successfully generated titles for ${updatedCount} out of ${entriesWithoutTitles.length} entries! ✨`);
  //   } catch (error) {
  //     console.error('Error generating all titles:', error);
  //     alert('An error occurred while generating titles. Please try again.');
  //   }
  // };

  return (
    <div className="new-journal-entry-page">
      <BackButton />
      
      <div className="journal-container">
        <h1 className="journal-title">Journal</h1>
        
        {/* New Entry Form */}
        <div className="new-entry-section">
          <h2 className="section-title">Let your soul speak freely</h2>
          
          {/* Title Input */}
          <div className="title-input-wrapper">
            <input
              type="text"
              className="journal-title-input"
              placeholder="Add a title (optional)"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
            />
            <button
              className="generate-title-button"
              onClick={async () => {
                if (!entryText.trim()) {
                  alert('Please write something first before generating a title.');
                  return;
                }
                setIsGeneratingTitle(true);
                try {
                  const result = await generateJournalTitle(entryText);
                  if (result.content && !result.error) {
                    setEntryTitle(result.content);
                  } else {
                    alert(result.error || 'Failed to generate title. Please try again.');
                  }
                } catch (error) {
                  console.error('Error generating title:', error);
                  alert('Failed to generate title. Please try again.');
                } finally {
                  setIsGeneratingTitle(false);
                }
              }}
              disabled={isGeneratingTitle || !entryText.trim()}
              title="Generate title with AI"
            >
              {isGeneratingTitle ? '✨ Generating...' : '✨ AI Title'}
            </button>
          </div>
          
          {/* AI-Powered Prompts */}
          <JournalPrompts 
            entryCount={entries.length}
            onSelectPrompt={(prompt) => {
              setEntryText(prev => prev ? `${prev}\n\n${prompt}\n\n` : `${prompt}\n\n`);
              // Scroll to textarea
              setTimeout(() => {
                const textarea = document.querySelector('.journal-textarea') as HTMLTextAreaElement;
                if (textarea) {
                  textarea.focus();
                  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }}
          />
          
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

        {/* AI Feedback Section */}
        {showFeedback && feedbackEntry && (
          <AIFeedback
            entryContent={feedbackEntry.content}
            detectedMood={feedbackEntry.mood}
            entryTitle={feedbackEntry.title}
            onClose={() => {
              setShowFeedback(false);
              setFeedbackEntry(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

