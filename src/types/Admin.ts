export interface AdminNotification {
  submissionId: string;
  userId: string;
  challengeType: string;
  submittedAt: Date;
  videoURL: string;
}

export interface AdminStats {
  totalPendingReviews: number;
  totalApprovedToday: number;
  totalRejectedToday: number;
}
