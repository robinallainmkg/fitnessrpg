/**
 * MockChallengeService - Local testing sans Firebase
 * 
 * Simule toutes les opérations Firebase pour tester le Challenge System en local
 * Utilise AsyncStorage pour persistance légère
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChallengeSubmission,
  DailyChallenge,
  SubmissionStats,
  ChallengeType,
  CHALLENGE_TYPES,
  getChallengeXP,
} from '../types/Challenge';

const STORAGE_KEYS = {
  SUBMISSIONS: '@mock:submissions',
  DAILY_CHALLENGES: '@mock:daily_challenges',
  USER_STATS: '@mock:user_stats',
  NEXT_ID: '@mock:next_id',
};

// Générateur d'ID unique
let mockIdCounter = 1;
const generateId = async (): Promise<string> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.NEXT_ID);
  if (stored) {
    mockIdCounter = parseInt(stored, 10);
  }
  const id = `mock_${Date.now()}_${mockIdCounter++}`;
  await AsyncStorage.setItem(STORAGE_KEYS.NEXT_ID, mockIdCounter.toString());
  return id;
};

/**
 * Créer une soumission (simulé)
 */
export const createSubmission = async (
  userId: string,
  challengeType: ChallengeType,
  videoURL: string // URL local (simulé)
): Promise<ChallengeSubmission> => {
  console.log('🎭 [MOCK] Creating submission:', { userId, challengeType, videoURL });

  const submissionId = await generateId();
  const submission: ChallengeSubmission = {
    id: submissionId,
    userId,
    challengeType,
    videoURL,
    videoFileName: videoURL.split('/').pop() || 'mock_video.mp4',
    status: 'pending',
    submittedAt: new Date(),
    reviewedAt: undefined,
    reviewedBy: undefined,
    reason: undefined,
    xpRewarded: 0,
  };

  // Sauvegarder dans AsyncStorage
  const existingData = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  const submissions = existingData ? JSON.parse(existingData) : [];
  submissions.push(submission);
  await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

  console.log('✅ [MOCK] Submission created:', submissionId);
  return submission;
};

/**
 * Récupérer toutes les soumissions en attente
 */
export const getPendingSubmissions = async (): Promise<ChallengeSubmission[]> => {
  console.log('🎭 [MOCK] Getting pending submissions');

  const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!data) return [];

  const submissions: ChallengeSubmission[] = JSON.parse(data);
  
  // Reconvertir les dates (AsyncStorage sérialise en string)
  return submissions
    .filter(s => s.status === 'pending')
    .map(s => ({
      ...s,
      submittedAt: new Date(s.submittedAt),
      reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : undefined,
    })) as ChallengeSubmission[];
};

/**
 * Récupérer les soumissions d'un utilisateur
 */
export const getUserSubmissions = async (userId: string): Promise<ChallengeSubmission[]> => {
  console.log('🎭 [MOCK] Getting user submissions for:', userId);

  const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!data) return [];

  const submissions: ChallengeSubmission[] = JSON.parse(data);
  
  return submissions
    .filter(s => s.userId === userId)
    .map(s => ({
      ...s,
      submittedAt: new Date(s.submittedAt),
      reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : undefined,
    })) as ChallengeSubmission[];
};

/**
 * Approuver une soumission (admin)
 */
export const approveSubmission = async (
  submissionId: string,
  adminId: string
): Promise<void> => {
  console.log('🎭 [MOCK] Approving submission:', submissionId);

  const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!data) throw new Error('No submissions found');

  const submissions: ChallengeSubmission[] = JSON.parse(data);
  const submission = submissions.find(s => s.id === submissionId);
  
  if (!submission) throw new Error('Submission not found');

  // Calculer XP
  const xp = getChallengeXP(submission.challengeType);

  // Mettre à jour
  submission.status = 'approved';
  submission.reviewedAt = new Date();
  submission.reviewedBy = adminId;
  submission.xpRewarded = xp;

  await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  
  // Mettre à jour stats utilisateur (simulé)
  await updateUserStats(submission.userId, 'approved');
  
  console.log('✅ [MOCK] Submission approved, XP:', xp);
};

/**
 * Rejeter une soumission (admin)
 */
export const rejectSubmission = async (
  submissionId: string,
  adminId: string,
  reason: string
): Promise<void> => {
  console.log('🎭 [MOCK] Rejecting submission:', submissionId, 'reason:', reason);

  const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!data) throw new Error('No submissions found');

  const submissions: ChallengeSubmission[] = JSON.parse(data);
  const submission = submissions.find(s => s.id === submissionId);
  
  if (!submission) throw new Error('Submission not found');

  submission.status = 'rejected';
  submission.reviewedAt = new Date();
  submission.reviewedBy = adminId;
  submission.reason = reason;

  await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  
  console.log('✅ [MOCK] Submission rejected');
};

