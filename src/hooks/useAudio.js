import { useRef } from 'react';

export function useAudio() {
  const audioRef = useRef({ context: null, ready: false });

  function initAudio() {
    if (audioRef.current.ready) {
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioRef.current.context = new AudioContext();
      audioRef.current.ready = true;
    } catch (error) {
      console.error('Web Audio API could not be started:', error);
    }
  }

  function playSound(frequency, type, duration = 0.08, volume = 0.2) {
    if (!audioRef.current.ready || !audioRef.current.context) {
      return;
    }

    const oscillator = audioRef.current.context.createOscillator();
    const gainNode = audioRef.current.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioRef.current.context.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioRef.current.context.currentTime);
    gainNode.gain.setValueAtTime(volume, audioRef.current.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioRef.current.context.currentTime + duration);
    oscillator.start(audioRef.current.context.currentTime);
    oscillator.stop(audioRef.current.context.currentTime + duration);
  }

  function playTypingSound() {
    playSound(1900, 'triangle', 0.05, 0.3);
  }

  return { initAudio, playSound, playTypingSound };
}
