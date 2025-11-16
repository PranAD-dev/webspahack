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
 * Generate a title for a journal entry based on its content
 */
export async function generateJournalTitle(entryContent: string): Promise<ClaudeResponse> {
  try {
    if (!entryContent || entryContent.trim().length < 10) {
      return { 
        content: '', 
        error: 'Please write at least a few sentences before generating a title.' 
      };
    }

    // Import Gemini AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY is not set. Please check your .env file.');
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    const prompt = `Read this journal entry and generate a short, meaningful title (3-8 words max) that captures the essence or main theme of what the person wrote. The title should be:
- Concise and impactful
- Reflective of the emotional tone or main topic
- Not too generic (avoid titles like "My Thoughts" or "Journal Entry")
- Personal and meaningful

Journal entry:
"${entryContent}"

Generate ONLY the title, nothing else. No quotes, no explanations, just the title text.`;

    // Try different model names
    const modelNames = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];
    
    let lastError: any = null;
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 50,
          },
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let title = response.text().trim();
        
        // Clean up the title (remove quotes if present)
        title = title.replace(/^["']|["']$/g, '').trim();
        
        return { content: title };
      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} failed for title generation:`, error.message);
        lastError = error;
        if (error?.status === 404 || error?.statusCode === 404 || error?.message?.includes('404')) {
          continue; // Try next model
        } else {
          break; // Other errors, stop trying
        }
      }
    }
    
    throw lastError || new Error('Failed to generate title');
  } catch (error: any) {
    console.error('❌ Title generation error:', error);
    return { 
      content: '', 
      error: error?.message || 'Failed to generate title. Please try again.' 
    };
  }
}

/**
 * Get general journaling prompts
 */
export async function getJournalPrompts(): Promise<ClaudeResponse> {
  try {
    // Import Gemini AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY is not set. Please check your .env file.');
    }
    
    // Validate API key format (Gemini keys usually start with "AIza")
    if (!API_KEY.startsWith('AIza')) {
      console.warn('⚠️ API key format might be incorrect. Gemini API keys usually start with "AIza"');
    }
    
    console.log('🔑 API Key loaded:', API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 4));
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get time of day for contextual prompts
    const hour = new Date().getHours();
    let timeContext = '';
    if (hour >= 5 && hour < 12) {
      timeContext = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeContext = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeContext = 'evening';
    } else {
      timeContext = 'night';
    }

    // Get past entries for personalization and follow-ups - ALWAYS load fresh from localStorage
    let entries: any[] = [];
    let entryCount = 0;
    let recentEntriesText = '';
    let pastEventsSummary = '';
    let allEntriesText = '';
    
    try {
      // Always get fresh data from localStorage (no caching)
      const stored = localStorage.getItem('journalEntries');
      if (stored) {
        entries = JSON.parse(stored);
        entryCount = entries.length;
        
        // Get recent entries (last 7-10 for more context) for better personalization
        const recentEntries = entries
          .slice(0, Math.min(10, entries.length))
          .map((e: any) => {
            const date = new Date(e.timestamp);
            const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
            return {
              content: e.content,
              daysAgo,
              mood: e.mood?.name || 'unknown',
              date: date.toLocaleDateString()
            };
          });
        
        if (recentEntries.length > 0) {
          // More detailed recent entries text
          recentEntriesText = recentEntries
            .map((e, i) => `${i + 1}. (${e.daysAgo} days ago, ${e.date}, felt ${e.mood}): "${e.content.substring(0, 150)}${e.content.length > 150 ? '...' : ''}"`)
            .join('\n');
          
          // Extract ALL content for better context
          allEntriesText = entries.map((e: any) => e.content).join(' ');
          
          // Extract key events/mentions from past entries
          pastEventsSummary = `All themes and topics from their entries: ${allEntriesText.substring(0, 500)}...`;
        }
      }
    } catch (e) {
      console.error('Error loading entries for prompts:', e);
    }

    const experienceLevel = entryCount === 0 
      ? 'first-time journaler' 
      : entryCount < 5 
        ? 'new to journaling' 
        : entryCount < 20 
          ? 'regular journaler' 
          : 'experienced journaler';

    // Add timestamp to ensure fresh prompts each time
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    // Build personalized prompt with emphasis on NEW and DIFFERENT prompts each time
    let promptContent = `Generate 5 COMPLETELY NEW AND DIFFERENT thoughtful, engaging journal prompts for someone who is ${experienceLevel}. It's ${timeContext} where they are. This is request #${randomSeed} at ${new Date(timestamp).toISOString()}, so make these prompts UNIQUE and DIFFERENT from any previous prompts.`;

    if (entryCount > 0) {
      promptContent += `\n\nThey have written ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} so far.`;
      
      if (recentEntriesText) {
        promptContent += `\n\nTheir recent journal entries (read these carefully for personalization):\n${recentEntriesText}`;
        
        if (pastEventsSummary) {
          promptContent += `\n\n${pastEventsSummary}`;
        }
        
        // Enhanced follow-up instructions with more emphasis
        promptContent += `\n\nCRITICAL REQUIREMENT: You MUST include 1-2 PERSONALIZED follow-up prompts that DIRECTLY reference SPECIFIC events, people, challenges, achievements, goals, relationships, or themes from their past entries above. These should feel like a continuation of their story and show you've read their entries. 

Examples of good personalized follow-ups:
- If they mentioned a challenge or problem, ask: "How has [specific challenge they mentioned] been going since you last wrote about it?"
- If they mentioned someone (friend, family, colleague), ask: "How is your relationship with [specific person they mentioned] developing?"
- If they mentioned a goal or plan, ask: "What progress have you made on [specific goal they mentioned]?"
- If they mentioned a feeling or emotion about something, ask: "How has your feeling about [specific situation they mentioned] evolved?"
- If they mentioned an event or experience, ask: "What have you learned from [specific event they mentioned] since then?"
- If they mentioned work/school, ask: "How has [specific work/school situation they mentioned] been progressing?"

IMPORTANT: Make these follow-ups SPECIFIC and PERSONAL - reference ACTUAL details, names, situations, or events from their entries above. Do NOT use generic questions. Show that you've read and understood their journal entries.`;
      }
      
      if (entryCount >= 10) {
        promptContent += `\n\nSince they're experienced, you can ask deeper, more reflective questions that build on their journaling journey.`;
      }
    }

    promptContent += `\n\nCRITICAL: Make these 5 prompts COMPLETELY NEW AND DIFFERENT from any previous prompts. Vary:
- The topics and themes
- The angles and perspectives  
- The wording and phrasing
- The types of questions (reflection vs. action vs. emotion)
- The focus areas

Requirements for all prompts:
- COMPLETELY NEW AND DIFFERENT from previous prompts (vary the topics, angles, and wording)
- Diverse (mix of reflection, gratitude, growth, emotions, goals, follow-ups on past entries)
- Easy to start (not overwhelming)
- 1-2 sentences each
- Thoughtful and meaningful
- Encouraging and non-judgmental
- Personal and relevant to their journey
- MUST include 1-2 personalized follow-up prompts that reference SPECIFIC details from their past entries above

Format them EXACTLY as a numbered list like this:
1. First prompt question here
2. Second prompt question here
3. Third prompt question here
4. Fourth prompt question here
5. Fifth prompt question here

ONLY output the numbered list, nothing else. No explanations, no intro text, just the 5 prompts.`;

    console.log('🤖 Calling Gemini API for NEW prompts...', { timestamp, randomSeed });
    console.log('📋 Prompt content length:', promptContent.length);
    console.log('🔑 Gemini API Key present?', !!API_KEY);
    
    // Try different model names in order of preference
    // Prioritizing Gemini 2.0 Flash as requested
    const modelNames = [
      'gemini-2.0-flash-exp',   // Gemini 2.0 Flash (experimental)
      'gemini-2.0-flash',       // Gemini 2.0 Flash
      'gemini-1.5-flash',       // Fallback to 1.5 Flash
      'gemini-1.5-pro',         // Fallback to 1.5 Pro
      'models/gemini-2.0-flash-exp', // With models/ prefix
      'models/gemini-2.0-flash',     // With models/ prefix
    ];
    let model;
    let lastError: any = null;
    
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        console.log(`🔑 API Key format check: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`);
        
        model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.9, // Higher temperature for more variation
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 600,
          },
        });
        
        console.log(`📡 Sending request to Gemini API with model: ${modelName}`);
        const result = await model.generateContent(promptContent);
        const response = await result.response;
        const responseText = response.text();
        
        console.log(`✅ Successfully used model: ${modelName}`);
        console.log('✅ Gemini API response received');
        console.log('📄 Response length:', responseText.length);
        console.log('📄 Response preview:', responseText.substring(0, 200));
        
        return { content: responseText };
      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} failed:`, error.message);
        console.warn(`⚠️ Error details:`, {
          message: error?.message,
          status: error?.status,
          statusCode: error?.statusCode,
          code: error?.code,
          name: error?.name
        });
        lastError = error;
        
        // Check if it's a 404 (model not found) - continue to next model
        const is404 = error?.status === 404 || 
                     error?.statusCode === 404 ||
                     error?.message?.includes('404') || 
                     error?.message?.includes('not found') ||
                     error?.code === 404;
        
        // Check if it's an auth error (401/403) - stop trying, this is a key issue
        const isAuthError = error?.status === 401 || 
                           error?.status === 403 ||
                           error?.statusCode === 401 ||
                           error?.statusCode === 403 ||
                           error?.message?.includes('API key') ||
                           error?.message?.includes('unauthorized') ||
                           error?.message?.includes('permission') ||
                           error?.code === 401 ||
                           error?.code === 403;
        
        if (is404) {
          continue; // Try next model if it's a 404
        } else if (isAuthError) {
          // Auth errors mean the API key is wrong, stop trying
          throw new Error(`Invalid or unauthorized API key. Please check your VITE_GEMINI_API_KEY in your .env file. Error: ${error?.message}`);
        } else {
          // Other errors - might be network, rate limit, etc. Continue trying
          continue;
        }
      }
    }
    
    // If all models failed with 404, provide helpful error message
    const triedModels = modelNames.join(', ');
    const errorMessage = lastError?.message || 'Unknown error';
    throw new Error(
      `All Gemini models failed (tried: ${triedModels}). ` +
      `This usually means:\n` +
      `1. Your API key doesn't have access to these models\n` +
      `2. The models need to be enabled in Google AI Studio (https://aistudio.google.com/)\n` +
      `3. Check your API key permissions and ensure Gemini API is enabled\n` +
      `Please visit https://aistudio.google.com/app/apikey to check your API key and available models.\n` +
      `Last error: ${errorMessage}`
    );
  } catch (error: any) {
    console.error('❌ Gemini API error:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      name: error?.name
    });
    
    // Try to list available models for debugging
    try {
      console.log('🔍 Attempting to list available models...');
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      if (API_KEY) {
        void new GoogleGenerativeAI(API_KEY);
        // Note: listModels might not be available in browser, but worth trying
        console.log('💡 Tip: Check Google AI Studio for available models');
      }
    } catch (listError) {
      console.warn('Could not list models:', listError);
    }
    
    const errorMessage = error?.message || error?.statusText || 'Unknown error';
    const errorStatus = error?.status || error?.statusCode;
    
    // Provide user-friendly error message
    let userMessage = 'Failed to generate prompts. ';
    
    // Check for specific error types
    if (errorStatus === 401 || errorStatus === 403 || errorMessage.includes('API key') || errorMessage.includes('unauthorized')) {
      userMessage += 'Invalid or unauthorized API key. ';
      userMessage += '\n\nTo fix this:\n';
      userMessage += '1. Create a .env file in the webspahack directory (if it doesn\'t exist)\n';
      userMessage += '2. Add: VITE_GEMINI_API_KEY=your-api-key-here\n';
      userMessage += '3. Get your API key from: https://aistudio.google.com/app/apikey\n';
      userMessage += '4. Restart your dev server after adding the key';
    } else if (errorStatus === 404 || errorMessage.includes('404') || errorMessage.includes('not found')) {
      userMessage += 'The Gemini model is not available with your API key. ';
      userMessage += '\n\nPlease check:\n';
      userMessage += '1. Visit https://aistudio.google.com/app/apikey to verify your API key\n';
      userMessage += '2. Ensure Gemini API is enabled for your project\n';
      userMessage += '3. Check which models are available in Google AI Studio\n';
      userMessage += '4. Your API key might need to be regenerated or have permissions updated';
    } else {
      userMessage += errorMessage;
      userMessage += '\n\nPlease check:\n';
      userMessage += '1. Your VITE_GEMINI_API_KEY is set in your .env file\n';
      userMessage += '2. Your API key is valid at https://aistudio.google.com/app/apikey\n';
      userMessage += '3. You have restarted your dev server after adding the key';
    }
    
    return { 
      content: '', 
      error: userMessage
    };
  }
}

