/**
 * Sound effects utility for SoulSpace
 * Generates twinkle/fairy dust sounds using Web Audio API
 */

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Generate a twinkle/fairy dust sound effect
 */
export function playTwinkleSound(volume: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    
    // Create multiple oscillators for a twinkling effect
    const frequencies = [800, 1000, 1200, 1500]; // High-pitched frequencies
    const duration = 0.3; // Short duration
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Create a twinkling envelope (quick attack, exponential decay)
      const startTime = ctx.currentTime + (index * 0.05); // Stagger the notes
      const endTime = startTime + duration;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  } catch (error) {
    console.warn('Could not play sound:', error);
  }
}

/**
 * Generate a soft click/tap sound
 */
export function playClickSound(volume: number = 0.2): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.warn('Could not play click sound:', error);
  }
}

/**
 * Generate a whoosh/swipe sound
 */
export function playSwipeSound(volume: number = 0.15): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (error) {
    console.warn('Could not play swipe sound:', error);
  }
}

/**
 * Generate a small ping sound (for buttons)
 */
export function playPingSound(volume: number = 0.2): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Ping sound: quick high note that drops slightly
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    // Quick attack, fast decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Could not play ping sound:', error);
  }
}

/**
 * Generate a "tada" celebration sound (for reaching final card)
 */
export function playTadaSound(volume: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    
    // Tada sound: ascending notes ending in a chord
    // First, ascending notes
    const ascendingNotes = [523.25, 659.25, 783.99]; // C, E, G
    const chordNotes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave)
    
    // Play ascending notes quickly
    ascendingNotes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + (index * 0.08);
      const endTime = startTime + 0.15;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
    
    // Then play the final chord
    const chordStartTime = ctx.currentTime + 0.3;
    chordNotes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, chordStartTime);
      
      const endTime = chordStartTime + 0.5;
      
      gainNode.gain.setValueAtTime(0, chordStartTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, chordStartTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      oscillator.start(chordStartTime);
      oscillator.stop(endTime);
    });
  } catch (error) {
    console.warn('Could not play tada sound:', error);
  }
}

/**
 * Generate a success/completion sound
 */
export function playSuccessSound(volume: number = 0.25): void {
  try {
    const ctx = getAudioContext();
    
    // Create a pleasant chord
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + (index * 0.05);
      const endTime = startTime + 0.4;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  } catch (error) {
    console.warn('Could not play success sound:', error);
  }
}

