export interface ChallengeSubmission {
  id?: string;
  userId: string;
  challengeType: string;
  videoURL: string;
  videoFileName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reason?: string;
  xpRewarded: number;
}

export interface DailyChallenge {
  date: string;           // "2025-10-26"
  userId: string;
  challengeType: string;
  submissionId?: string;
  submitted: boolean;
}

export interface SubmissionStats {
  totalChallengesSubmitted: number;
  totalChallengesApproved: number;
  lastSubmissionDate?: Date;
}

export const CHALLENGE_TYPES = [
  '50_pushups_unbroken',
  '20_pullups',
  '10_muscle_ups',
  '30_burpees',
  '1min_planche',
  '10_dips',
] as const;

export type ChallengeType = typeof CHALLENGE_TYPES[number];

// Helper pour obtenir le label lisible d'un challenge
export const getChallengeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    '50_pushups_unbroken': '50 Pompes sans pause',
    '20_pullups': '20 Tractions',
    '10_muscle_ups': '10 Muscle-ups',
    '30_burpees': '30 Burpees',
    '1min_planche': '1 min Planche',
    '10_dips': '10 Dips',
  };
  return labels[type] || type;
};

// Helper pour obtenir les XP par challenge
export const getChallengeXP = (type: string): number => {
  const xpMap: Record<string, number> = {
    '50_pushups_unbroken': 100,
    '20_pullups': 150,
    '10_muscle_ups': 200,
    '30_burpees': 80,
    '1min_planche': 120,
    '10_dips': 100,
  };
  return xpMap[type] || 100;
};
