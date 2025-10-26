import React, { createContext, useState, useContext } from 'react';
import { ChallengeSubmission, DailyChallenge } from '../types/Challenge';
import { challengeService } from '../services/ChallengeService';
import { storageService } from '../services/StorageService';

const IS_DEV = __DEV__;
const log = (...args: any[]) => IS_DEV && console.log('[ChallengeContext]', ...args);
const logError = (...args: any[]) => console.error('[ChallengeContext]', ...args);

interface ChallengeContextType {
  // Daily Challenge
  todayChallenge: DailyChallenge | null;
  loadingChallenge: boolean;
  loadTodayChallenge: (userId: string) => Promise<void>;

  // Current submission
  currentSubmission: ChallengeSubmission | null;
  recordedVideoUri: string | null;
  setRecordedVideoUri: (uri: string | null) => void;

  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  submitChallenge: (videoUri: string, userId: string, challengeType: string) => Promise<void>;

  // Admin
  pendingSubmissions: ChallengeSubmission[];
  loadingPending: boolean;
  loadPendingSubmissions: () => Promise<void>;
  approveSubmission: (submissionId: string, reviewerId: string) => Promise<void>;
  rejectSubmission: (submissionId: string, reviewerId: string, reason: string) => Promise<void>;

  // User submissions history
  userSubmissions: ChallengeSubmission[];
  loadingUserSubmissions: boolean;
  loadUserSubmissions: (userId: string) => Promise<void>;

  // Error/messages
  error: string | null;
  success: string | null;
  clearMessages: () => void;
}

const ChallengeContext = createContext(undefined as any);

export const ChallengeProvider = ({ children }: any) => {
  // Daily Challenge state
  const [todayChallenge, setTodayChallenge] = useState(null as DailyChallenge | null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  // Submission state
  const [currentSubmission, setCurrentSubmission] = useState(null as ChallengeSubmission | null);
  const [recordedVideoUri, setRecordedVideoUri] = useState(null as string | null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Admin state
  const [pendingSubmissions, setPendingSubmissions] = useState([] as ChallengeSubmission[]);
  const [loadingPending, setLoadingPending] = useState(false);

  // User submissions history
  const [userSubmissions, setUserSubmissions] = useState([] as ChallengeSubmission[]);
  const [loadingUserSubmissions, setLoadingUserSubmissions] = useState(false);

  // Messages
  const [error, setError] = useState(null as string | null);
  const [success, setSuccess] = useState(null as string | null);

  /**
   * Load today's challenge for a user
   */
  const loadTodayChallenge = async (userId: string) => {
    try {
      setLoadingChallenge(true);
      setError(null);

      const today = challengeService.getTodayKey();
      const challenge = await challengeService.getOrCreateDailyChallenge(userId, today);

      setTodayChallenge(challenge);
      log('✅ Today challenge loaded:', challenge.challengeType);
    } catch (err: any) {
      logError('Failed to load today challenge:', err);
      setError('Impossible de charger le challenge du jour');
    } finally {
      setLoadingChallenge(false);
    }
  };

  /**
   * Submit a challenge video
   */
  const submitChallenge = async (
    videoUri: string,
    userId: string,
    challengeType: string
  ) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      log('Starting challenge submission...');

      // 1. Upload video to Storage
      const { url, fileName } = await storageService.uploadChallengeVideo(
        videoUri,
        userId,
        challengeType,
        (progress) => setUploadProgress(progress)
      );

      log('Video uploaded:', url);

      // 2. Create submission in Firestore
      const submissionId = await challengeService.createSubmission({
        userId,
        challengeType,
        videoURL: url,
        videoFileName: fileName,
        status: 'pending',
        submittedAt: new Date(),
        xpRewarded: 0, // Will be set by service
      });

      log('Submission created:', submissionId);

      // 3. Update daily challenge
      const today = challengeService.getTodayKey();
      await challengeService.updateDailyChallengeSubmission(userId, today, submissionId);

      // 4. Update user stats
      await challengeService.updateUserStats(userId, 'pending');

      // 5. Reload today's challenge to reflect submitted status
      await loadTodayChallenge(userId);

      setSuccess('✅ Challenge soumis ! En attente de validation.');
      setRecordedVideoUri(null);
      setUploadProgress(0);

      log('✅ Challenge submission complete');
    } catch (err: any) {
      logError('Failed to submit challenge:', err);
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Load pending submissions (Admin)
   */
  const loadPendingSubmissions = async () => {
    try {
      setLoadingPending(true);
      setError(null);

      const submissions = await challengeService.getPendingSubmissions();
      setPendingSubmissions(submissions);

      log('✅ Loaded pending submissions:', submissions.length);
    } catch (err: any) {
      logError('Failed to load pending submissions:', err);
      setError('Impossible de charger les soumissions en attente');
    } finally {
      setLoadingPending(false);
    }
  };

  /**
   * Approve a submission (Admin)
   */
  const approveSubmission = async (submissionId: string, reviewerId: string) => {
    try {
      setError(null);

      await challengeService.updateSubmissionStatus(
        submissionId,
        'approved',
        reviewerId
      );

      // Update local state
      setPendingSubmissions((prev) =>
        prev.filter((s) => s.id !== submissionId)
      );

      setSuccess('✅ Soumission approuvée !');
      log('✅ Submission approved:', submissionId);
    } catch (err: any) {
      logError('Failed to approve submission:', err);
      setError('Erreur lors de l\'approbation');
    }
  };

  /**
   * Reject a submission (Admin)
   */
  const rejectSubmission = async (
    submissionId: string,
    reviewerId: string,
    reason: string
  ) => {
    try {
      setError(null);

      await challengeService.updateSubmissionStatus(
        submissionId,
        'rejected',
        reviewerId,
        reason
      );

      // Update local state
      setPendingSubmissions((prev: ChallengeSubmission[]) =>
        prev.filter((s: ChallengeSubmission) => s.id !== submissionId)
      );

      setSuccess('Soumission rejetée');
      log('✅ Submission rejected:', submissionId);
    } catch (err: any) {
      logError('Failed to reject submission:', err);
      setError('Erreur lors du rejet');
    }
  };

  /**
   * Load user submission history
   */
  const loadUserSubmissions = async (userId: string) => {
    try {
      setLoadingUserSubmissions(true);
      setError(null);

      const submissions = await challengeService.getUserSubmissions(userId, 20);
      setUserSubmissions(submissions);

      log('✅ Loaded user submissions:', submissions.length);
    } catch (err: any) {
      logError('Failed to load user submissions:', err);
      setError('Impossible de charger votre historique');
    } finally {
      setLoadingUserSubmissions(false);
    }
  };

  /**
   * Clear error/success messages
   */
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const value: ChallengeContextType = {
    // Daily Challenge
    todayChallenge,
    loadingChallenge,
    loadTodayChallenge,

    // Current submission
    currentSubmission,
    recordedVideoUri,
    setRecordedVideoUri,

    // Upload
    isUploading,
    uploadProgress,
    submitChallenge,

    // Admin
    pendingSubmissions,
    loadingPending,
    loadPendingSubmissions,
    approveSubmission,
    rejectSubmission,

    // User history
    userSubmissions,
    loadingUserSubmissions,
    loadUserSubmissions,

    // Messages
    error,
    success,
    clearMessages,
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenge must be used within ChallengeProvider');
  }
  return context;
};
