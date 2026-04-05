import { lazy, LazyExoticComponent } from 'react';

// Selective Lazy Loading for Tactical Widgets
const WarRoom = lazy(() => import('../features/war-room/WarRoom').then(m => ({ default: m.WarRoom })));
const HabitMatrix = lazy(() => import('../features/habits/HabitMatrix').then(m => ({ default: m.HabitMatrix })));
const MarketCommand = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.MarketCommand })));
const PhysicalOps = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.PhysicalOps })));
const LanguageLab = lazy(() => import('../features/english/LanguageLab').then(m => ({ default: m.LanguageLab })));

// Tactical Market Widgets
const MarketChart = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.MarketChartWidget })));
const TacticalWatchlist = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.TacticalWatchlistWidget })));
const RiskPanel = lazy(() => import('../features/trading/MarketCommand').then(m => ({ default: m.RiskPanelWidget })));

// Tactical Physical Widgets
const DailyProtocol = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.PhysicalOpsWidget })));
const WeeklySplit = lazy(() => import('../features/workout/PhysicalOps').then(m => ({ default: m.WeeklySplitWidget })));

// Tactical English Widgets
const WordOfDay = lazy(() => import('../features/english/LanguageLab').then(m => ({ default: m.WordOfDayWidget })));
const SentenceOfDay = lazy(() => import('../features/english/LanguageLab').then(m => ({ default: m.SentenceOfDayWidget })));

// Placeholder Protocol (Ensure Type Safety)
const Placeholder = lazy(() => Promise.resolve({ default: () => null }));

export const WIDGET_REGISTRY: Record<string, LazyExoticComponent<any>> = {
  'brief': WarRoom,
  'priorities': HabitMatrix,
  'habits': HabitMatrix,
  'trading': MarketCommand,
  'english': LanguageLab,
  'stats': Placeholder,
  
  // Market Tactical Widgets
  'chart': MarketChart,
  'watchlist': TacticalWatchlist,
  'pnl': Placeholder, 
  'risk': RiskPanel,

  // Physical Operational Widgets
  'workout': PhysicalOps,
  'workout_plan': DailyProtocol,
  'streak': Placeholder,
  'split': WeeklySplit,

  // English Lexicon Widgets
  'lexicon_word': WordOfDay,
  'lexicon_sentence': SentenceOfDay,

  // Future System Protocols
  'check': Placeholder,
  'timer': Placeholder,
  'journal': Placeholder,
  'goals': Placeholder,
  'config': Placeholder,
};
