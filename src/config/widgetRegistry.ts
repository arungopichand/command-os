import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

// Selective Lazy Loading for Tactical Widgets
const CommandBriefWidget = lazy(() => import('../features/war-room/WarRoom').then(m => ({ default: m.CommandBriefWidget })));
const Habits = lazy(() => import('../features/habits/Habits').then(m => ({ default: m.Habits })));
const HabitSummaryWidget = lazy(() => import('../features/habits/HabitWidgets').then(m => ({ default: m.HabitSummaryWidget })));
const HabitPrioritiesWidget = lazy(() => import('../features/habits/HabitWidgets').then(m => ({ default: m.HabitPrioritiesWidget })));
const MarketCommand = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.MarketCommand })));
const PhysicalOps = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.PhysicalOps })));
const LanguageLab = lazy(() => import('../features/english/LanguageLab').then(m => ({ default: m.LanguageLab })));
const Goals = lazy(() => import('../features/goals/Goals').then(m => ({ default: m.Goals })));
const Focus = lazy(() => import('../features/focus/Focus').then(m => ({ default: m.Focus })));
const DailyReview = lazy(() => import('../features/daily-review/DailyReview').then(m => ({ default: m.DailyReview })));

// Tactical Market Widgets
const MarketChart = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.MarketChartWidget })));
const TacticalWatchlist = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.TacticalWatchlistWidget })));
const RiskPanel = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.RiskPanelWidget })));

// Tactical Physical Widgets
const DailyProtocol = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.PhysicalOpsWidget })));
const WeeklySplit = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.WeeklySplitWidget })));
const QuickWorkout = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.QuickWorkoutWidget })));

// Tactical English Widgets
const WordOfDay = lazy(() => import('../features/english/LanguageLab').then(m => ({ default: m.WordOfDayWidget })));
const SentenceOfDay = lazy(() => import('../features/english/LanguageLab').then(m => ({ default: m.SentenceOfDayWidget })));

// Dashboard Widgets
const StatsWidget = lazy(() => import('../features/dashboard-widgets').then(m => ({ default: m.StatsWidget })));
const PnlWidget = lazy(() => import('../features/dashboard-widgets').then(m => ({ default: m.PnlWidget })));
const StreakWidget = lazy(() => import('../features/dashboard-widgets').then(m => ({ default: m.StreakWidget })));
const ChecklistWidget = lazy(() => import('../features/dashboard-widgets').then(m => ({ default: m.ChecklistWidget })));
const ConfigWidget = lazy(() => import('../features/dashboard-widgets').then(m => ({ default: m.ConfigWidget })));

export const WIDGET_REGISTRY: Record<string, LazyExoticComponent<ComponentType>> = {
  'brief': CommandBriefWidget,
  'priorities': HabitPrioritiesWidget,
  'habits': Habits,
  'habit_summary': HabitSummaryWidget,
  'focus': Focus,
  'trading': MarketCommand,
  'english': LanguageLab,
  'stats': StatsWidget,
  
  // Market Tactical Widgets
  'chart': MarketChart,
  'watchlist': TacticalWatchlist,
  'pnl': PnlWidget,
  'risk': RiskPanel,

  // Physical Operational Widgets
  'workout': PhysicalOps,
  'workout_plan': DailyProtocol,
  'streak': StreakWidget,
  'split': WeeklySplit,
  'quick_workout': QuickWorkout,

  // English Lexicon Widgets
  'lexicon_word': WordOfDay,
  'lexicon_sentence': SentenceOfDay,

  // Future System Protocols
  'check': ChecklistWidget,
  'journal': DailyReview,
  'goals': Goals,
  'config': ConfigWidget,
};
