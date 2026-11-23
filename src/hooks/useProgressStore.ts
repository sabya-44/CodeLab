import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutUser,
} from '../lib/firebase';
import type {
  MasteryDimensions,
  MockInterviewResult,
  ProgressStoreV2,
  ProjectProgressRecord,
  TopicMasteryRecord,
  TopicProgressRecord,
} from '../types/topic';
import {
  advanceSpacedRevision,
  createInitialSpacedRevision,
} from '../lib/spacedRevision';

const LOCAL_STORAGE_V1_KEY = 'js_mastery_atlas_v1';
const LOCAL_STORAGE_V2_KEY = 'js_mastery_atlas_v2';

function emptyDimensions(base = 0): MasteryDimensions {
  return {
    conceptUnderstanding: base,
    codingAbility: base,
    problemSolving: base,
    debugging: base,
    quizPerformance: base,
    practicalApplication: base,
  };
}

function createMasteryFromLegacy(
  topicId: string,
  legacy?: TopicProgressRecord
): TopicMasteryRecord {
  const isSolved = legacy?.status === 'solved';
  const now = new Date().toISOString();
  return {
    topicId,
    schemaVersion: 2,
    legacySolved: isSolved || undefined,
    state: isSolved ? 'mastered' : legacy ? 'in_progress' : 'not_started',
    overallScore: isSolved ? 100 : legacy && legacy.attempts > 0 ? 35 : 0,
    dimensions: emptyDimensions(isSolved ? 100 : 0),
    practicedModes: legacy && legacy.attempts > 0 ? ['logical'] : [],
    solvedPracticeIds: [],
    solvedDebugIds: [],
    updatedAt: legacy?.updatedAt ?? now,
  };
}

function computeMasteryMetrics(record: TopicMasteryRecord): TopicMasteryRecord {
  const coreQuizPct = record.quizState?.bestScorePct ?? 0;
  const richEntries = Object.values(record.richQuizAnswered ?? {});
  const richCorrect = richEntries.filter(Boolean).length;
  const richPct =
    richEntries.length >= 3 ? Math.round((richCorrect / richEntries.length) * 100) : 0;
  const effectiveQuizPct = Math.max(coreQuizPct, richPct);

  const practicedLogical = record.practicedModes.includes('logical');
  const practicedRealLife = record.practicedModes.includes('realLife');
  const practicedCount = record.practicedModes.length;
  const codingSolvedCount = record.solvedPracticeIds.length;
  const debugSolvedCount = record.solvedDebugIds.length;

  const codingScore =
    codingSolvedCount >= 2
      ? 100
      : codingSolvedCount === 1
      ? 85
      : practicedCount >= 2
      ? 75
      : practicedCount === 1
      ? 55
      : 0;

  const debuggingScore =
    debugSolvedCount >= 2 ? 100 : debugSolvedCount === 1 ? 85 : record.dimensions.debugging;

  const problemSolvingScore = Math.max(
    record.dimensions.problemSolving,
    codingSolvedCount >= 1 ? 90 : practicedLogical ? 75 : 0
  );

  const practicalScore = Math.max(
    record.dimensions.practicalApplication,
    practicedRealLife ? 85 : codingSolvedCount >= 1 ? 75 : 0
  );

  const nextDimensions: MasteryDimensions = {
    conceptUnderstanding: Math.max(record.dimensions.conceptUnderstanding, effectiveQuizPct),
    quizPerformance: Math.max(record.dimensions.quizPerformance, effectiveQuizPct),
    codingAbility: Math.max(record.dimensions.codingAbility, codingScore),
    problemSolving: problemSolvingScore,
    practicalApplication: practicalScore,
    debugging: debuggingScore,
  };

  // Performance mastery rule (never earned by merely opening a topic):
  // Earned via strong quiz accuracy (>= 80% on rich bank or 100% on core check)
  // AND completing coding/debugging tests or interactive practice.
  const passedCodingOrPractice =
    codingSolvedCount >= 1 || debugSolvedCount >= 1 || practicedCount >= 1;
  const meetsPerformanceBar =
    (coreQuizPct >= 100 || (richEntries.length >= 3 && richPct >= 80)) &&
    passedCodingOrPractice;
  const isMastered = Boolean(record.legacySolved) || meetsPerformanceBar;

  const activeAvg = Math.round(
    (nextDimensions.conceptUnderstanding +
      nextDimensions.quizPerformance +
      nextDimensions.codingAbility +
      nextDimensions.problemSolving +
      nextDimensions.practicalApplication +
      nextDimensions.debugging) /
      6
  );

  const hasAnyActivity =
    practicedCount > 0 ||
    (record.quizState && Object.keys(record.quizState.answeredIndices).length > 0) ||
    richEntries.length > 0 ||
    codingSolvedCount > 0 ||
    debugSolvedCount > 0;

  const nowIso = new Date().toISOString();
  const nextSpacedRevision =
    isMastered && !record.spacedRevision
      ? createInitialSpacedRevision(nowIso)
      : record.spacedRevision;

  return {
    ...record,
    dimensions: nextDimensions,
    overallScore: isMastered ? Math.max(85, activeAvg) : activeAvg,
    state: isMastered ? 'mastered' : hasAnyActivity ? 'in_progress' : record.state,
    spacedRevision: nextSpacedRevision,
    updatedAt: nowIso,
  };
}

