import { useState } from 'react';
import { TOPICS } from './data/topicsIndex';
import { useProgressStore } from './hooks/useProgressStore';
import { LearningWorkspace, type StudyTab } from './components/LearningWorkspace';
import { DirectoryView } from './components/DirectoryView';
import { RevisionDeckView } from './components/RevisionDeckView';
import { AiTutorialView } from './components/AiTutorialView';
import { ProjectsView } from './components/ProjectsView';
import { InterviewPrepView } from './components/InterviewPrepView';
import { MernBridgeView } from './components/MernBridgeView';
import { MasteryDashboardView } from './components/MasteryDashboardView';

type ActiveView = 'learn' | 'roadmap' | 'projects' | 'interview' | 'mern-ai';
type RoadmapSubView = 'mastery' | 'directory' | 'revise';
type MernAiSubView = 'mern' | 'ai';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('learn');
  const [roadmapSubView, setRoadmapSubView] = useState<RoadmapSubView>('mastery');
  const [mernAiSubView, setMernAiSubView] = useState<MernAiSubView>('mern');
  const [activeTopicId, setActiveTopicId] = useState<string>(TOPICS[0].id);
  const [requestedTab, setRequestedTab] = useState<StudyTab | undefined>(undefined);
  const [requestedTabNonce, setRequestedTabNonce] = useState(0);

  const {
    user,
    authLoading,
    authError,
    progressMap,
    masteryMap,
    projectProgressMap,
    interviewHistory,
    upsertChallengeProgress,
    recordPracticeRun,
    recordQuizPerformance,
    recordCodingChallengeResult,
    recordRichQuizAnswer,
    recordSpacedReview,
    saveProjectProgress,
    recordMockInterview,
    handleSignIn,
    handleSignOut,
  } = useProgressStore();

  const handleOpenTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setRequestedTab('learn');
    setRequestedTabNonce((n) => n + 1);
    setActiveView('learn');
  };

  const handleOpenTopicTab = (topicId: string, tab: StudyTab) => {
    setActiveTopicId(topicId);
    setRequestedTab(tab);
    setRequestedTabNonce((n) => n + 1);
    setActiveView('learn');
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Account';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Single-line brand, 5 concise top-level nav links, 1 primary account CTA */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <a
            href="#learn"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('learn');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            CodeFix Lab
          </a>

          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-6 overflow-x-auto text-sm font-medium text-slate-600"
          >
            {(
              [
                ['learn', 'Learn'],
                ['roadmap', 'Roadmap'],
                ['projects', 'Projects'],
                ['interview', 'Interview'],
                ['mern-ai', 'MERN & AI'],
              ] as Array<[ActiveView, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                  activeView === id
                    ? 'text-slate-900 border-sky-700 font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign Out ({firstName})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={authLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Connecting...' : 'Sign In to Sync'}
              </button>
            )}
          </div>
        </div>
      </header>

      {authError && (
        <div
          role="alert"
          className="bg-red-50 border-b border-red-200 text-red-900 text-xs px-6 py-2.5 text-center"
        >
          Sign-in notice: {authError} (Your progress is still saved locally in this browser.)
        </div>
      )}

      <div className="flex-1">
        {activeView === 'learn' && (
          <LearningWorkspace
            activeTopicId={activeTopicId}
            requestedTab={requestedTab}
            requestedTabNonce={requestedTabNonce}
            onSelectTopic={setActiveTopicId}
            progressMap={progressMap}
            masteryMap={masteryMap}
            onSaveProgress={upsertChallengeProgress}
            onRecordPracticeRun={recordPracticeRun}
            onRecordQuizPerformance={recordQuizPerformance}
            onRecordCodingResult={recordCodingChallengeResult}
            onRecordRichQuizAnswer={recordRichQuizAnswer}
          />
        )}

        {activeView === 'roadmap' && (
          <div>
            <div className="bg-white border-b border-slate-200">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-2">
                {(
                  [
                    ['mastery', 'Mastery & Spaced Revision'],
                    ['directory', 'Topic Directory'],
                    ['revise', 'Quick Revise Deck'],
                  ] as Array<[RoadmapSubView, string]>
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRoadmapSubView(id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      roadmapSubView === id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {roadmapSubView === 'mastery' && (
              <MasteryDashboardView
                progressMap={progressMap}
                masteryMap={masteryMap}
                onOpenTopicTab={handleOpenTopicTab}
                onRecordSpacedReview={recordSpacedReview}
                onRecordRichQuizAnswer={recordRichQuizAnswer}
              />
            )}
            {roadmapSubView === 'directory' && (
              <DirectoryView
                progressMap={progressMap}
                masteryMap={masteryMap}
                onOpenTopic={handleOpenTopic}
              />
            )}
            {roadmapSubView === 'revise' && (
              <RevisionDeckView
                progressMap={progressMap}
                masteryMap={masteryMap}
                onOpenTopic={handleOpenTopic}
              />
            )}
          </div>
        )}

        {activeView === 'projects' && (
          <ProjectsView
            progressMap={progressMap}
            masteryMap={masteryMap}
            projectProgressMap={projectProgressMap}
            onSaveProjectProgress={saveProjectProgress}
            onOpenTopic={handleOpenTopic}
          />
        )}

        {activeView === 'interview' && (
          <InterviewPrepView
            interviewHistory={interviewHistory}
            onRecordMockInterview={recordMockInterview}
            onRecordRichQuizAnswer={recordRichQuizAnswer}
            onOpenTopic={handleOpenTopic}
          />
        )}

        {activeView === 'mern-ai' && (
          <div>
            <div className="bg-white border-b border-slate-200">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMernAiSubView('mern')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    mernAiSubView === 'mern'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  JS to MERN Bridge
                </button>
                <button
                  type="button"
                  onClick={() => setMernAiSubView('ai')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    mernAiSubView === 'ai'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  AI + Full Stack Tutorial
                </button>
              </div>
            </div>

            {mernAiSubView === 'mern' ? (
              <MernBridgeView
                onOpenTopic={handleOpenTopic}
                onRecordRichQuizAnswer={recordRichQuizAnswer}
              />
            ) : (
              <AiTutorialView
                progressMap={progressMap}
                onSaveProgress={upsertChallengeProgress}
              />
            )}
          </div>
        )}
      </div>

      {import.meta.env.DEV && (
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>Workspace Export</span>
            <a
              href="/download-source.zip"
              download="codefix-lab-js-app.zip"
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Download Full Project (.zip)
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