/**
 * Generate AI feedback for a journal entry
 * Provides conversational, supportive feedback on emotions, strengths, and growth areas
 */
export async function generateJournalFeedback(
  entryContent: string,
  detectedMood: string,
  entryTitle?: string
): Promise<ClaudeResponse> {
  try {
    // Import Gemini AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('VITE_GEMINI_API_KEY is not set. Please check your .env file.');
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names in order of preference
    const modelNames = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'models/gemini-2.0-flash-exp',
      'models/gemini-2.0-flash',
    ];
    
    let model;
    let lastError: any = null;
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7, // Slightly higher for more conversational tone
            topP: 0.9,
            topK: 40,
          },
        });
        console.log(`✅ Using model: ${modelName} for journal feedback`);
        break;
      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} failed:`, error.message);
        lastError = error;
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          continue;
        } else {
          throw error;
        }
      }
    }
    
    if (!model) {
      throw lastError || new Error('All model attempts failed for journal feedback');
    }

    const prompt = `You are a compassionate, supportive AI companion helping someone reflect on their journal entry. Your role is to provide warm, conversational feedback - NOT to judge or tell them what's right or wrong.

Journal Entry${entryTitle ? ` (Title: "${entryTitle}")` : ''}:
"${entryContent}"

Detected Emotion: ${detectedMood}

