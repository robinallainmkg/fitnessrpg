import firestore from '@react-native-firebase/firestore';
import { 
  ChallengeSubmission, 
  DailyChallenge, 
  CHALLENGE_TYPES,
  getChallengeXP,
  getChallengeLabel
} from '../types/Challenge';

const IS_DEV = __DEV__;
const log = (...args: any[]) => IS_DEV && console.log('[ChallengeService]', ...args);
const logError = (...args: any[]) => console.error('[ChallengeService]', ...args);

export class ChallengeService {
  private submissionsCollection = firestore().collection('submissions');
  private dailyChallengesCollection = firestore().collection('dailyChallenges');
  private usersCollection = firestore().collection('users');

  /**
   * SUBMISSIONS CRUD
   */

  async createSubmission(
    submission: Omit<ChallengeSubmission, 'id'>
  ): Promise<string> {
    try {
      log('Creating submission:', submission.challengeType);

      const docRef = await this.submissionsCollection.add({
        ...submission,
        submittedAt: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        xpRewarded: getChallengeXP(submission.challengeType),
      });

      log('✅ Submission created:', docRef.id);
      return docRef.id;
    } catch (error) {
      logError('Failed to create submission:', error);
      throw error;
    }
  }

  async getSubmission(id: string): Promise<ChallengeSubmission | null> {
    try {
      const doc = await this.submissionsCollection.doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data?.submittedAt?.toDate(),
        reviewedAt: data?.reviewedAt?.toDate(),
      } as ChallengeSubmission;
    } catch (error) {
      logError('Failed to get submission:', error);
      throw error;
    }
  }

  async updateSubmissionStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy?: string,
    reason?: string
  ): Promise<void> {
    try {
      log(`Updating submission ${id} to ${status}`);

      const updateData: any = {
        status,
        reviewedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (reviewedBy) {
        updateData.reviewedBy = reviewedBy;
      }

      if (reason) {
        updateData.reason = reason;
      }

      await this.submissionsCollection.doc(id).update(updateData);

      // Si approuvé, donner les XP à l'utilisateur ET créer une session
      if (status === 'approved') {
        const submission = await this.getSubmission(id);
        if (submission) {
          await this.rewardUserXP(submission.userId, submission.xpRewarded);
          await this.createWorkoutSession(submission);
        }
      }

      log('✅ Submission status updated');
    } catch (error) {
      logError('Failed to update submission status:', error);
      throw error;
    }
  }

  async getPendingSubmissions(): Promise<ChallengeSubmission[]> {
    try {
      log('Getting pending submissions...');
      
      // Version sans orderBy pour éviter l'index
      // Une fois l'index créé, on pourra remettre .orderBy('submittedAt', 'desc')
      const snapshot = await this.submissionsCollection
        .where('status', '==', 'pending')
        .limit(100)
        .get();

      const submissions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          reviewedAt: data.reviewedAt?.toDate(),
        } as ChallengeSubmission;
      });

      // Tri manuel en attendant l'index
      submissions.sort((a, b) => {
        const dateA = a.submittedAt ? a.submittedAt.getTime() : 0;
        const dateB = b.submittedAt ? b.submittedAt.getTime() : 0;
        return dateB - dateA; // Plus récent en premier
      });

      log(`✅ Found ${submissions.length} pending submissions`);
      return submissions;
    } catch (error) {
      logError('Failed to get pending submissions:', error);
      throw error;
    }
  }

  async getUserSubmissions(
    userId: string,
    limit: number = 20
  ): Promise<ChallengeSubmission[]> {
    try {
      const snapshot = await this.submissionsCollection
        .where('userId', '==', userId)
        .orderBy('submittedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          reviewedAt: data.reviewedAt?.toDate(),
        } as ChallengeSubmission;
      });
    } catch (error) {
      logError('Failed to get user submissions:', error);
      throw error;
    }
  }

  /**
   * DAILY CHALLENGES
   */

  async getOrCreateDailyChallenge(
    userId: string,
    date: string
  ): Promise<DailyChallenge> {
    try {
      const docRef = this.dailyChallengesCollection.doc(date).collection('users').doc(userId);
      const doc = await docRef.get();

      if (doc.exists()) {
        return doc.data() as DailyChallenge;
      }

      // Créer un nouveau challenge
      const challengeType = this.getRandomChallengeType();
      const newChallenge: DailyChallenge = {
        date,
        userId,
        challengeType,
        submitted: false,
      };

      await docRef.set(newChallenge);

      log('✅ Created new daily challenge:', challengeType);
      return newChallenge;
    } catch (error) {
      logError('Failed to get/create daily challenge:', error);
      throw error;
    }
  }

  async updateDailyChallengeSubmission(
    userId: string,
    date: string,
    submissionId: string
  ): Promise<void> {
    try {
      const docRef = this.dailyChallengesCollection
        .doc(date)
        .collection('users')
        .doc(userId);

      await docRef.update({
        submissionId,
        submitted: true,
      });

      log('✅ Daily challenge marked as submitted');
    } catch (error) {
      logError('Failed to update daily challenge submission:', error);
      throw error;
    }
  }

  async hasUserSubmittedToday(userId: string): Promise<boolean> {
    try {
      const today = this.formatDateForKey(new Date());
      const challenge = await this.getOrCreateDailyChallenge(userId, today);
      return challenge.submitted;
    } catch (error) {
      logError('Failed to check if user submitted today:', error);
      return false;
    }
  }

  /**
   * USER STATS
   */

  async updateUserStats(
    userId: string,
    submissionStatus: 'pending' | 'approved' | 'rejected'
  ): Promise<void> {
    try {
      const userRef = this.usersCollection.doc(userId);

      if (submissionStatus === 'pending') {
        // Incrémenter totalChallengesSubmitted
        await userRef.update({
          totalChallengesSubmitted: firestore.FieldValue.increment(1),
          lastSubmissionDate: firestore.FieldValue.serverTimestamp(),
        });
      } else if (submissionStatus === 'approved') {
        // Incrémenter totalChallengesApproved
        await userRef.update({
          totalChallengesApproved: firestore.FieldValue.increment(1),
        });
      }

      log('✅ User stats updated');
    } catch (error) {
      logError('Failed to update user stats:', error);
      // Non-bloquant, on continue
    }
  }

  private async rewardUserXP(userId: string, xp: number): Promise<void> {
    try {
      const userRef = this.usersCollection.doc(userId);

      await userRef.update({
        totalXP: firestore.FieldValue.increment(xp),
      });

      log(`✅ Rewarded ${xp} XP to user ${userId}`);
    } catch (error) {
      logError('Failed to reward XP:', error);
      throw error;
    }
  }

  /**
   * Créer une session d'entraînement pour un challenge validé
   * Compatible avec le système de progression des programmes
   */
  private async createWorkoutSession(submission: ChallengeSubmission): Promise<void> {
    try {
      const sessionData = {
        userId: submission.userId,
        type: 'challenge', // Type spécial pour identifier les challenges
        challengeType: submission.challengeType,
        submissionId: submission.id,
        videoURL: submission.videoURL,
        date: submission.submittedAt,
        completedAt: firestore.FieldValue.serverTimestamp(),
        xpEarned: submission.xpRewarded,
        status: 'completed',
        // Format compatible avec l'historique des séances
        programId: null,
        skillId: null,
        exercises: [{
          name: `Challenge: ${getChallengeLabel(submission.challengeType)}`,
          type: submission.challengeType,
          isChallenge: true,
        }],
      };

      await firestore()
        .collection('workoutSessions')
        .add(sessionData);

      log(`✅ Created workout session for challenge ${submission.challengeType}`);
    } catch (error) {
      logError('Failed to create workout session:', error);
      // Non-bloquant, on continue même si ça échoue
    }
  }

  /**
   * UTILS
   */

  getRandomChallengeType(): string {
    const randomIndex = Math.floor(Math.random() * CHALLENGE_TYPES.length);
    return CHALLENGE_TYPES[randomIndex];
  }

  formatDateForKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayKey(): string {
    return this.formatDateForKey(new Date());
  }
}

export const challengeService = new ChallengeService();
