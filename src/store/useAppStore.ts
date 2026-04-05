import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../services/supabase';

interface Task {
  id: string;
  title: string;
  min: number;
}

interface Mission {
  type: string;
  subtitle: string;
  tasks: Task[];
}

interface Holding {
  id: string;
  type: 'crypto' | 'equity';
  symbol: string;
  coinId?: string;
  amount: number;
  buyPrice: number;
}

interface AppState {
  // User & Session
  totalXP: number;
  isAuthenticated: boolean;
  
  // Missions & Progress
  missions: Record<number, Mission>;
  progress: Record<string, Record<string, boolean>>; // dateStr -> taskId -> completed
  awardedToday: Record<string, Record<string, boolean>>; // dateStr -> taskId -> awarded
  
  // Habits
  habitMatrix: Record<string, boolean>; // dateId -> won
  
  // Portfolio
  portfolioHoldings: Holding[];
  
  // Identity System
  identityIndex: number;
  
  // Focus Mode
  isFocusMode: boolean;
  
  // Actions
  addXP: (amount: number) => void;
  setAuthenticated: (status: boolean) => void;
  toggleTask: (dateStr: string, taskId: string, missionTasks: Task[]) => { xpAwarded: number; perfectDay: boolean };
  updateHabit: (dateId: string) => void;
  setPortfolio: (holdings: Holding[]) => void;
  nextIdentity: () => void;
  toggleFocus: () => void;
}

const DEFAULT_MISSIONS: Record<number, Mission> = {
  1: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  2: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  3: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  4: { type: 'BUILD', subtitle: 'Push the limits.', tasks: [{ id: '1', title: '.NET Development', min: 50 }, { id: '2', title: 'English Practice', min: 20 }, { id: '3', title: 'Trading Study', min: 20 }, { id: '4', title: 'Workout', min: 20 }, { id: '5', title: 'Typing Drill', min: 10 }] },
  5: { type: 'SURVIVE', subtitle: 'Maintain momentum. Do not break.', tasks: [{ id: '1', title: '.NET Maintenance', min: 20 }, { id: '2', title: 'English Review', min: 10 }, { id: '3', title: 'Workout Light', min: 10 }, { id: '4', title: 'Trading Check', min: 10 }] },
  6: { type: 'RECOVER', subtitle: 'Heal the body. Review the code.', tasks: [{ id: '1', title: 'Deep Stretching', min: 15 }, { id: '2', title: '.NET Review', min: 20 }, { id: '3', title: 'English Immersion', min: 10 }] },
  0: { type: 'RESET', subtitle: 'Prepare the environment for War.', tasks: [{ id: '1', title: 'Room Reset', min: 30 }, { id: '2', title: 'Meal Prep', min: 60 }, { id: '3', title: 'Plan 4 .NET Tasks', min: 15 }] }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      isAuthenticated: false,
      missions: DEFAULT_MISSIONS,
      progress: {},
      awardedToday: {},
      habitMatrix: {},
      portfolioHoldings: [],
      identityIndex: 0,
      isFocusMode: false,

      addXP: (amount: number) => set((state) => ({ totalXP: state.totalXP + amount })),
      
      setAuthenticated: (status: boolean) => set({ isAuthenticated: status }),

      toggleTask: (dateStr: string, taskId: string, missionTasks: Task[]) => {
        const state = get();
        const currentDayProgress = state.progress[dateStr] || {};
        const currentDayAwarded = state.awardedToday[dateStr] || {};
        
        const isCompleted = !currentDayProgress[taskId];
        const newProgress = { ...currentDayProgress, [taskId]: isCompleted };
        
        let xpAwarded = 0;
        let perfectDay = false;

        if (isCompleted && !currentDayAwarded[taskId]) {
          xpAwarded = 15; // XP_PER_TASK
          const newAwarded = { ...currentDayAwarded, [taskId]: true };
          
          // Check for perfect day
          const allDone = missionTasks.every(t => t.id === taskId || newProgress[t.id]);
          if (allDone && !currentDayAwarded['__perfect_day__']) {
            xpAwarded += 50; // XP_PERFECT_DAY_BONUS
            newAwarded['__perfect_day__'] = true;
            perfectDay = true;
          }

          set((s) => ({
            progress: { ...s.progress, [dateStr]: newProgress },
            awardedToday: { ...s.awardedToday, [dateStr]: newAwarded },
            totalXP: s.totalXP + xpAwarded
          }));
        } else {
          set((s) => ({
            progress: { ...s.progress, [dateStr]: newProgress }
          }));
        }

        return { xpAwarded, perfectDay };
      },

      updateHabit: (dateId: string) => set((state) => ({
        habitMatrix: { ...state.habitMatrix, [dateId]: !state.habitMatrix[dateId] }
      })),

      setPortfolio: (holdings: Holding[]) => set({ portfolioHoldings: holdings }),

      nextIdentity: () => set((state) => ({ identityIndex: (state.identityIndex + 1) % 5 })),

      toggleFocus: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
    }),
    {
      name: 'command-os-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Prevent unused variable error while keeping supabase for future background sync logic
console.log('Database Interface Initialized:', !!supabase);
