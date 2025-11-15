import { useState, useEffect } from 'react';
import './VoiceInput.css';

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

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionClass();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const newText = (finalTranscript || interimTranscript).trim();
        onTranscript(newText);
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
  }, [onTranscript]);

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

  return (
    <div className="voice-input">
      <button
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
      >
        <div className="mic-icon">
          {isListening ? '🔴' : '🎙️'}
        </div>
        <span>{isListening ? 'Listening...' : 'Speak to journal'}</span>
      </button>
      {isListening && (
        <div className="listening-indicator">
          <div className="pulse"></div>
          <div className="pulse"></div>
          <div className="pulse"></div>
        </div>
      )}
    </div>
  );
}
