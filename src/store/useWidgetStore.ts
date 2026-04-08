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

function normalizeTabs(tabs?: Record<string, TabConfig>) {
  const mergeTab = (defaultTab: TabConfig, persistedTab?: TabConfig): TabConfig => {
    if (!persistedTab) {
      return defaultTab;
    }

    const persistedWidgets = new Map(persistedTab.widgets.map((widget) => [widget.id, widget]));

    return {
      ...defaultTab,
      widgets: defaultTab.widgets.map((defaultWidget) => {
        const persistedWidget = persistedWidgets.get(defaultWidget.id);

        return persistedWidget
          ? {
              ...defaultWidget,
              visible: persistedWidget.visible,
              size: persistedWidget.size,
              order: persistedWidget.order,
              label: persistedWidget.label,
            }
          : defaultWidget;
      }),
    };
  };

  return {
    ...DEFAULT_TABS,
    ...tabs,
    command: mergeTab(DEFAULT_TABS.command, tabs?.command),
    habits: mergeTab(DEFAULT_TABS.habits, tabs?.habits),
    focus: mergeTab(DEFAULT_TABS.focus, tabs?.focus),
    goals: mergeTab(DEFAULT_TABS.goals, tabs?.goals),
  };
}

const DEFAULT_TABS: Record<string, TabConfig> = {
  'command': {
    id: 'command',
    label: 'Command Center',
    widgets: [
      { id: 'brief', type: 'brief', label: 'Mission Brief', visible: true, size: 'md', order: 0 },
      { id: 'priorities', type: 'priorities', label: 'Today Habits', visible: true, size: 'md', order: 1 },
      { id: 'habits_summary', type: 'habit_summary', label: 'Habits Summary', visible: true, size: 'sm', order: 2 },
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
      { id: 'checklist', type: 'habits', label: 'Habit Tracker', visible: true, size: 'full', order: 0 },
    ]
  },
  'focus': {
    id: 'focus',
    label: 'Deep Work',
    widgets: [
      { id: 'focus_workspace', type: 'focus', label: 'Focus Workflow', visible: true, size: 'full', order: 0 },
    ]
  },
  'goals': {
    id: 'goals',
    label: 'Mission Planning',
    widgets: [
      { id: 'goal_manager', type: 'goals', label: 'Goals Command', visible: true, size: 'full', order: 0 },
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
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<WidgetState> | undefined;

        return {
          ...currentState,
          ...typedPersistedState,
          tabs: normalizeTabs(typedPersistedState?.tabs),
        };
      },
    }
  )
);
