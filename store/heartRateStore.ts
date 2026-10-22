import { create } from 'zustand';

type HeartRateSource = 'none' | 'garmin' | 'ble' | 'healthkit';

interface HeartRateState {
  bpm: number | null;
  source: HeartRateSource;
  setBpm: (bpm: number | null, source?: HeartRateSource) => void;
}

export const useHeartRateStore = create<HeartRateState>((set) => ({
  bpm:    null,
  source: 'none',
  setBpm: (bpm, source = 'none') => set({ bpm, source }),
}));
