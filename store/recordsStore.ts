import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ────────────────────────────────────────────────────────────────────
export interface RunRecord {
  id:          string;
  label:       string;
  distance_m:  number;
  time_s:      number;
  kg?:         number;   // pour les records de force (1RM, etc.)
}

export interface PaceInfo {
  pace_s_per_km: number;   // secondes par km
  pace_label:    string;   // "4'30/km"
  speed_kmh:     number;   // km/h (arrondi 1 décimale)
  speed_label:   string;   // "13.3 km/h"
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function calcPace(distance_m: number, time_s: number): PaceInfo | null {
  if (!time_s || !distance_m) return null;
  const dist_km      = distance_m / 1000;
  const pace_s_per_km = time_s / dist_km;
  const mins         = Math.floor(pace_s_per_km / 60);
  const secs         = Math.round(pace_s_per_km % 60);
  const speed_kmh    = Math.round((dist_km / (time_s / 3600)) * 10) / 10;
  return {
    pace_s_per_km,
    pace_label:  `${mins}'${String(secs).padStart(2, '0')}/km`,
    speed_kmh,
    speed_label: `${speed_kmh} km/h`,
  };
}

export function parseTimeInput(input: string): number {
  // Accepte: "4:30", "04:30", "4'30", "430" (= 4min30s), "23" (= 23min)
  input = input.trim().replace(/\s/g, '');
  if (!input) return 0;

  // Format MM:SS ou MM'SS
  const colonMatch = input.match(/^(\d{1,2})[:'m](\d{2})s?$/);
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);

  // 4 chiffres collés MMSS → ex: "0430" = 4'30
  if (/^\d{4}$/.test(input)) {
    const mm = parseInt(input.slice(0, 2));
    const ss = parseInt(input.slice(2, 4));
    if (ss < 60) return mm * 60 + ss;
  }

  // 1-2 chiffres seuls → traités comme des MINUTES (ex: "23" = 23 min)
  const minsOnly = parseInt(input);
  if (!isNaN(minsOnly) && input.length <= 2) return minsOnly * 60;

  return 0;
}

export function fmtTime(secs: number): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
}

// ── Default records (non renseignés) ─────────────────────────────────────────
const DEFAULT_RECORDS: RunRecord[] = [
  { id: 'run-1k',  label: '1k',  distance_m: 1000,  time_s: 0 },
  { id: 'run-5k',  label: '5k',  distance_m: 5000,  time_s: 0 },
  { id: 'run-10k', label: '10k', distance_m: 10000, time_s: 0 },
];

// ── Store ─────────────────────────────────────────────────────────────────────
interface RecordsStore {
  runRecords: RunRecord[];
  upsertRunRecord:  (label: string, distance_m: number, time_s: number, kg?: number) => void;
  deleteRunRecord:  (id: string) => void;
  getRunRecord:     (label: string) => RunRecord | undefined;
  getPaceForLabel:  (label: string) => PaceInfo | null;
}

export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set, get) => ({
      runRecords: DEFAULT_RECORDS,

      upsertRunRecord: (label, distance_m, time_s, kg?) => {
        set((s) => {
          const existing = s.runRecords.find((r) => r.label.toLowerCase() === label.toLowerCase());
          if (existing) {
            return {
              runRecords: s.runRecords.map((r) =>
                r.id === existing.id ? { ...r, time_s, distance_m, ...(kg !== undefined ? { kg } : {}) } : r
              ),
            };
          }
          const newRecord: RunRecord = {
            id:         `run-${label}-${Date.now()}`,
            label,
            distance_m,
            time_s,
            ...(kg !== undefined ? { kg } : {}),
          };
          return { runRecords: [...s.runRecords, newRecord] };
        });
      },

      deleteRunRecord: (id) => {
        // On ne supprime pas les 3 records par défaut
        const defaults = ['run-1k', 'run-5k', 'run-10k'];
        if (defaults.includes(id)) return;
        set((s) => ({ runRecords: s.runRecords.filter((r) => r.id !== id) }));
      },

      getRunRecord: (label) => {
        return get().runRecords.find(
          (r) => r.label.toLowerCase() === label.toLowerCase()
        );
      },

      getPaceForLabel: (label) => {
        const record = get().runRecords.find(
          (r) => r.label.toLowerCase() === label.toLowerCase()
        );
        if (!record || !record.time_s) return null;
        return calcPace(record.distance_m, record.time_s);
      },
    }),
    {
      name:    'intrvl-records',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
