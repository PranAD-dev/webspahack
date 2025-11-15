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
  { id: 'calm', name: 'Calm', color: '#b0e0e6', emoji: '😌' },
  { id: 'happy', name: 'Happy', color: '#f0e68c', emoji: '😊' },
  { id: 'overwhelmed', name: 'Overwhelmed', color: '#dda0dd', emoji: '😵' },
  { id: 'sad', name: 'Sad', color: '#e6e6fa', emoji: '😢' },
  { id: 'anxious', name: 'Anxious', color: '#ffb6c1', emoji: '😰' },
  { id: 'grateful', name: 'Grateful', color: '#98d8c8', emoji: '🙏' },
  { id: 'excited', name: 'Excited', color: '#ffdab9', emoji: '🤩' },
  { id: 'reflective', name: 'Reflective', color: '#e6e6fa', emoji: '🤔' },
];