/**
 * Obtenir ou créer le défi du jour
 */
export const getOrCreateDailyChallenge = async (
  userId: string,
  date: string // Format: YYYY-MM-DD
): Promise<DailyChallenge> => {
  console.log('🎭 [MOCK] Getting daily challenge for:', userId, date);

  const key = `${STORAGE_KEYS.DAILY_CHALLENGES}_${userId}_${date}`;
  const existing = await AsyncStorage.getItem(key);

  if (existing) {
    const challenge = JSON.parse(existing);
    console.log('✅ [MOCK] Found existing challenge:', challenge.challengeType);
    return challenge;
  }

  // Créer nouveau défi (random)
  const randomIndex = Math.floor(Math.random() * CHALLENGE_TYPES.length);
  const challengeType = CHALLENGE_TYPES[randomIndex];

  const challenge: DailyChallenge = {
    userId,
    date,
    challengeType,
    submissionId: undefined,
    submitted: false,
  };

  await AsyncStorage.setItem(key, JSON.stringify(challenge));
  console.log('✅ [MOCK] Created new challenge:', challengeType);
  
  return challenge;
};

/**
 * Marquer le défi comme soumis
 */
export const markChallengeAsSubmitted = async (
  userId: string,
  date: string,
  submissionId: string
): Promise<void> => {
  console.log('🎭 [MOCK] Marking challenge as submitted:', { userId, date, submissionId });

  const key = `${STORAGE_KEYS.DAILY_CHALLENGES}_${userId}_${date}`;
  const existing = await AsyncStorage.getItem(key);

  if (!existing) {
    throw new Error('Challenge not found');
  }

  const challenge: DailyChallenge = JSON.parse(existing);
  challenge.submitted = true;
  challenge.submissionId = submissionId;

  await AsyncStorage.setItem(key, JSON.stringify(challenge));
  console.log('✅ [MOCK] Challenge marked as submitted');
};

/**
 * Récupérer stats utilisateur
 */
export const getUserStats = async (userId: string): Promise<SubmissionStats> => {
  console.log('🎭 [MOCK] Getting user stats for:', userId);

  const key = `${STORAGE_KEYS.USER_STATS}_${userId}`;
  const data = await AsyncStorage.getItem(key);

  if (!data) {
    const defaultStats: SubmissionStats = {
      totalChallengesSubmitted: 0,
      totalChallengesApproved: 0,
      lastSubmissionDate: undefined,
    };
    return defaultStats;
  }

  const stats = JSON.parse(data);
  return {
    ...stats,
    lastSubmissionDate: stats.lastSubmissionDate ? new Date(stats.lastSubmissionDate) : undefined,
  } as SubmissionStats;
};

/**
 * Mettre à jour stats utilisateur
 */
export const updateUserStats = async (
  userId: string,
  action: 'submitted' | 'approved'
): Promise<void> => {
  console.log('🎭 [MOCK] Updating user stats:', userId, action);

  const stats = await getUserStats(userId);

  if (action === 'submitted') {
    stats.totalChallengesSubmitted += 1;
    stats.lastSubmissionDate = new Date();
  } else if (action === 'approved') {
    stats.totalChallengesApproved += 1;
  }

  const key = `${STORAGE_KEYS.USER_STATS}_${userId}`;
  await AsyncStorage.setItem(key, JSON.stringify(stats));
  
  console.log('✅ [MOCK] Stats updated:', stats);
};

/**
 * Récompenser l'utilisateur avec XP (simulé - juste un log)
 */
export const rewardUserXP = async (userId: string, xp: number): Promise<void> => {
  console.log('🎭 [MOCK] Rewarding XP:', { userId, xp });
  // En mode mock, on ne modifie pas vraiment Firestore
  // Dans un vrai test, on pourrait mettre à jour AuthContext localement
  console.log('✅ [MOCK] XP reward simulated (no actual Firestore update)');
};

/**
 * Reset toutes les données mock (utile pour tests)
 */
export const resetMockData = async (): Promise<void> => {
  console.log('🎭 [MOCK] Resetting all mock data');
  
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.SUBMISSIONS,
    STORAGE_KEYS.NEXT_ID,
  ]);

  // Reset daily challenges (pattern match)
  const allKeys = await AsyncStorage.getAllKeys();
  const challengeKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.DAILY_CHALLENGES));
  if (challengeKeys.length > 0) {
    await AsyncStorage.multiRemove(challengeKeys);
  }

  const statsKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.USER_STATS));
  if (statsKeys.length > 0) {
    await AsyncStorage.multiRemove(statsKeys);
  }

  mockIdCounter = 1;
  
  console.log('✅ [MOCK] All mock data reset');
};
