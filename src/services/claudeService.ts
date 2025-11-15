import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
// Note: Using dangerouslyAllowBrowser is required for client-side usage
// but exposes your API key in the browser. For production, consider using
// a backend proxy to keep your API key secure.
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface ClaudeResponse {
  content: string;
  error?: string;
}

/**
 * Get journal entry suggestions based on mood
 */
export async function getJournalSuggestions(mood: string): Promise<ClaudeResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `I'm feeling ${mood} today. Give me 3 thoughtful journal prompts or questions to help me explore this feeling. Keep them concise (1-2 sentences each) and empathetic.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return { content: content.text };
    }
    return { content: '', error: 'Unexpected response format' };
  } catch (error: any) {
    console.error('Claude API error:', error);
    return { 
      content: '', 
      error: error.message || 'Failed to get suggestions' 
    };
  }
}

/**
 * Analyze journal entry and provide insights
 */
export async function analyzeJournalEntry(
  entry: string,
  mood: string
): Promise<ClaudeResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `I wrote this journal entry while feeling ${mood}:\n\n"${entry}"\n\nProvide a brief, supportive reflection (2-3 sentences) that helps me understand my thoughts better. Be empathetic and insightful.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return { content: content.text };
    }
    return { content: '', error: 'Unexpected response format' };
  } catch (error: any) {
    console.error('Claude API error:', error);
    return { 
      content: '', 
      error: error.message || 'Failed to analyze entry' 
    };
  }
}

/**
 * Enhance or expand a journal entry
 */
export async function enhanceJournalEntry(
  entry: string,
  mood: string
): Promise<ClaudeResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `I wrote this journal entry while feeling ${mood}:\n\n"${entry}"\n\nHelp me expand on this thought. Provide suggestions for what I might want to explore further, or help me articulate what I'm feeling more deeply. Keep it in my voice and style.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return { content: content.text };
    }
    return { content: '', error: 'Unexpected response format' };
  } catch (error: any) {
    console.error('Claude API error:', error);
    return { 
      content: '', 
      error: error.message || 'Failed to enhance entry' 
    };
  }
}

/**
 * Detect mood from journal entry text
 * Now uses Gemini AI for faster and more accurate mood detection
 */
export async function detectMood(entry: string): Promise<{ mood: string; confidence: string } | { error: string }> {
  try {
    // Import the Gemini-based mood detection
    const { detectMood: detectMoodWithGemini } = await import('./moodDetection');

    const result = await detectMoodWithGemini(entry);

    return {
      mood: result.mood.id,
      confidence: result.confidence > 0.7 ? 'high' : result.confidence > 0.4 ? 'medium' : 'low'
    };
  } catch (error: any) {
    console.error('Mood detection error:', error);
    return { error: error.message || 'Failed to detect mood' };
  }
}

/**
 * Get general journaling prompts
 */
export async function getJournalPrompts(): Promise<ClaudeResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: 'Give me 5 thoughtful journal prompts to help me reflect on my day, thoughts, and feelings. Make them diverse and engaging (1-2 sentences each).',
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return { content: content.text };
    }
    return { content: '', error: 'Unexpected response format' };
  } catch (error: any) {
    console.error('Claude API error:', error);
    return { 
      content: '', 
      error: error.message || 'Failed to get prompts' 
    };
  }
}