function loadInitialStore(): ProgressStoreV2 {
  try {
    const rawV2 = localStorage.getItem(LOCAL_STORAGE_V2_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<ProgressStoreV2>;
      if (parsed && parsed.schemaVersion === 2 && parsed.progressMap && parsed.masteryMap) {
        return {
          schemaVersion: 2,
          migratedFromV1At: parsed.migratedFromV1At,
          progressMap: parsed.progressMap,
          masteryMap: parsed.masteryMap,
          projectProgressMap: parsed.projectProgressMap ?? {},
          interviewHistory: parsed.interviewHistory ?? [],
        };
      }
    }
  } catch {
    // Fall through to v1 migration
  }

  // Backward-compatible migration from v1 (never deletes v1 key)
  let legacyMap: Record<string, TopicProgressRecord> = {};
  try {
    const rawV1 = localStorage.getItem(LOCAL_STORAGE_V1_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      if (parsed && typeof parsed === 'object') {
        legacyMap = parsed as Record<string, TopicProgressRecord>;
      }
    }
  } catch {
    legacyMap = {};
  }

  const masteryMap: Record<string, TopicMasteryRecord> = {};
  for (const [challengeId, rec] of Object.entries(legacyMap)) {
    masteryMap[challengeId] = createMasteryFromLegacy(challengeId, rec);
  }

  const migrated: ProgressStoreV2 = {
    schemaVersion: 2,
    migratedFromV1At: Object.keys(legacyMap).length > 0 ? new Date().toISOString() : undefined,
    progressMap: legacyMap,
    masteryMap,
  };

  saveStoreV2(migrated);
  return migrated;
}

function saveStoreV2(store: ProgressStoreV2) {
  try {
    localStorage.setItem(LOCAL_STORAGE_V2_KEY, JSON.stringify(store));
    // Keep v1 mirror in sync so older fallback reads stay intact
    localStorage.setItem(LOCAL_STORAGE_V1_KEY, JSON.stringify(store.progressMap));
  } catch {
    // Ignore storage quota errors in restricted browsers
  }
}

function sanitizeRecord(
  challengeId: string,
  record: Partial<TopicProgressRecord>
): Omit<TopicProgressRecord, 'challengeId'> & { challengeId: string } {
  return {
    challengeId: challengeId.slice(0, 64),
    status: record.status === 'solved' ? 'solved' : 'attempted',
    savedHtml: (record.savedHtml ?? '').slice(0, 20000),
    savedJs: (record.savedJs ?? '').slice(0, 20000),
    studyNote: (record.studyNote ?? '').slice(0, 2000),
    hintsUsed: Math.min(10, Math.max(0, Math.floor(record.hintsUsed ?? 0))),
    attempts: Math.min(10000, Math.max(0, Math.floor(record.attempts ?? 0))),
    solvedAt: record.solvedAt,
    updatedAt: record.updatedAt,
  };
}

