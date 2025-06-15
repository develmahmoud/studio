"use client";

import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisOptions {
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, lang?: string, rate?: number, pitch?: number, voiceURI?: string | null) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

const useSpeechSynthesis = (options?: SpeechSynthesisOptions): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      const synth = window.speechSynthesis;

      const updateVoices = () => {
        setVoices(synth.getVoices());
      };
      updateVoices(); // Initial call
      synth.onvoiceschanged = updateVoices; // Update when voices change

      return () => {
        synth.cancel(); // Cleanup on unmount
        synth.onvoiceschanged = null;
      };
    }
  }, []);

  const handleEnd = useCallback(() => {
    setIsSpeaking(false);
    setIsPaused(false);
    options?.onEnd?.();
  }, [options]);
  
  const handleError = useCallback((event: SpeechSynthesisErrorEvent) => {
    console.error("Speech synthesis error", event);
    setIsSpeaking(false);
    setIsPaused(false);
    options?.onError?.(event);
  }, [options]);


  useEffect(() => {
    if (utterance) {
      utterance.onend = handleEnd;
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onpause = () => {
        setIsSpeaking(true); // Still speaking, just paused
        setIsPaused(true);
      };
      utterance.onresume = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onerror = handleError;
    }
  }, [utterance, handleEnd, handleError]);

  const speak = useCallback((text: string, lang = 'en-US', rate = 1, pitch = 1, voiceURI: string | null = null) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.lang = lang;
    newUtterance.rate = Math.max(0.1, Math.min(rate, 10)); // Clamp rate
    newUtterance.pitch = Math.max(0, Math.min(pitch, 2)); // Clamp pitch

    if (voiceURI) {
      const selectedVoice = voices.find(voice => voice.voiceURI === voiceURI);
      if (selectedVoice) {
        newUtterance.voice = selectedVoice;
      }
    }
    
    setUtterance(newUtterance);
    window.speechSynthesis.speak(newUtterance);
  }, [isSupported, voices]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused && isSupported) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking, isPaused, isSupported]);

  const resume = useCallback(() => {
    if (isSpeaking && isPaused && isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSpeaking, isPaused, isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setUtterance(null);
    }
  }, [isSupported]);

  return { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported, voices };
};

export default useSpeechSynthesis;
