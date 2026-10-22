import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types/session';
import { generateId } from '../utils/id';

interface SessionStore {
  sessions: Session[];
  pendingSession: Omit<Session, 'id'> | null;
  saveSession: (session: Omit<Session, 'id'>) => Session;
  setPendingSession: (session: Omit<Session, 'id'> | null) => void;
  deleteSession: (id: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      pendingSession: null,
      saveSession: (data) => {
        const session: Session = { ...data, id: generateId() };
        set((s) => ({ sessions: [session, ...s.sessions] }));
        return session;
      },
      setPendingSession: (session) => set({ pendingSession: session }),
      deleteSession: (id) => {
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) }));
      },
    }),
    {
      name: 'intrvl-sessions',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);
