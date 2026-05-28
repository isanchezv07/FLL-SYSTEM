'use client';

import { useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
}

export default function MatchSoundEffects() {
  const startMatchAudio = useRef<HTMLAudioElement | null>(null);
  const endMatchAudio = useRef<HTMLAudioElement | null>(null);
  const prevIsRunning = useRef<boolean>(false);

  useEffect(() => {
    // Initialize audio
    startMatchAudio.current = new Audio('/sounds/start_match.wav');
    endMatchAudio.current = new Audio('/sounds/end_match.wav');

    const handleTimerUpdate = (data: TimerState) => {
      if (data.isRunning && !prevIsRunning.current) {
        // Match started
        console.log('🔊 Playing start match sound');
        startMatchAudio.current?.play().catch(err => console.error('Error playing start sound:', err));
      } else if (!data.isRunning && prevIsRunning.current && data.timeRemaining <= 0) {
        // Match ended
        console.log('🔊 Playing end match sound');
        endMatchAudio.current?.play().catch(err => console.error('Error playing end sound:', err));
      }
      prevIsRunning.current = data.isRunning;
    };

    const handlePlaySound = (data: { sound: 'start' | 'end' }) => {
      if (data.sound === 'start') {
        startMatchAudio.current?.play().catch(err => console.error('Error playing start sound:', err));
      } else if (data.sound === 'end') {
        endMatchAudio.current?.play().catch(err => console.error('Error playing end sound:', err));
      }
    };

    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('play_sound', handlePlaySound);

    return () => {
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off('play_sound', handlePlaySound);
    };
  }, []);

  return null; // This component doesn't render anything
}