Provide feedback in a warm, conversational chat style (like talking to a friend). Structure your response as follows:

1. **Acknowledge their emotions** - Validate what they're feeling. Show you understand their emotional state.

2. **What they did well** - Highlight positive aspects:
   - Self-awareness
   - Willingness to reflect
   - Honesty and vulnerability
   - Any growth or insights you notice
   - Strength in expressing themselves

3. **Gentle suggestions for growth** (not "what you did wrong"):
   - Kind suggestions for self-care or reflection
   - Questions they might consider exploring
   - Gentle encouragement for areas they might want to explore further
   - Supportive next steps

Keep it:
- Conversational and warm (use "you" and "I")
- Supportive, not judgmental
- Specific to what they wrote
- About 2-3 paragraphs total
- Focused on encouragement and understanding

Start your response directly with the feedback (no intro like "Here's your feedback:"). Write as if you're having a friendly conversation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedbackText = response.text().trim();

    return {
      content: feedbackText,
      error: undefined,
    };
  } catch (error: any) {
    console.error('❌ Error generating journal feedback:', error);
    
    let userMessage = 'Failed to generate feedback. ';
    
    if (error?.message?.includes('API_KEY') || error?.message?.includes('API key')) {
      userMessage += 'Please check your VITE_GEMINI_API_KEY in your .env file.';
    } else if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
      userMessage += 'Invalid or unauthorized API key. Please check your VITE_GEMINI_API_KEY.';
    } else {
      userMessage += 'Please try again later.';
    }
    
    return {
      content: '',
      error: userMessage,
    };
  }
}

