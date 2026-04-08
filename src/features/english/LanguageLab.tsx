import { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  BookmarkPlus,
  CheckCircle2,
  Languages,
  Quote,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../utils/cn';

const LEXICON_POOL = [
  {
    word: 'Pragmatic',
    phonetic: 'prag-MAT-ik',
    meaning: 'Dealing with things sensibly and realistically rather than theoretically.',
    sentence: 'We need a pragmatic approach to solve the architectural bottlenecks.',
  },
  {
    word: 'Resilient',
    phonetic: 'ri-ZIL-yent',
    meaning: 'Able to withstand or recover quickly from difficult conditions.',
    sentence: 'The system architecture is highly resilient to external disruptions.',
  },
  {
    word: 'Paradigm',
    phonetic: 'PAR-uh-dime',
    meaning: 'A typical example or model that shapes the way something is understood.',
    sentence: 'This refactor represents a complete paradigm shift in our operational strategy.',
  },
  {
    word: 'Ubiquitous',
    phonetic: 'yoo-BIK-wi-tus',
    meaning: 'Present or found everywhere.',
    sentence: 'Standardization has become ubiquitous across all tactical modules.',
  },
];

function WordOfTheDay() {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const item = LEXICON_POOL[index];

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const nextWord = () => {
    setIndex((current) => (current + 1) % LEXICON_POOL.length);
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="section-eyebrow">Word of the Day</p>
          <h2 className="mt-3 break-words text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">{item.word}</h2>
          <p className="mt-2 text-sm font-medium italic text-slate-400">{item.phonetic}</p>
        </div>

        <div className="flex gap-2 sm:shrink-0">
          <button type="button" onClick={speak} className="soft-action px-3 py-3">
            <Volume2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setSaved((value) => !value)}
            className={cn(
              'inline-flex items-center justify-center rounded-2xl border px-3 py-3 transition-colors',
              saved
                ? 'border-[rgba(240,90,61,0.18)] bg-[rgba(240,90,61,0.12)] text-white'
                : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]',
            )}
          >
            {saved ? <Bookmark size={16} /> : <BookmarkPlus size={16} />}
          </button>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
        <p className="text-sm leading-relaxed text-slate-300">{item.meaning}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Saved status: {saved ? 'tracked' : 'not saved'}
        </div>
        <button type="button" onClick={nextWord} className="soft-action">
          <RotateCcw size={14} />
          Next Word
        </button>
      </div>
    </div>
  );
}

function SentenceOfTheDay() {
  const item = LEXICON_POOL[0];

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-start gap-3">
        <Quote size={20} className="mt-1 text-[var(--shell-brand)]" />
        <div>
          <p className="text-base font-semibold leading-relaxed text-white">"{item.sentence}"</p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Operational context</p>
        </div>
      </div>
    </div>
  );
}

export function LanguageLab() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Language Lab"
        title="Make vocabulary practice feel useful and repeatable"
        description="This page should support steady language reps, not distract from them. Keep one strong word, one practical sentence, and a short review path you can actually maintain."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Word Bank"
          value={LEXICON_POOL.length}
          description="Seed vocabulary entries in the current local pool."
          icon={Languages}
          tone="brand"
        />
        <MetricCard
          label="Mastery"
          value="84%"
          description="Estimated familiarity with the current study pool."
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Review Mode"
          value="Daily"
          description="Short daily reps beat long inconsistent sessions."
          icon={BookOpen}
          tone="neutral"
        />
        <MetricCard
          label="Focus"
          value="Clarity"
          description="Choose words you can use inside real work and conversation."
          icon={Quote}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <GlassCard className="p-6">
          <WordOfTheDay />
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Usage</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Put the word in context</h2>
              </div>
              <BookOpen size={18} className="text-[var(--shell-brand)]" />
            </div>

            <div className="mt-6">
              <SentenceOfTheDay />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Practice Flow</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Three quick reps</h2>
              </div>
              <Languages size={18} className="text-[var(--shell-brand)]" />
            </div>

            <div className="mt-6 space-y-3">
              {[
                'Say the word aloud three times.',
                'Write one sentence you would genuinely use.',
                'Return later and test recall without looking.',
              ].map((step) => (
                <div key={step} className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                  {step}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export const WordOfDayWidget = WordOfTheDay;
export const SentenceOfDayWidget = SentenceOfTheDay;
