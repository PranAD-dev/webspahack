export type Mood = {
  id: string;
  name: string;
  color: string;
  description: string;
};

export type JournalEntry = {
  id: string;
  content: string;
  mood: Mood;
  timestamp: Date;
  position: { x: number; y: number; z: number };
};

// Refined mood palette: subtle, desaturated colors without emojis
export const MOODS: Mood[] = [
  { id: 'neutral', name: 'Neutral', color: '#A8B5C0', description: 'Balanced and observational' },
  { id: 'calm', name: 'Calm', color: '#7D9BAF', description: 'Peaceful and centered' },
  { id: 'reflective', name: 'Reflective', color: '#9B95B8', description: 'Thoughtful and introspective' },
  { id: 'energized', name: 'Energized', color: '#D4A574', description: 'Motivated and active' },
  { id: 'melancholic', name: 'Melancholic', color: '#6B7C8F', description: 'Contemplative and somber' },
  { id: 'hopeful', name: 'Hopeful', color: '#8FB89C', description: 'Optimistic and looking forward' },
  { id: 'anxious', name: 'Anxious', color: '#9B8FA8', description: 'Worried or uncertain' },
  { id: 'content', name: 'Content', color: '#A5B599', description: 'Satisfied and at peace' },
  { id: 'joyful', name: 'Joyful', color: '#D4B88A', description: 'Happy and uplifted' },
];
