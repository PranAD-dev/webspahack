export type Mood = {
  id: string;
  name: string;
  color: string;
  emoji: string;
};

export type JournalEntry = {
  id: string;
  content: string;
  mood: Mood;
  timestamp: Date;
  position: { x: number; y: number; z: number };
};

export const MOODS: Mood[] = [
  { id: 'calm', name: 'Calm', color: '#60A5FA', emoji: '😌' },
  { id: 'happy', name: 'Happy', color: '#FBBF24', emoji: '😊' },
  { id: 'overwhelmed', name: 'Overwhelmed', color: '#A78BFA', emoji: '😵' },
  { id: 'sad', name: 'Sad', color: '#3B82F6', emoji: '😢' },
  { id: 'anxious', name: 'Anxious', color: '#F87171', emoji: '😰' },
  { id: 'grateful', name: 'Grateful', color: '#34D399', emoji: '🙏' },
  { id: 'excited', name: 'Excited', color: '#FB923C', emoji: '🤩' },
  { id: 'reflective', name: 'Reflective', color: '#818CF8', emoji: '🤔' },
];
