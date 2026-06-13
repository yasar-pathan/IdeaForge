'use client';

/**
 * Checks if sound effects are enabled in localStorage.
 * Defaults to true.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('ideaforge_sound_enabled') !== 'false';
}

/**
 * Toggles or sets sound effects setting in localStorage.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ideaforge_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Plays a premium chime synthesized on the fly via the Web Audio API.
 * This sound is a pleasant dual-tone ascending notification.
 */
export function playChime(): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First note (pleasant soft hum rising to clear tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second note (starts slightly later, harmony note)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.07); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.22); // C6
    
    gain2.gain.setValueAtTime(0.12, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

/**
 * Plays a triumphant celebratory chord chime when the analysis completes.
 */
export function playSuccessChime(): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major Chord)
    
    notes.forEach((freq, idx) => {
      const delay = idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Warm triangle wave for organic feel
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, now + delay + 0.25);
      
      gain.gain.setValueAtTime(0.0, now + delay);
      gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}
