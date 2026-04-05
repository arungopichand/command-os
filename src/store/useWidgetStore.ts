import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WidgetSize = 'sm' | 'md' | 'lg' | 'full';

export interface WidgetConfig {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  size: WidgetSize;
  order: number;
}

export interface TabConfig {
  id: string;
  label: string;
  widgets: WidgetConfig[];
}

interface WidgetState {
  tabs: Record<string, TabConfig>;
  activeTabId: string;
  
  // Actions
  setActiveTab: (id: string) => void;
  toggleWidget: (tabId: string, widgetId: string) => void;
  updateWidgetSize: (tabId: string, widgetId: string, size: WidgetSize) => void;
  reorderWidgets: (tabId: string, widgetIds: string[]) => void;
  renameWidget: (tabId: string, widgetId: string, newLabel: string) => void;
}

const DEFAULT_TABS: Record<string, TabConfig> = {
  'command': {
    id: 'command',
    label: 'Command Center',
    widgets: [
      { id: 'brief', type: 'brief', label: 'Mission Brief', visible: true, size: 'md', order: 0 },
      { id: 'priorities', type: 'priorities', label: 'Priorities', visible: true, size: 'md', order: 1 },
      { id: 'habits_summary', type: 'habits', label: 'Habits Summary', visible: true, size: 'sm', order: 2 },
      { id: 'focus_score', type: 'stats', label: 'Focus Score', visible: true, size: 'sm', order: 3 },
      { id: 'market_pulse', type: 'trading', label: 'Market Snapshot', visible: true, size: 'sm', order: 4 },
      { id: 'workout_snaps', type: 'workout', label: 'Workout Summary', visible: true, size: 'sm', order: 5 },
      { id: 'lexicon_word', type: 'english', label: 'Word of the Day', visible: true, size: 'sm', order: 6 },
    ]
  },
  'market': {
    id: 'market',
    label: 'Market Command',
    widgets: [
      { id: 'tv_chart', type: 'chart', label: 'Technical Snapshot', visible: true, size: 'full', order: 0 },
      { id: 'watchlist', type: 'watchlist', label: 'Tactical Watchlist', visible: true, size: 'md', order: 1 },
      { id: 'pnl', type: 'pnl', label: 'P&L Snapshot', visible: true, size: 'sm', order: 2 },
      { id: 'risk_panel', type: 'risk', label: 'Risk Panel', visible: true, size: 'sm', order: 3 },
    ]
  },
  'physical': {
    id: 'physical',
    label: 'Physical Ops',
    widgets: [
      { id: 'daily_workout', type: 'workout_plan', label: 'Daily Protocol', visible: true, size: 'lg', order: 0 },
      { id: 'streak', type: 'streak', label: 'Streak Tracker', visible: true, size: 'sm', order: 1 },
      { id: 'weekly_split', type: 'split', label: 'Weekly Split', visible: true, size: 'md', order: 2 },
    ]
  },
  'english': {
    id: 'english',
    label: 'Language Lab',
    widgets: [
      { id: 'lexicon_word', type: 'lexicon_word', label: 'Word of the Day', visible: true, size: 'lg', order: 0 },
      { id: 'lexicon_sentence', type: 'lexicon_sentence', label: 'Operational Context', visible: true, size: 'md', order: 1 },
    ]
  },
  'habits': {
    id: 'habits',
    label: 'Discipline Engine',
    widgets: [
      { id: 'checklist', type: 'check', label: 'Daily Checklist', visible: true, size: 'md', order: 0 },
      { id: 'compliance', type: 'stats', label: 'Compliance Score', visible: true, size: 'sm', order: 1 },
    ]
  },
  'focus': {
    id: 'focus',
    label: 'Deep Work',
    widgets: [
      { id: 'timer', type: 'timer', label: 'Focus Timer', visible: true, size: 'lg', order: 0 },
      { id: 'distraction_log', type: 'journal', label: 'Distraction Log', visible: true, size: 'sm', order: 1 },
    ]
  },
  'goals': {
    id: 'goals',
    label: 'Mission Planning',
    widgets: [
      { id: 'short_term', type: 'goals', label: 'Short Term', visible: true, size: 'md', order: 0 },
      { id: 'long_term', type: 'goals', label: 'Long Term', visible: true, size: 'md', order: 1 },
    ]
  },
  'journal': {
    id: 'journal',
    label: 'After Action Log',
    widgets: [
      { id: 'daily_log', type: 'journal', label: 'Daily Log', visible: true, size: 'full', order: 0 },
    ]
  },
  'settings': {
    id: 'settings',
    label: 'OS Control',
    widgets: [
      { id: 'module_visibility', type: 'config', label: 'Module Visibility', visible: true, size: 'full', order: 0 },
    ]
  }
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      tabs: DEFAULT_TABS,
      activeTabId: 'command',

      setActiveTab: (id: string) => set({ activeTabId: id }),

      toggleWidget: (tabId, widgetId) => set((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          tabs: {
            ...state.tabs,
            [tabId]: {
              ...tab,
              widgets: tab.widgets.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
            }
          }
        };
      }),

      updateWidgetSize: (tabId, widgetId, size) => set((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          tabs: {
            ...state.tabs,
            [tabId]: {
              ...tab,
              widgets: tab.widgets.map(w => w.id === widgetId ? { ...w, size } : w)
            }
          }
        };
      }),

      reorderWidgets: (tabId, widgetIds) => set((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          tabs: {
            ...state.tabs,
            [tabId]: {
              ...tab,
              widgets: [...tab.widgets].sort((a, b) => widgetIds.indexOf(a.id) - widgetIds.indexOf(b.id))
            }
          }
        };
      }),

      renameWidget: (tabId, widgetId, newLabel) => set((state) => {
        const tab = state.tabs[tabId];
        if (!tab) return state;
        return {
          tabs: {
            ...state.tabs,
            [tabId]: {
              ...tab,
              widgets: tab.widgets.map(w => w.id === widgetId ? { ...w, label: newLabel } : w)
            }
          }
        };
      }),

    }),
    {
      name: 'command-os-widgets-v2', // Bumped version to force clean hydration
      storage: createJSONStorage(() => localStorage),
    }
  )
);
