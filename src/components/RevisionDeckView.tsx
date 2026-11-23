import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { CATEGORIES, TOPICS } from '../data/topicsIndex';
import type {
  CategoryId,
  DifficultyTier,
  TopicMasteryRecord,
  TopicProgressRecord,
  TopicTrack,
} from '../types/topic';

interface RevisionDeckViewProps {
  progressMap: Record<string, TopicProgressRecord>;
  masteryMap: Record<string, TopicMasteryRecord>;
  onOpenTopic: (topicId: string) => void;
}

type CategoryFilter = 'all' | CategoryId;
type TierFilter = 'All' | DifficultyTier;
type TrackFilter = 'All' | TopicTrack;
type StatusFilter = 'all' | 'review' | 'mastered';

export function RevisionDeckView({
  progressMap,
  masteryMap,
  onOpenTopic,
}: RevisionDeckViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('All');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const isTopicMastered = (topicId: string) =>
    masteryMap[topicId]?.state === 'mastered' || progressMap[topicId]?.status === 'solved';

  const visibleTopics = useMemo(() => {
    return TOPICS.filter((t) => {
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;
      if (tierFilter !== 'All' && t.tier !== tierFilter) return false;
      if (trackFilter !== 'All' && (t.track ?? 'Essential') !== trackFilter) return false;
      const isMastered =
        masteryMap[t.id]?.state === 'mastered' || progressMap[t.id]?.status === 'solved';
      if (statusFilter === 'mastered' && !isMastered) return false;
      if (statusFilter === 'review' && isMastered) return false;
      return true;
    });
  }, [categoryFilter, masteryMap, progressMap, statusFilter, tierFilter, trackFilter]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAll = () => {
    const next: Record<string, boolean> = {};
    visibleTopics.forEach((t) => {
      next[t.id] = true;
    });
    setRevealedIds(next);
  };

  const collapseAll = () => {
    setRevealedIds({});
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-sky-800">
              Rapid Recall & Cheat-Sheet Deck
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Quick Revise JavaScript Concepts
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Review TL;DR rules, common mistakes, and your personal notes across all {TOPICS.length}{' '}
              topics. Keep syntax snippets hidden while quizzing yourself, then open Practice to
              verify mastery.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={revealAll}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Eye size={13} />
              Reveal All Code
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw size={13} />
              Hide All
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            aria-label="Filter revision deck by category"
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-600"
          >
            <option value="all">All 8 Categories ({TOPICS.length} Topics)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1" role="group" aria-label="Filter by learning path">
            {(['All', 'Essential', 'Deep-dive'] as TrackFilter[]).map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => setTrackFilter(track)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap cursor-pointer ${
                  trackFilter === track
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {track === 'All' ? 'All Paths' : track}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1" role="group" aria-label="Filter by tier">
            {(['All', 'Basic', 'Intermediate', 'Advanced'] as TierFilter[]).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap cursor-pointer ${
                  tierFilter === tier
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1" role="group" aria-label="Filter by mastery status">
            {(
              [
                { id: 'all', label: 'All Topics' },
                { id: 'review', label: 'Needs Review' },
                { id: 'mastered', label: 'Mastered Only' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap cursor-pointer ${
                  statusFilter === opt.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs font-medium text-slate-500 tabular-nums">
            Showing {visibleTopics.length} card{visibleTopics.length === 1 ? '' : 's'}
          </span>
        </div>
      </section>

      {visibleTopics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-600">
          No topics match your current filter combination.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visibleTopics.map((topic) => {
            const rec = progressMap[topic.id];
            const isMastered = isTopicMastered(topic.id);
            const isRevealed = Boolean(revealedIds[topic.id]);

            return (
              <article
                key={topic.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-sky-800">
                      #{String(topic.number).padStart(2, '0')} · {topic.tier} ·{' '}
                      {topic.track ?? 'Essential'}
                    </span>
                    {isMastered && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={14} />
                        Mastered
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                    {topic.title}
                  </h2>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Lightbulb size={15} className="text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-950 leading-relaxed">
                      {topic.revisionTldr}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-rose-800">Watch Out: </span>
                    {topic.commonMistake.label}
                  </div>

                  {rec?.studyNote && (
                    <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg text-xs text-sky-950 leading-relaxed">
                      <span className="font-bold mr-1">Your Note:</span>
                      {rec.studyNote}
                    </div>
                  )}

                  {isRevealed && (
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <div className="px-3 py-1.5 bg-slate-900 text-[11px] font-semibold text-emerald-300">
                        Prefer This Pattern
                      </div>
                      <pre className="p-3 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                        <code>{topic.commonMistake.prefer}</code>
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReveal(topic.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                    {isRevealed ? 'Hide Code' : 'Reveal Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenTopic(topic.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    Practice & Quiz
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

