export type WorkoutFormat = 'for_time' | 'amrap' | 'intervals';
export type StepType = 'reps' | 'distance' | 'time';
export type DistanceUnit = 'm' | 'km' | 'mi';
export type TimeUnit = 's' | 'min';
export type WeightUnit = 'kg' | 'lb';

export interface Step {
  id: string;
  type: StepType;
  movement: string;
  value: number;
  unit?: DistanceUnit | TimeUnit;
  weight?: number;
  weight_unit?: WeightUnit;
  height?: number;
  target_pace?: string;
  target_hr?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  format: WorkoutFormat;
  sport?: string;
  steps: Step[];
  cap_time?: number;
  rounds?: number;
  created_at: string;
  updated_at: string;
}
