import { useState } from 'react';
import {
  Volume2, BookOpen, Quote,
  RotateCcw, Sparkles, Languages,
  CheckCircle2, Bookmark, BookmarkPlus,
  Play
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { cn } from '../../utils/cn';

const LEXICON_POOL = [
  { word: 'Pragmatic', phonetic: 'prag-MAT-ik', meaning: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', sentence: 'We need a pragmatic approach to solve the architectural bottlenecks.' },
  { word: 'Resilient', phonetic: 'ri-ZIL-yent', meaning: 'Able to withstand or recover quickly from difficult conditions.', sentence: 'The system architecture is highly resilient to external disruptions.' },
  { word: 'Paradigm', phonetic: 'PAR-uh-dime', meaning: 'A typical example or pattern of something; a model.', sentence: 'This refactor represents a complete paradigm shift in our operational strategy.' },
  { word: 'Ubiquitous', phonetic: 'yoo-BIK-wi-tus', meaning: 'Present, appearing, or found everywhere.', sentence: 'Standardization has become ubiquitous across all tactical modules.' },
];

function WordOfTheDay() {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const item = LEXICON_POOL[index];

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const nextWord = () => {
    setIndex((i) => (i + 1) % LEXICON_POOL.length);
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.4em]">Lexicon Intelligence</p>
          <h2 className="break-words text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl">{item.word}</h2>
          <p className="text-xs font-bold text-fuchsia-400/60 lowercase italic">{item.phonetic}</p>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <button onClick={speak} className="p-3 bg-fuchsia-600/10 border border-fuchsia-600/20 rounded-xl text-fuchsia-500 hover:bg-fuchsia-600/20 transition-all">
            <Volume2 size={18} />
          </button>
          <button onClick={() => setSaved(!saved)} className={cn("p-3 border rounded-xl transition-all", saved ? "bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]" : "bg-white/5 border-white/5 text-slate-500 hover:text-fuchsia-400")}>
            {saved ? <Bookmark size={18} /> : <BookmarkPlus size={18} />}
          </button>
        </div>
      </div>

      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {item.meaning}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-fuchsia-600 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Word Rank: Elite</span>
        </div>
        <button onClick={nextWord} className="flex items-center gap-2 text-[9px] font-black text-fuchsia-500 uppercase tracking-widest hover:text-fuchsia-400 transition-colors">
          Next Protocol <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}

function SentenceOfTheDay() {
  const item = LEXICON_POOL[0];
  return (
    <div className="relative group">
      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-fuchsia-600/30 rounded-full" />
      <Quote size={32} className="text-fuchsia-600/20 absolute -right-2 -top-2" />
      <p className="mb-4 text-base font-black italic leading-tight tracking-tight text-white sm:text-lg">
        "{item.sentence}"
      </p>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/5" />
        <p className="text-[8px] font-black text-fuchsia-500/60 uppercase tracking-[0.3em]">Operational Context</p>
      </div>
    </div>
  );
}

export function LanguageLab() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <GlassCard className="col-span-3 border-fuchsia-900/20 bg-black/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-fuchsia-600/10 border border-fuchsia-600/20 rounded-xl">
                <Languages size={20} className="text-fuchsia-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">LEXICON INTELLIGENCE</h2>
                <p className="text-[8px] text-fuchsia-500 font-black uppercase tracking-[0.4em] mt-1">Uplink Active: Oxford Core 3000</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Mastery Level: 84%</span>
            </div>
          </div>

          <WordOfTheDay />
        </GlassCard>

        <div className="space-y-8">
          <GlassCard className="border-white/5 bg-black/40">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 flex items-center gap-2">
              <BookOpen size={12} /> Strategic Use-Case
            </h3>
            <SentenceOfTheDay />
          </GlassCard>

          <GlassCard className="border-fuchsia-500/20 bg-fuchsia-950/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500">Phonetic Mastery</h3>
              <Sparkles size={16} className="text-fuchsia-400" />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-6">
              Active practice of <span className="text-white font-black">Phonetic Rhythm</span> and <span className="text-white font-black">Shadowing</span> is required to achieve native-adjacent fluency.
            </p>
            <button className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(192,38,211,0.3)] flex items-center justify-center gap-3">
              <Play size={14} /> Start Shadowing session
            </button>
          </GlassCard>

          <div className="p-8 border border-white/5 rounded-[2.5rem] bg-white/[0.01] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <RotateCcw size={18} className="text-slate-600" />
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Last Sync: 14m ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const WordOfDayWidget = WordOfTheDay;
export const SentenceOfDayWidget = SentenceOfTheDay;
