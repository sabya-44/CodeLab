import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, CircleDot, Search } from 'lucide-react';
import { CATEGORIES, TOPICS, TOPICS_BY_ID } from '../data/topicsIndex';
import { topicHasVisualizer } from '../data/visualizersIndex';
import type {
  DifficultyTier,
  TopicMasteryRecord,
  TopicProgressRecord,
  TopicTrack,
} from '../types/topic';

interface DirectoryViewProps {
  progressMap: Record<string, TopicProgressRecord>;
  masteryMap: Record<string, TopicMasteryRecord>;
  onOpenTopic: (topicId: string) => void;
}

type TierFilter = 'All' | DifficultyTier;
type TrackFilter = 'All' | TopicTrack;

export function DirectoryView({ progressMap, masteryMap, onOpenTopic }: DirectoryViewProps) {
  const [tierFilter, setTierFilter] = useState<TierFilter>('All');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('All');
  const [search, setSearch] = useState('');

  const isTopicMastered = (topicId: string) =>
    masteryMap[topicId]?.state === 'mastered' || progressMap[topicId]?.status === 'solved';

  const isTopicInProgress = (topicId: string) =>
    masteryMap[topicId]?.state === 'in_progress' || progressMap[topicId]?.status === 'attempted';

  const stats = useMemo(() => {
    const counts = {
      total: TOPICS.length,
      mastered: 0,
      essentialTotal: 0,
      essentialMastered: 0,
      Basic: { total: 0, mastered: 0 },
      Intermediate: { total: 0, mastered: 0 },
      Advanced: { total: 0, mastered: 0 },
    };

    TOPICS.forEach((t) => {
      counts[t.tier].total += 1;
      const isEssential = (t.track ?? 'Essential') === 'Essential';
      if (isEssential) counts.essentialTotal += 1;
      if (masteryMap[t.id]?.state === 'mastered' || progressMap[t.id]?.status === 'solved') {
        counts.mastered += 1;
        counts[t.tier].mastered += 1;
        if (isEssential) counts.essentialMastered += 1;
      }
    });

    return counts;
  }, [masteryMap, progressMap]);

  const query = search.trim().toLowerCase();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header & Mastery Summary */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-sky-800">
              Complete JavaScript Web Development Classification
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Topic Directory (Basic to Advanced)
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Every JavaScript concept organized into 8 progressive categories with prerequisites
              and Essential vs Deep-dive paths. Start with Essential topics if you are new.
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-display font-bold text-slate-900 tabular-nums">
              {stats.mastered} / {stats.total}
            </div>
            <div className="text-xs text-slate-500 tabular-nums">
              Topics Mastered · Essential {stats.essentialMastered}/{stats.essentialTotal}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {(['Basic', 'Intermediate', 'Advanced'] as DifficultyTier[]).map((tier) => (
            <div
              key={tier}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800">{tier} Track</div>
                <div className="text-[11px] text-slate-500">
                  {tier === 'Basic'
                    ? 'Syntax, types, loops & debugging'
                    : tier === 'Intermediate'
                    ? 'Methods, closures, recursion, DOM & testing'
                    : 'Async, modules, perf & security'}
                </div>
              </div>
              <div className="text-sm font-bold text-sky-800 tabular-nums">
                {stats[tier].mastered}/{stats[tier].total}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts (e.g., recursion, debugging, Vitest, closure)..."
              aria-label="Search topic directory"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5" role="group" aria-label="Filter by learning track">
              {(['All', 'Essential', 'Deep-dive'] as TrackFilter[]).map((track) => (
                <button
                  key={track}
                  type="button"
                  onClick={() => setTrackFilter(track)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    trackFilter === track
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {track === 'All' ? 'All Paths' : track}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5" role="group" aria-label="Filter by difficulty tier">
              {(['All', 'Basic', 'Intermediate', 'Advanced'] as TierFilter[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tierFilter === tier
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8 Classified Category Sections */}
      <div className="space-y-8">
        {CATEGORIES.map((category) => {
          const catTopics = TOPICS.filter((t) => {
            if (t.categoryId !== category.id) return false;
            const matchesTier = tierFilter === 'All' || t.tier === tierFilter;
            const matchesTrack =
              trackFilter === 'All' || (t.track ?? 'Essential') === trackFilter;
            const matchesQuery =
              !query ||
              t.title.toLowerCase().includes(query) ||
              t.summary.toLowerCase().includes(query) ||
              t.webDevUseCase.toLowerCase().includes(query);
            return matchesTier && matchesTrack && matchesQuery;
          });

          if (catTopics.length === 0) return null;

          const catMastered = catTopics.filter((t) => isTopicMastered(t.id)).length;

          return (
            <section key={category.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-sky-800">{category.tierRange}</div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    {category.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl">{category.description}</p>
                </div>
                <div className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                  {catMastered} / {catTopics.length} mastered
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catTopics.map((topic) => {
                  const solved = isTopicMastered(topic.id);
                  const attempted = !solved && isTopicInProgress(topic.id);
                  const prereqs = topic.prerequisites ?? [];
                  const unmetPrereqs = prereqs.filter((pid) => !isTopicMastered(pid));

                  return (
                    <article
                      key={topic.id}
                      className="bg-white border border-slate-200 hover:border-sky-400 rounded-xl p-4 flex flex-col justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-500 tabular-nums">
                            #{String(topic.number).padStart(2, '0')} · {topic.tier} ·{' '}
                            <span
                              className={
                                topic.track === 'Deep-dive' ? 'text-amber-800' : 'text-sky-800'
                              }
                            >
                              {topic.track ?? 'Essential'}
                            </span>
                            {topicHasVisualizer(topic.id) && (
                              <span className="text-slate-600"> · Visualizer</span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 font-medium shrink-0">
                            {solved ? (
                              <>
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span className="text-emerald-700">Mastered</span>
                              </>
                            ) : attempted ? (
                              <>
                                <CircleDot size={14} className="text-sky-600" />
                                <span className="text-sky-700">In Progress</span>
                              </>
                            ) : (
                              <>
                                <Circle size={14} className="text-slate-300" />
                                <span className="text-slate-400">Not Started</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                          {topic.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed">{topic.summary}</p>

                        {prereqs.length > 0 && (
                          <div className="text-[11px] text-slate-500 pt-1">
                            <span className="font-semibold text-slate-700">Prerequisites: </span>
                            {prereqs
                              .map((pid) => {
                                const pt = TOPICS_BY_ID[pid];
                                return pt ? `#${String(pt.number).padStart(2, '0')}` : pid;
                              })
                              .join(', ')}
                            {unmetPrereqs.length === 0
                              ? ' · Ready'
                              : ` · ${unmetPrereqs.length} recommended first`}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 truncate">
                          {topic.webDevUseCase}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenTopic(topic.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-sky-800 hover:text-white bg-sky-50 hover:bg-sky-700 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          Learn
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

