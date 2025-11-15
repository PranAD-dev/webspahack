import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SecondPage from "./SecondPage";
import type { JournalEntry } from './types';
import { VoiceInput } from './components/VoiceInput';
import { SpatialGallery } from './components/SpatialGallery';
import { JournalEntryCard } from './components/JournalEntryCard';
import { JournalEntryScene } from './pages/JournalEntryScene';
import { detectMood } from './services/moodDetection';

function JournalApp() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [view, setView] = useState<'create' | 'list' | 'spatial'>('create');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSaveEntry = async () => {
    if (!currentText.trim()) {
      alert('Please add some content to save');
      return;
    }

    // Show analyzing state
    setIsAnalyzing(true);

    try {
      // Detect mood when saving
      const result = await detectMood(currentText);

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content: currentText,
        mood: result.mood,
        timestamp: new Date(),
        position: {
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5,
          z: (Math.random() - 0.5) * 2,
        }
      };

      setEntries([newEntry, ...entries]);
      setCurrentText('');
      setIsAnalyzing(false);
      setView('list');
    } catch (error) {
      console.error('Failed to analyze mood:', error);
      alert('Failed to analyze mood. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="journal-app">
      <header className="app-header">
        <h1>Your thoughts deserve space.</h1>
        <nav className="view-toggle">
          <button
            className={view === 'create' ? 'active' : ''}
            onClick={() => setView('create')}
          >
            Create
          </button>
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            Journal ({entries.length})
          </button>
          <button
            className={view === 'spatial' ? 'active' : ''}
            onClick={() => setView('spatial')}
          >
            3D View
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'create' && (
          <div className="create-view">
            <div className="input-section">
              <VoiceInput onTranscript={setCurrentText} />

              <div className="text-input-container">
                <textarea
                  className="journal-textarea"
                  placeholder="Write your thoughts here... (AI will analyze your mood when you save)"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                />
              </div>

              <button
                className="save-button"
                onClick={handleSaveEntry}
                disabled={!currentText.trim() || isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing mood...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="list-view">
            {entries.length === 0 ? (
              <div className="empty-state">
                <p>No entries yet. Start journaling to see your thoughts here.</p>
                <button onClick={() => setView('create')}>Create First Entry</button>
              </div>
            ) : (
              <div className="entries-grid">
                {entries.map(entry => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'spatial' && (
          <div className="spatial-view">
            <SpatialGallery entries={entries} />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename={__XR_ENV_BASE__}>
      <Routes>
        <Route path="/second-page" element={<SecondPage />} />
        <Route path="/entry" element={<JournalEntryScene />} />
        <Route path="/" element={<JournalApp />} />
      </Routes>
    </Router>
  )
}

export default App
