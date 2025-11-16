import { useState, useEffect } from 'react';
import { generateJournalFeedback } from '../services/claudeService';
import './AIFeedback.css';

interface AIFeedbackProps {
  entryContent: string;
  detectedMood: string;
  entryTitle?: string;
  onClose?: () => void;
}

export function AIFeedback({ entryContent, detectedMood, entryTitle, onClose }: AIFeedbackProps) {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await generateJournalFeedback(entryContent, detectedMood, entryTitle);
        
        if (result.error) {
          setError(result.error);
        } else if (result.content) {
          setFeedback(result.content);
          setShowFeedback(true);
        } else {
          setError('No feedback received. Please try again.');
        }
      } catch (err: any) {
        console.error('Error fetching feedback:', err);
        setError(err.message || 'Failed to generate feedback. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [entryContent, detectedMood, entryTitle]);

  return (
    <div className="ai-feedback-container">
      <div className="ai-feedback-header">
        <div className="ai-feedback-title">
          <span className="ai-icon">✨</span>
          <h3>AI Reflection</h3>
        </div>
        {onClose && (
          <button className="ai-feedback-close" onClick={onClose} aria-label="Close feedback">
            ✕
          </button>
        )}
      </div>

      <div className="ai-feedback-content">
        {isLoading && (
          <div className="ai-feedback-loading">
            <div className="loading-spinner"></div>
            <p>Your AI companion is reflecting on your entry...</p>
          </div>
        )}

        {error && (
          <div className="ai-feedback-error">
            <p>⚠️ {error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                const fetchFeedback = async () => {
                  try {
                    const result = await generateJournalFeedback(entryContent, detectedMood, entryTitle);
                    if (result.error) {
                      setError(result.error);
                    } else if (result.content) {
                      setFeedback(result.content);
                      setShowFeedback(true);
                    }
                  } catch (err: any) {
                    setError(err.message || 'Failed to generate feedback.');
                  } finally {
                    setIsLoading(false);
                  }
                };
                fetchFeedback();
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {showFeedback && feedback && (
          <div className="ai-feedback-message">
            <div className="feedback-text">
              {feedback.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