export function useProgressStore() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [store, setStore] = useState<ProgressStoreV2>(() => loadInitialStore());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const progressMap = store.progressMap;
  const masteryMap = store.masteryMap;
  const projectProgressMap = store.projectProgressMap ?? {};
  const interviewHistory = store.interviewHistory ?? [];

  const ensureUserProfile = useCallback(async (currentUser: User) => {
    const userPath = `users/${currentUser.uid}`;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userRef);
      const displayName = (currentUser.displayName || 'Student Learner').slice(0, 100);
      const email = currentUser.email ? currentUser.email.slice(0, 254) : undefined;

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          displayName,
          ...(email ? { email } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const existing = snap.data();
        if (existing.displayName !== displayName || (email && existing.email !== email)) {
          await updateDoc(userRef, {
            displayName,
            ...(email ? { email } : {}),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }, []);

  const syncRecordToCloud = useCallback(
    async (uid: string, challengeId: string, next: TopicProgressRecord) => {
      const progressPath = `users/${uid}/progress/${challengeId}`;
      const ref = doc(db, 'users', uid, 'progress', challengeId);
      const clean = sanitizeRecord(challengeId, next);

      try {
        const existingSnap = await getDoc(ref);
        if (!existingSnap.exists()) {
          await setDoc(ref, {
            userId: uid,
            challengeId: clean.challengeId,
            status: clean.status,
            savedHtml: clean.savedHtml,
            savedJs: clean.savedJs,
            studyNote: clean.studyNote,
            hintsUsed: clean.hintsUsed,
            attempts: clean.attempts,
            ...(clean.status === 'solved' ? { solvedAt: serverTimestamp() } : {}),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const existingData = existingSnap.data();
          const wasSolved = existingData.status === 'solved';
          const isBecomingSolved = !wasSolved && clean.status === 'solved';

          if (isBecomingSolved) {
            await updateDoc(ref, {
              status: 'solved',
              savedHtml: clean.savedHtml,
              savedJs: clean.savedJs,
              studyNote: clean.studyNote,
              hintsUsed: Math.max(existingData.hintsUsed ?? 0, clean.hintsUsed),
              attempts: Math.max(existingData.attempts ?? 0, clean.attempts),
              solvedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await updateDoc(ref, {
              savedHtml: clean.savedHtml,
              savedJs: clean.savedJs,
              studyNote: clean.studyNote,
              hintsUsed: Math.max(existingData.hintsUsed ?? 0, clean.hintsUsed),
              attempts: Math.max(existingData.attempts ?? 0, clean.attempts),
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, progressPath);
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (nextUser) {
        await ensureUserProfile(nextUser);
        const local = loadInitialStore().progressMap;
        for (const [challengeId, record] of Object.entries(local)) {
          await syncRecordToCloud(nextUser.uid, challengeId, record);
        }
      }
    });

    return () => unsubscribe();
  }, [ensureUserProfile, syncRecordToCloud]);

  useEffect(() => {
    if (!authReady || !user) return;

    const colPath = `users/${user.uid}/progress`;
    const q = query(
      collection(db, 'users', user.uid, 'progress'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setStore((prev) => {
          const mergedProgress = { ...prev.progressMap };
          const mergedMastery = { ...prev.masteryMap };

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const cloudRecord: TopicProgressRecord = {
              challengeId: data.challengeId,
              status: data.status === 'solved' ? 'solved' : 'attempted',
              savedHtml: data.savedHtml ?? '',
              savedJs: data.savedJs ?? '',
              studyNote: data.studyNote ?? '',
              hintsUsed: Number(data.hintsUsed ?? 0),
              attempts: Number(data.attempts ?? 0),
              solvedAt: data.solvedAt?.toDate ? data.solvedAt.toDate().toISOString() : undefined,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
            };
            mergedProgress[docSnap.id] = cloudRecord;

            const existingMastery = mergedMastery[docSnap.id];
            if (!existingMastery) {
              mergedMastery[docSnap.id] = createMasteryFromLegacy(docSnap.id, cloudRecord);
            } else if (cloudRecord.status === 'solved' && existingMastery.state !== 'mastered') {
              mergedMastery[docSnap.id] = {
                ...existingMastery,
                legacySolved: true,
                state: 'mastered',
                overallScore: Math.max(85, existingMastery.overallScore),
              };
            }
          });

          const nextStore: ProgressStoreV2 = {
            ...prev,
            progressMap: mergedProgress,
            masteryMap: mergedMastery,
          };
          saveStoreV2(nextStore);
          return nextStore;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, colPath);
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  const upsertChallengeProgress = useCallback(
    async (
      challengeId: string,
      updater: (prev: TopicProgressRecord | undefined) => TopicProgressRecord
    ) => {
      let updatedRecord!: TopicProgressRecord;
      setStore((prev) => {
        const current = prev.progressMap[challengeId];
        const nextRaw = updater(current);
        const normalized: TopicProgressRecord = {
          ...sanitizeRecord(challengeId, nextRaw),
          status: current?.status === 'solved' ? 'solved' : nextRaw.status,
          solvedAt:
            current?.solvedAt ??
            (nextRaw.status === 'solved' ? new Date().toISOString() : undefined),
          updatedAt: new Date().toISOString(),
        };
        updatedRecord = normalized;

        const existingMastery =
          prev.masteryMap[challengeId] ?? createMasteryFromLegacy(challengeId, current);
        const nextMastery: TopicMasteryRecord =
          normalized.status === 'solved'
            ? {
                ...existingMastery,
                state: 'mastered',
                overallScore: Math.max(85, existingMastery.overallScore),
                updatedAt: normalized.updatedAt ?? new Date().toISOString(),
              }
            : {
                ...existingMastery,
                state: existingMastery.state === 'not_started' ? 'in_progress' : existingMastery.state,
                updatedAt: normalized.updatedAt ?? new Date().toISOString(),
              };

        const nextStore: ProgressStoreV2 = {
          ...prev,
          progressMap: { ...prev.progressMap, [challengeId]: normalized },
          masteryMap: { ...prev.masteryMap, [challengeId]: nextMastery },
        };
        saveStoreV2(nextStore);
        return nextStore;
      });

      if (user) {
        await syncRecordToCloud(user.uid, challengeId, updatedRecord);
      }
    },
    [syncRecordToCloud, user]
  );

  const recordPracticeRun = useCallback(
    async (topicId: string, mode: 'logical' | 'realLife') => {
      let newlySolvedRecord: TopicProgressRecord | null = null;

      setStore((prev) => {
        const currentProgress = prev.progressMap[topicId];
        const baseMastery =
          prev.masteryMap[topicId] ?? createMasteryFromLegacy(topicId, currentProgress);
        const modes = baseMastery.practicedModes.includes(mode)
          ? baseMastery.practicedModes
          : [...baseMastery.practicedModes, mode];

        const recomputed = computeMasteryMetrics({
          ...baseMastery,
          practicedModes: modes,
        });

        let nextProgressMap = prev.progressMap;
        if (recomputed.state === 'mastered' && currentProgress?.status !== 'solved') {
          const solvedRec: TopicProgressRecord = {
            challengeId: topicId,
            status: 'solved',
            savedHtml: currentProgress?.savedHtml ?? '',
            savedJs: currentProgress?.savedJs ?? '',
            studyNote: currentProgress?.studyNote ?? '',
            hintsUsed: currentProgress?.hintsUsed ?? 0,
            attempts: (currentProgress?.attempts ?? 0) + 1,
            solvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newlySolvedRecord = solvedRec;
          nextProgressMap = { ...prev.progressMap, [topicId]: solvedRec };
        }

        const nextStore: ProgressStoreV2 = {
          ...prev,
          progressMap: nextProgressMap,
          masteryMap: { ...prev.masteryMap, [topicId]: recomputed },
        };
        saveStoreV2(nextStore);
        return nextStore;
      });

      if (user && newlySolvedRecord) {
        await syncRecordToCloud(user.uid, topicId, newlySolvedRecord);
      }
    },
    [syncRecordToCloud, user]
  );

  const recordQuizPerformance = useCallback(
    async (
      topicId: string,
      answeredIndices: Record<number, number>,
      correctCount: number,
      totalQuestions: number
    ) => {
      let progressToSync: TopicProgressRecord | null = null;

      setStore((prev) => {
        const currentProgress = prev.progressMap[topicId];
        const baseMastery =
          prev.masteryMap[topicId] ?? createMasteryFromLegacy(topicId, currentProgress);

        const currentPct =
          totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const bestScorePct = Math.max(baseMastery.quizState?.bestScorePct ?? 0, currentPct);

        const recomputed = computeMasteryMetrics({
          ...baseMastery,
          quizState: {
            answeredIndices,
            correctCount,
            totalQuestions,
            bestScorePct,
            lastAnsweredAt: new Date().toISOString(),
          },
        });

        const nextStatus: 'attempted' | 'solved' =
          recomputed.state === 'mastered' || currentProgress?.status === 'solved'
            ? 'solved'
            : 'attempted';

        const updatedProgress: TopicProgressRecord = {
          challengeId: topicId,
          status: nextStatus,
          savedHtml: currentProgress?.savedHtml ?? '',
          savedJs: currentProgress?.savedJs ?? '',
          studyNote: currentProgress?.studyNote ?? '',
          hintsUsed: currentProgress?.hintsUsed ?? 0,
          attempts: currentProgress?.attempts ?? 0,
          solvedAt:
            currentProgress?.solvedAt ??
            (nextStatus === 'solved' ? new Date().toISOString() : undefined),
          updatedAt: new Date().toISOString(),
        };
        progressToSync = updatedProgress;

        const nextStore: ProgressStoreV2 = {
          ...prev,
          progressMap: { ...prev.progressMap, [topicId]: updatedProgress },
          masteryMap: { ...prev.masteryMap, [topicId]: recomputed },
        };
        saveStoreV2(nextStore);
        return nextStore;
      });

      if (user && progressToSync) {
        await syncRecordToCloud(user.uid, topicId, progressToSync);
      }
    },
    [syncRecordToCloud, user]
  );

  const recordCodingChallengeResult = useCallback(
    async (
      topicId: string,
      challengeId: string,
      kind: 'logical' | 'realLife' | 'debug',
      passed: boolean,
      hintsUsed: number
    ) => {
      let progressToSync: TopicProgressRecord | null = null;

      setStore((prev) => {
        const currentProgress = prev.progressMap[topicId];
        const baseMastery =
          prev.masteryMap[topicId] ?? createMasteryFromLegacy(topicId, currentProgress);

        const nextSolvedPractice =
          passed && kind !== 'debug' && !baseMastery.solvedPracticeIds.includes(challengeId)
            ? [...baseMastery.solvedPracticeIds, challengeId]
            : baseMastery.solvedPracticeIds;

        const nextSolvedDebug =
          passed && kind === 'debug' && !baseMastery.solvedDebugIds.includes(challengeId)
            ? [...baseMastery.solvedDebugIds, challengeId]
            : baseMastery.solvedDebugIds;

        const nextDimensions: MasteryDimensions = {
          ...baseMastery.dimensions,
          codingAbility: passed
            ? Math.max(baseMastery.dimensions.codingAbility, kind === 'debug' ? 80 : 95)
            : Math.max(baseMastery.dimensions.codingAbility, 25),
          debugging:
            kind === 'debug'
              ? Math.max(baseMastery.dimensions.debugging, passed ? 95 : 30)
              : baseMastery.dimensions.debugging,
          problemSolving:
            kind === 'logical' && passed
              ? Math.max(baseMastery.dimensions.problemSolving, 95)
              : baseMastery.dimensions.problemSolving,
          practicalApplication:
            kind === 'realLife' && passed
              ? Math.max(baseMastery.dimensions.practicalApplication, 95)
              : baseMastery.dimensions.practicalApplication,
        };

        const recomputed = computeMasteryMetrics({
          ...baseMastery,
          dimensions: nextDimensions,
          solvedPracticeIds: nextSolvedPractice,
          solvedDebugIds: nextSolvedDebug,
        });

        const nextStatus: 'attempted' | 'solved' =
          recomputed.state === 'mastered' || currentProgress?.status === 'solved'
            ? 'solved'
            : 'attempted';

        const updatedProgress: TopicProgressRecord = {
          challengeId: topicId,
          status: nextStatus,
          savedHtml: currentProgress?.savedHtml ?? '',
          savedJs: currentProgress?.savedJs ?? '',
          studyNote: currentProgress?.studyNote ?? '',
          hintsUsed: Math.min(10, Math.max(currentProgress?.hintsUsed ?? 0, hintsUsed)),
          attempts: (currentProgress?.attempts ?? 0) + 1,
          solvedAt:
            currentProgress?.solvedAt ??
            (nextStatus === 'solved' ? new Date().toISOString() : undefined),
          updatedAt: new Date().toISOString(),
        };
        progressToSync = updatedProgress;

        const nextStore: ProgressStoreV2 = {
          ...prev,
          progressMap: { ...prev.progressMap, [topicId]: updatedProgress },
          masteryMap: { ...prev.masteryMap, [topicId]: recomputed },
        };
        saveStoreV2(nextStore);
        return nextStore;
      });

      if (user && progressToSync) {
        await syncRecordToCloud(user.uid, topicId, progressToSync);
      }
    },
    [syncRecordToCloud, user]
  );

  const recordRichQuizAnswer = useCallback(
    async (
      topicId: string,
      questionId: string,
      category: string,
      isCorrect: boolean
    ) => {
      let progressToSync: TopicProgressRecord | null = null;

      setStore((prev) => {
        const currentProgress = prev.progressMap[topicId];
        const baseMastery =
          prev.masteryMap[topicId] ?? createMasteryFromLegacy(topicId, currentProgress);

        const nextRichMap = {
          ...(baseMastery.richQuizAnswered ?? {}),
          [questionId]: isCorrect,
        };

        const nextDims: MasteryDimensions = {
          ...baseMastery.dimensions,
          debugging:
            category === 'Debugging' && isCorrect
              ? Math.max(baseMastery.dimensions.debugging, 70)
              : baseMastery.dimensions.debugging,
          problemSolving:
            (category === 'Logical' || category === 'Output-based') && isCorrect
              ? Math.max(baseMastery.dimensions.problemSolving, 70)
              : baseMastery.dimensions.problemSolving,
          practicalApplication:
            (category === 'Practical' || category === 'Scenario') && isCorrect
              ? Math.max(baseMastery.dimensions.practicalApplication, 70)
              : baseMastery.dimensions.practicalApplication,
        };

        const recomputed = computeMasteryMetrics({
          ...baseMastery,
          dimensions: nextDims,
          richQuizAnswered: nextRichMap,
        });

        if (recomputed.state === 'mastered' && currentProgress?.status !== 'solved') {
          progressToSync = {
            challengeId: topicId,
            status: 'solved',
            savedHtml: currentProgress?.savedHtml ?? '',
            savedJs: currentProgress?.savedJs ?? '',
            studyNote: currentProgress?.studyNote ?? '',
            hintsUsed: currentProgress?.hintsUsed ?? 0,
            attempts: currentProgress?.attempts ?? 1,
            solvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        const nextStore: ProgressStoreV2 = {
          ...prev,
          progressMap: progressToSync
            ? { ...prev.progressMap, [topicId]: progressToSync }
            : prev.progressMap,
          masteryMap: { ...prev.masteryMap, [topicId]: recomputed },
        };
        saveStoreV2(nextStore);
        return nextStore;
      });

      if (user && progressToSync) {
        await syncRecordToCloud(user.uid, topicId, progressToSync);
      }
    },
    [syncRecordToCloud, user]
  );

  const recordSpacedReview = useCallback((topicId: string, scorePct: number) => {
    setStore((prev) => {
      const currentProgress = prev.progressMap[topicId];
      const baseMastery =
        prev.masteryMap[topicId] ?? createMasteryFromLegacy(topicId, currentProgress);
      const nextSpaced = advanceSpacedRevision(baseMastery.spacedRevision, scorePct);
      const nextStore: ProgressStoreV2 = {
        ...prev,
        masteryMap: {
          ...prev.masteryMap,
          [topicId]: {
            ...baseMastery,
            spacedRevision: nextSpaced,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      saveStoreV2(nextStore);
      return nextStore;
    });
  }, []);

  const saveProjectProgress = useCallback(
    (
      projectId: string,
      updater: (prev: ProjectProgressRecord | undefined) => ProjectProgressRecord
    ) => {
      setStore((prev) => {
        const current = prev.projectProgressMap?.[projectId];
        const nextRecord: ProjectProgressRecord = {
          ...updater(current),
          projectId,
          updatedAt: new Date().toISOString(),
        };
        const nextStore: ProgressStoreV2 = {
          ...prev,
          projectProgressMap: {
            ...(prev.projectProgressMap ?? {}),
            [projectId]: nextRecord,
          },
        };
        saveStoreV2(nextStore);
        return nextStore;
      });
    },
    []
  );

  const recordMockInterview = useCallback((result: MockInterviewResult) => {
    setStore((prev) => {
      const nextHistory = [result, ...(prev.interviewHistory ?? [])].slice(0, 25);
      const nextStore: ProgressStoreV2 = {
        ...prev,
        interviewHistory: nextHistory,
      };
      saveStoreV2(nextStore);
      return nextStore;
    });
  }, []);

  const handleSignIn = useCallback(async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Unable to sign in with Google right now.'
      );
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    await signOutUser();
  }, []);

  return {
    user,
    authReady,
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
  };
}
