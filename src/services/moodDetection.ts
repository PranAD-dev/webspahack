import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Mood } from '../types';
import { MOODS } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Available models: gemini-1.5-pro, gemini-1.5-flash-latest, gemini-pro
// Using gemini-1.5-flash-latest for speed

export interface MoodAnalysis {
  mood: Mood;
  confidence: number;
}

/**
 * Analyzes journal text and returns the detected mood with confidence level
 * Uses Gemini AI to understand emotional tone and context
 */
export async function detectMood(text: string): Promise<MoodAnalysis> {
  // Handle empty or very short text
  if (!text || text.trim().length < 5) {
    console.log('⚠️ Text too short, defaulting to neutral');
    return {
      mood: MOODS.find(m => m.id === 'neutral') || MOODS[0],
      confidence: 0.3,
    };
  }

  console.log('📝 Analyzing text:', text.substring(0, 100) + '...');

  try {
    // Using Gemini 2.0 Flash - latest and fastest model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const moodList = MOODS.map(m => `${m.id}: ${m.name} ${m.emoji}`).join('\n');

    const prompt = `You are an expert emotion analyst. Read this personal journal entry and identify the PRIMARY emotional state of the writer.

Available moods and their meanings:
${moodList}

Journal entry:
"${text}"

Analyze the emotional tone carefully. Look for:
- Explicit emotion words (sad, happy, worried, etc.)
- Tone and sentiment (negative, positive, uncertain)
- Context clues about the person's state of mind

Respond ONLY with a JSON object (no markdown, no code blocks, no extra text):
{"mood": "mood_id", "confidence": 0.85}

Where:
- mood_id must be one of: ${MOODS.map(m => m.id).join(', ')}
- confidence is 0.0 to 1.0 (how certain you are)

Important: DO NOT default to "neutral" unless the text is truly neutral/balanced. Pick the emotion that best matches the tone.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();

    console.log('🤖 GEMINI RAW RESPONSE:', responseText);

    // Parse the JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      console.log('🧹 CLEANED TEXT:', cleanText);
      parsed = JSON.parse(cleanText);
      console.log('✅ PARSED RESULT:', parsed);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    // Find the mood object
    const detectedMood = MOODS.find(m => m.id === parsed.mood);

    if (!detectedMood) {
      console.warn('AI returned unknown mood:', parsed.mood);
      return {
        mood: MOODS.find(m => m.id === 'neutral') || MOODS[0],
        confidence: 0.5,
      };
    }

    return {
      mood: detectedMood,
      confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
    };

  } catch (error) {
    console.error('Mood detection error:', error);

    // Fallback to neutral on error
    return {
      mood: MOODS.find(m => m.id === 'neutral') || MOODS[0],
      confidence: 0.3,
    };
  }
}

/**
 * Debounce helper for mood detection
 * Only triggers analysis after user stops typing for the specified delay
 */
export function debounceMoodDetection(
  callback: (text: string) => void,
  delay: number = 800
): (text: string) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (text: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(text);
    }, delay);
  };
}
