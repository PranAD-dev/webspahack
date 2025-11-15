import { useState } from 'react';
import { getJournalSuggestions, analyzeJournalEntry, enhanceJournalEntry, getJournalPrompts } from '../services/claudeService';
import type { Mood } from '../types';
import './AIAssistant.css';

interface AIAssistantProps {
  mood: Mood | null;
  entryText: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

export function AIAssistant({ mood, entryText, onSuggestionSelect }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'suggestions' | 'analyze' | 'enhance' | 'prompts' | null>(null);

  const handleGetSuggestions = async () => {
    if (!mood) {
      setError('Please select a mood first');
      return;
    }

    setIsLoading(true);
    setError('');
    setActiveMode('suggestions');

    const result = await getJournalSuggestions(mood.name);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setResponse(result.content);
    }
  };

  const handleAnalyze = async () => {
    if (!entryText.trim()) {
      setError('Please write something first');
      return;
    }
    if (!mood) {
      setError('Please select a mood first');
      return;
    }

    setIsLoading(true);
    setError('');
    setActiveMode('analyze');

    const result = await analyzeJournalEntry(entryText, mood.name);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setResponse(result.content);
    }
  };

  const handleEnhance = async () => {
    if (!entryText.trim()) {
      setError('Please write something first');
      return;
    }
    if (!mood) {
      setError('Please select a mood first');
      return;
    }

    setIsLoading(true);
    setError('');
    setActiveMode('enhance');

    const result = await enhanceJournalEntry(entryText, mood.name);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setResponse(result.content);
    }
  };

  const handleGetPrompts = async () => {
    setIsLoading(true);
    setError('');
    setActiveMode('prompts');

    const result = await getJournalPrompts();
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setResponse(result.content);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <h3>✨ AI Assistant</h3>
        <p className="ai-subtitle">Get help with your journaling</p>
      </div>

      <div className="ai-actions">
        <button
          onClick={handleGetPrompts}
          disabled={isLoading}
          className="ai-button"
          title="Get general journal prompts"
        >
          📝 Prompts
        </button>
        {mood && (
          <button
            onClick={handleGetSuggestions}
            disabled={isLoading}
            className="ai-button"
            title="Get mood-specific suggestions"
          >
            💡 Suggestions
          </button>
        )}
        {entryText.trim() && mood && (
          <>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="ai-button"
              title="Get insights on your entry"
            >
              🔍 Analyze
            </button>
            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className="ai-button"
              title="Expand your thoughts"
            >
              ✨ Enhance
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="ai-error">
          ⚠️ {error}
        </div>
      )}

      {isLoading && (
        <div className="ai-loading">
          <div className="spinner"></div>
          <span>Thinking...</span>
        </div>
      )}

      {response && !isLoading && (
        <div className="ai-response">
          <div className="ai-response-header">
            <span className="ai-mode-badge">
              {activeMode === 'suggestions' && '💡 Suggestions'}
              {activeMode === 'analyze' && '🔍 Analysis'}
              {activeMode === 'enhance' && '✨ Enhancement'}
              {activeMode === 'prompts' && '📝 Prompts'}
            </span>
            <button
              onClick={() => {
                setResponse('');
                setActiveMode(null);
              }}
              className="ai-close"
            >
              ×
            </button>
          </div>
          <div className="ai-response-content">
            {activeMode === 'suggestions' || activeMode === 'prompts' ? (
              <ul className="ai-suggestions-list">
                {response
                  .split(/\d+\.|\n-|\n\*/)
                  .filter(item => item.trim().length > 0)
                  .map((item, index) => {
                    const cleaned = item.trim().replace(/^[-*•]\s*/, '');
                    if (!cleaned) return null;
                    return (
                      <li
                        key={index}
                        className="ai-suggestion-item"
                        onClick={() => handleSuggestionClick(cleaned)}
                      >
                        {cleaned}
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p>{response}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

