import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '../types/workout';
import { generateId } from '../utils/id';

const now = new Date().toISOString();

const SEED_WORKOUTS: Workout[] = [
  {
    id: 'seed-madx',
    name: 'MADX Stamina',
    format: 'for_time',
    sport: 'HYROX',
    steps: [
      { id: 'ms-1', type: 'distance', movement: 'Run', value: 1.25, unit: 'km' },
      { id: 'ms-2', type: 'distance', movement: 'SkiErg', value: 1.5, unit: 'km' },
      { id: 'ms-3', type: 'distance', movement: 'Run', value: 1.25, unit: 'km' },
      { id: 'ms-4', type: 'distance', movement: 'Row', value: 1.5, unit: 'km' },
      { id: 'ms-5', type: 'distance', movement: 'Run', value: 1.25, unit: 'km' },
      { id: 'ms-6', type: 'reps', movement: 'Burpees Over Log', value: 75, height: 50 },
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-cf5020',
    name: 'CrossFit 50/20/50',
    format: 'for_time',
    steps: [
      { id: 'cf-1', type: 'reps', movement: 'Toes to Bar', value: 50 },
      { id: 'cf-2', type: 'reps', movement: 'Wall Walks', value: 20 },
      { id: 'cf-3', type: 'reps', movement: 'Toes to Bar', value: 50 },
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-emf',
    name: 'EMF Run Intervals',
    format: 'intervals',
    rounds: 6,
    steps: [
      { id: 'emf-1', type: 'time', movement: 'Sprint', value: 30, unit: 's', target_pace: '3k' },
      { id: 'emf-2', type: 'time', movement: 'Run', value: 120, unit: 's', target_pace: '5k' },
      { id: 'emf-3', type: 'time', movement: 'Rest', value: 60, unit: 's' },
    ],
    created_at: now,
    updated_at: now,
  },
];

interface WorkoutStore {
  workouts: Workout[];
  createWorkout: (data: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) => Workout;
  updateWorkout: (id: string, data: Partial<Omit<Workout, 'id' | 'created_at'>>) => void;
  deleteWorkout: (id: string) => void;
  getById: (id: string) => Workout | undefined;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: SEED_WORKOUTS,
      createWorkout: (data) => {
        const workout: Workout = {
          ...data,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((s) => ({ workouts: [workout, ...s.workouts] }));
        return workout;
      },
      updateWorkout: (id, data) => {
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === id ? { ...w, ...data, updated_at: new Date().toISOString() } : w
          ),
        }));
      },
      deleteWorkout: (id) => {
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) }));
      },
      getById: (id) => get().workouts.find((w) => w.id === id),
    }),
    {
      name: 'intrvl-workouts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
