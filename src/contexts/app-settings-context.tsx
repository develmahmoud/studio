"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppSettings {
  fontScale: number;
  setFontScale: (scale: number | ((prevScale: number) => number)) => void;
}

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

const FONT_SCALE_STORAGE_KEY = 'sightreader-font-scale';
const MIN_FONT_SCALE = 0.8;
const MAX_FONT_SCALE = 1.5;
const FONT_SCALE_STEP = 0.1;

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScaleState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const storedScale = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      return storedScale ? parseFloat(storedScale) : 1;
    } catch (e) {
      console.error("Error reading font scale from localStorage", e);
      return 1;
    }
  });

  const setFontScale = useCallback((scale: number | ((prevScale: number) => number)) => {
    setFontScaleState(prevScale => {
      const newScaleValue = typeof scale === 'function' ? scale(prevScale) : scale;
      const clampedScale = Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, newScaleValue));
      try {
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, clampedScale.toString());
      } catch (e) {
        console.error("Error saving font scale to localStorage", e);
      }
      document.documentElement.style.setProperty('--font-scale', clampedScale.toString());
      return clampedScale;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
  }, [fontScale]);
  
  // Initialize font scale on mount
  useEffect(() => {
    const initialScale = typeof window !== 'undefined' ? parseFloat(localStorage.getItem(FONT_SCALE_STORAGE_KEY) || '1') : 1;
    setFontScaleState(initialScale);
    document.documentElement.style.setProperty('--font-scale', initialScale.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <AppSettingsContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}

export { MIN_FONT_SCALE, MAX_FONT_SCALE, FONT_SCALE_STEP };
