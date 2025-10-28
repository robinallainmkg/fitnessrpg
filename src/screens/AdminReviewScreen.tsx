import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { useAuth } from '../contexts/AuthContext';
import { useChallenge } from '../contexts/ChallengeContext';
import { getChallengeLabel } from '../types/Challenge';
import { ChallengeSubmission } from '../types/Challenge';
import { colors } from '../theme/colors';

export const AdminReviewScreen = () => {
  const { user } = useAuth();
  const {
    pendingSubmissions,
    loadingPending,
    loadPendingSubmissions,
    approveSubmission,
    rejectSubmission,
    error,
    success,
    clearMessages,
  } = useChallenge();

  const [selectedSubmission, setSelectedSubmission] = useState(null as ChallengeSubmission | null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState(null as string | null);
  const videoRef = useRef<any>(null);

  // Load pending submissions on mount
  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => clearMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleApprove = (submission: ChallengeSubmission) => {
    Alert.alert(
      'Approuver la soumission',
      `Approuver le challenge "${getChallengeLabel(submission.challengeType)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          onPress: async () => {
            if (user?.uid && submission.id) {
              await approveSubmission(submission.id, user.uid);
            }
          },
        },
      ]
    );
  };

  const handleOpenRejectModal = (submission: ChallengeSubmission) => {
    setSelectedSubmission(submission);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedSubmission?.id || !user?.uid) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une raison pour le rejet.');
      return;
    }

    await rejectSubmission(selectedSubmission.id, user.uid, rejectionReason);
    setShowRejectModal(false);
    setSelectedSubmission(null);
    setRejectionReason('');
  };

  const handleRefresh = () => {
    loadPendingSubmissions();
  };

  const handleViewVideo = (submission: ChallengeSubmission) => {
    if (!submission.videoURL) {
      Alert.alert('Erreur', 'Aucune vidéo disponible pour cette soumission.');
      return;
    }

    // Ouvrir la vidéo dans un modal avec le player
    setVideoToPlay(submission.videoURL);
    setShowVideoModal(true);
  };

  const handleCloseVideo = () => {
    setShowVideoModal(false);
    setVideoToPlay(null);
  };

  const renderSubmissionItem = ({ item }: { item: ChallengeSubmission }) => (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <Text style={styles.challengeType}>
          {getChallengeLabel(item.challengeType)}
        </Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>En attente</Text>
        </View>
      </View>

      <Text style={styles.submissionInfo}>
        Par: <Text style={styles.userId}>{item.userId.substring(0, 8)}...</Text>
      </Text>

      <Text style={styles.submissionInfo}>
        Soumis le: <Text style={styles.date}>{formatDate(item.submittedAt)}</Text>
      </Text>

      {/* Bouton pour voir la vidéo */}
      <TouchableOpacity
        style={styles.viewVideoButton}
        onPress={() => handleViewVideo(item)}
      >
        <Text style={styles.viewVideoButtonText}>🎥 Voir la vidéo</Text>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item)}
        >
          <Text style={styles.actionButtonText}>✓ Approuver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleOpenRejectModal(item)}
        >
          <Text style={styles.actionButtonText}>✗ Rejeter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✨</Text>
      <Text style={styles.emptyText}>Aucune soumission en attente</Text>
      <Text style={styles.emptySubtext}>
        Les nouvelles soumissions apparaîtront ici
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Admin Review</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{pendingSubmissions.length}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {success && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Submissions list */}
      <FlatList
        data={pendingSubmissions}
        renderItem={renderSubmissionItem}
        keyExtractor={(item) => item.id || ''}
        refreshing={loadingPending}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          pendingSubmissions.length === 0 && styles.emptyList
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Rejeter la soumission</Text>

              {selectedSubmission && (
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    {getChallengeLabel(selectedSubmission.challengeType)}
                  </Text>
                  <Text style={styles.modalInfoSubtext}>
                    Par: {selectedSubmission.userId.substring(0, 8)}...
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>
                Raison du rejet <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Technique incorrecte, vidéo floue..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonReject]}
                  onPress={handleReject}
                >
                  <Text style={styles.modalButtonText}>Rejeter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowRejectModal(false);
                    setSelectedSubmission(null);
                    setRejectionReason('');
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseVideo}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContainer}>
            <TouchableOpacity
              style={styles.videoCloseButton}
              onPress={handleCloseVideo}
            >
              <Text style={styles.videoCloseButtonText}>✕ Fermer</Text>
            </TouchableOpacity>

            {videoToPlay && (
              <Video
                ref={videoRef}
                source={{ uri: videoToPlay }}
                style={styles.video}
                controls
                resizeMode="contain"
                paused={false}
                onError={(error) => {
                  console.error('Video error:', error);
                  Alert.alert('Erreur', 'Impossible de lire la vidéo.');
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper function to format dates
const formatDate = (date: Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  submissionCard: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeType: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  submissionInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userId: {
    fontFamily: 'monospace',
    color: colors.text,
  },
  date: {
    color: colors.text,
  },
  viewVideoButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  viewVideoButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border || '#e0e0e0',
    marginHorizontal: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.error + '20',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: colors.success + '20',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  modalInfo: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalInfoSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    gap: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonReject: {
    backgroundColor: colors.error,
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border || '#e0e0e0',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  // Video Modal Styles
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModalContainer: {
    width: '90%',
    aspectRatio: 9 / 16, // Format vertical vidéo mobile
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  videoCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
