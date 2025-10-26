import { useEffect, useState } from 'react';
import { challengeService } from '../services/ChallengeService';
import { DailyChallenge } from '../types/Challenge';

const IS_DEV = __DEV__;
const log = (...args: any[]) => IS_DEV && console.log('[useDailyChallenge]', ...args);
const logError = (...args: any[]) => console.error('[useDailyChallenge]', ...args);

interface UseDailyChallengeProps {
  userId?: string;
  autoLoad?: boolean;
}

export const useDailyChallenge = ({ userId, autoLoad = true }: UseDailyChallengeProps = {}) => {
  const [challenge, setChallenge] = useState(null as DailyChallenge | null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  /**
   * Load today's challenge
   */
  const loadChallenge = async (uid?: string) => {
    const targetUserId = uid || userId;

    if (!targetUserId) {
      logError('No userId provided');
      setError('User ID manquant');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const today = challengeService.getTodayKey();
      const dailyChallenge = await challengeService.getOrCreateDailyChallenge(
        targetUserId,
        today
      );

      setChallenge(dailyChallenge);
      log('✅ Challenge loaded:', dailyChallenge.challengeType);
    } catch (err: any) {
      logError('Failed to load challenge:', err);
      setError('Impossible de charger le challenge');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh challenge (force reload)
   */
  const refreshChallenge = async () => {
    await loadChallenge();
  };

  /**
   * Check if user has submitted today
   */
  const hasSubmitted = (): boolean => {
    return challenge?.submitted || false;
  };

  /**
   * Get challenge type string
   */
  const getChallengeType = (): string | null => {
    return challenge?.challengeType || null;
  };

  // Auto-load on mount if userId provided and autoLoad is true
  useEffect(() => {
    if (autoLoad && userId) {
      loadChallenge();
    }
  }, [userId, autoLoad]);

  return {
    // State
    challenge,
    loading,
    error,

    // Computed
    hasSubmitted: hasSubmitted(),
    challengeType: getChallengeType(),

    // Actions
    loadChallenge,
    refreshChallenge,
  };
};
