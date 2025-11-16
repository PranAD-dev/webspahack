//
//  JournalPrompts.tsx
//  SoulSpaceXR
//
//  AI-powered prompts to guide journal writing
//

import { useState, useEffect } from 'react';
import { getJournalPrompts } from '../services/claudeService';
import './JournalPrompts.css';

// Debug: Log when prompts change
let lastPromptsLog: string[] = [];

interface JournalPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  entryCount?: number; // Reload when entries change
}

export function JournalPrompts({ onSelectPrompt, entryCount = 0 }: JournalPromptsProps) {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when prompts change

  useEffect(() => {
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryCount]); // Reload when entry count changes for more personalization

  // Debug: Log when prompts state changes
  useEffect(() => {
    console.log('🔍 Prompts state effect triggered, current prompts:', prompts);
    console.log('🔍 Prompts length:', prompts.length);
    if (prompts.length > 0) {
      const promptsStr = JSON.stringify(prompts);
      const lastStr = JSON.stringify(lastPromptsLog);
      if (promptsStr !== lastStr) {
        console.log('🎯 PROMPTS STATE CHANGED:', prompts);
        lastPromptsLog = [...prompts];
      }
    }
  }, [prompts]);

  const loadPrompts = async () => {
    const requestId = Date.now();
    console.log('🔄 Loading NEW prompts...', new Date().toISOString(), 'Request ID:', requestId);
    setIsLoading(true);
    
    // Clear prompts immediately to show loading
    setPrompts([]);
    setRefreshKey(prev => prev + 1);
    
    try {
      console.log('📡 Calling getJournalPrompts API...');
      const startTime = Date.now();
      const response = await getJournalPrompts();
      const duration = Date.now() - startTime;
      console.log(`✅ API Response received for request ${requestId} (took ${duration}ms)`);
      console.log('📄 Full response:', response);
      console.log('📝 Response content length:', response.content?.length || 0);
      console.log('📝 Response has error?', response.error);
      console.log('📝 Response content preview:', response.content?.substring(0, 300));
      
      if (response.content && !response.error) {
        const promptText = response.content.trim();
        
        // Try multiple parsing strategies
        let parsedPrompts: string[] = [];
        
        // Strategy 1: Numbered list (1., 2., etc.) - most common format
        const numberedPattern = /^\d+[\.\)]\s*(.+)$/gm;
        const numberedMatches = promptText.match(numberedPattern);
        if (numberedMatches && numberedMatches.length > 0) {
          parsedPrompts = numberedMatches
            .map(match => {
              const cleaned = match.replace(/^\d+[\.\)]\s*/, '').trim();
              return cleaned;
            })
            .filter(p => p.length > 10 && p.length < 300);
        }
        
        // Strategy 2: Lines that start with numbers followed by text
        if (parsedPrompts.length === 0) {
          const lines = promptText.split('\n');
          parsedPrompts = lines
            .map(line => {
              const match = line.match(/^\d+[\.\)]\s*(.+)$/);
              return match ? match[1].trim() : null;
            })
            .filter((p): p is string => p !== null && p.length > 10 && p.length < 300);
        }
        
        // Strategy 3: Bullet points (-, •, *)
        if (parsedPrompts.length === 0) {
          const bulletPattern = /^[-•*]\s*(.+)$/gm;
          const bulletMatches = promptText.match(bulletPattern);
          if (bulletMatches && bulletMatches.length > 0) {
            parsedPrompts = bulletMatches
              .map(match => match.replace(/^[-•*]\s*/, '').trim())
              .filter(p => p.length > 10 && p.length < 300);
          }
        }
        
        // Strategy 4: Split by double newlines
        if (parsedPrompts.length === 0) {
          parsedPrompts = promptText
            .split(/\n\n+/)
            .map(line => line.trim())
            .filter(line => 
              line.length > 10 && 
              line.length < 300 &&
              !line.match(/^(prompt|question|suggestion|here|are|format)/i)
            );
        }
        
        // Strategy 5: Split by single newlines and filter intelligently
        if (parsedPrompts.length === 0) {
          parsedPrompts = promptText
            .split(/\n+/)
            .map(line => {
              // Remove leading numbers and punctuation
              return line.replace(/^\d+[\.\)]\s*/, '').trim();
            })
            .filter(line => 
              line.length > 15 && 
              line.length < 300 &&
              !line.match(/^(prompt|question|suggestion|here|are|format|make|diverse)/i) &&
              (line.match(/[?\.!]/) || line.length > 30) // Has punctuation or is substantial
            );
        }
        
        // Clean up prompts
        parsedPrompts = parsedPrompts
          .map(p => {
            // Remove quotes, extra whitespace
            return p.replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
          })
          .filter(p => p.length > 10)
          .slice(0, 5); // Limit to 5
        
        console.log('✅ Parsed prompts:', parsedPrompts); // Debug log
        console.log('📊 Number of prompts:', parsedPrompts.length);
        
        if (parsedPrompts.length > 0) {
          console.log('✨ Setting NEW prompts in state:', parsedPrompts);
          // Create a new array to ensure React detects the change
          const newPrompts = [...parsedPrompts];
          setPrompts(newPrompts);
          setRefreshKey(prev => prev + 1);
          console.log('✅ Prompts updated in state, count:', newPrompts.length);
          // Force a re-render check
          setTimeout(() => {
            console.log('🔍 State check - prompts should be:', newPrompts);
          }, 100);
        } else {
          console.warn('Failed to parse prompts, using fallback');
          // Fallback prompts if parsing fails
          setPrompts([
            "What's one thing that made you smile today?",
            "What challenge are you currently facing?",
            "What are you grateful for right now?",
            "How are you feeling in this moment?",
            "What would you tell your future self?"
          ]);
        }
      } else {
        console.error('❌ AI response error:', response.error);
        console.error('❌ Response object:', response);
        alert(`Failed to generate prompts: ${response.error || 'Unknown error'}. Please check your API key.`);
        // Fallback prompts if AI fails
        const fallbackPrompts = [
          "What's one thing that made you smile today?",
          "What challenge are you currently facing?",
          "What are you grateful for right now?",
          "How are you feeling in this moment?",
          "What would you tell your future self?"
        ];
        console.log('⚠️ Using fallback prompts:', fallbackPrompts);
        setPrompts(fallbackPrompts);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('❌ Error loading prompts:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      alert(`Error generating prompts: ${error?.message || 'Unknown error'}. Please check the console for details.`);
      // Fallback prompts
      const fallbackPrompts = [
        "What's one thing that made you smile today?",
        "What challenge are you currently facing?",
        "What are you grateful for right now?",
        "How are you feeling in this moment?",
        "What would you tell your future self?"
      ];
      console.log('⚠️ Using fallback prompts due to error:', fallbackPrompts);
      setPrompts(fallbackPrompts);
      setRefreshKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading complete for request', requestId);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked - generating NEW prompts');
    // Clear current prompts immediately to show loading state
    setPrompts([]);
    setRefreshKey(prev => prev + 1);
    // Force a fresh API call immediately
    loadPrompts();
  };

  return (
    <div className={`journal-prompts ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="prompts-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="prompts-title">
          <span className="prompts-icon">💡</span>
          <span>Writing Prompts</span>
          {isLoading && <span className="loading-dot">...</span>}
        </div>
        <button 
          className="prompts-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="prompts-content">
          {isLoading ? (
            <div className="prompts-loading">
              <div className="spinner"></div>
              <p>Generating thoughtful prompts...</p>
            </div>
          ) : (
            <>
              <div className="prompts-list" key={`prompts-list-${refreshKey}`}>
                {prompts.length > 0 ? (
                  prompts.map((prompt, index) => (
                    <button
                      key={`prompt-${refreshKey}-${index}-${prompt.substring(0, 30)}`}
                      className="prompt-item"
                      onClick={() => onSelectPrompt(prompt)}
                    >
                      <span className="prompt-number">{index + 1}</span>
                      <span className="prompt-text">{prompt}</span>
                      <span className="prompt-arrow">→</span>
                    </button>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(0,0,0,0.6)', padding: '20px' }}>
                    No prompts available. Click refresh to generate new ones.
                  </p>
                )}
              </div>
              <button 
                className="refresh-prompts"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                🔄 Get New Prompts
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

