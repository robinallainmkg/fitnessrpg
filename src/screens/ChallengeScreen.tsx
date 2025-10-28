import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useChallenge } from '../contexts/ChallengeContext';
import { useVideoPicker } from '../hooks/useVideoPicker';
import { getChallengeLabel } from '../types/Challenge';
import { colors } from '../theme/colors';

export const ChallengeScreen = () => {
  const { user, isGuest } = useAuth();
  const {
    todayChallenge,
    loadingChallenge,
    loadTodayChallenge,
    isUploading,
    uploadProgress,
    submitChallenge,
    error,
    success,
    clearMessages,
  } = useChallenge();

  const {
    recordedVideoUri,
    isRecording,
    recordVideo,
    pickVideo,
    resetVideo,
    requestPermissions,
  } = useVideoPicker();

  // Load today's challenge on mount
  useEffect(() => {
    if (user && !isGuest) {
      loadTodayChallenge(user.uid);
    }
  }, [user, isGuest]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => clearMessages(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleOpenCamera = async () => {
    const granted = await requestPermissions();
    if (granted) {
      resetVideo();
      const videoUri = await recordVideo();
      if (!videoUri) {
        Alert.alert(
          'Enregistrement annulé',
          'Aucune vidéo n\'a été enregistrée.'
        );
      }
    } else {
      Alert.alert(
        'Permissions requises',
        'L\'accès à la caméra est nécessaire pour enregistrer une vidéo.'
      );
    }
  };

  const handleSubmit = () => {
    if (!recordedVideoUri || !user || !todayChallenge) return;

    Alert.alert(
      'Confirmer la soumission',
      `Soumettre votre vidéo pour le challenge "${getChallengeLabel(todayChallenge.challengeType)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            await submitChallenge(recordedVideoUri, user.uid, todayChallenge.challengeType);
            resetVideo();
          },
        },
      ]
    );
  };

  const handleRetry = async () => {
    resetVideo();
    const videoUri = await recordVideo();
    if (!videoUri) {
      Alert.alert(
        'Enregistrement annulé',
        'Aucune vidéo n\'a été enregistrée.'
      );
    }
  };

  // Loading state
  if (loadingChallenge) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du challenge...</Text>
      </View>
    );
  }

  // Guest user
  if (isGuest) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>🎯 Challenge du jour</Text>
        <Text style={styles.guestMessage}>
          Créez un compte pour participer aux challenges quotidiens !
        </Text>
      </View>
    );
  }

  // No user
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>🎯 Challenge du jour</Text>
        <Text style={styles.guestMessage}>
          Connectez-vous pour participer aux challenges !
        </Text>
      </View>
    );
  }

  // Already submitted
  if (todayChallenge?.submitted) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🎯 Challenge du jour</Text>
        <View style={styles.challengeCard}>
          <Text style={styles.challengeType}>
            {todayChallenge ? getChallengeLabel(todayChallenge.challengeType) : ''}
          </Text>
          <View style={styles.successBanner}>
            <Text style={styles.successEmoji}>✓</Text>
            <Text style={styles.successText}>Challenge soumis !</Text>
          </View>
          <Text style={styles.submittedMessage}>
            Votre vidéo est en cours de validation.{'\n'}
            Revenez demain pour un nouveau challenge !
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Main challenge view
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎯 Challenge du jour</Text>

      {todayChallenge && (
        <View style={styles.challengeCard}>
          <Text style={styles.challengeType}>
            {getChallengeLabel(todayChallenge.challengeType)}
          </Text>
          <Text style={styles.challengeDescription}>
            Complétez ce challenge et soumettez votre vidéo pour gagner des XP !
          </Text>
        </View>
      )}

      {/* Video recorded - Preview */}
      {recordedVideoUri ? (
        <View style={styles.previewContainer}>
          <View style={styles.previewBox}>
            <Text style={styles.previewIcon}>🎥</Text>
            <Text style={styles.previewText}>Vidéo enregistrée !</Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}> {uploadProgress}%</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Soumettre</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleRetry}
              disabled={isUploading}
            >
              <Text style={styles.buttonSecondaryText}>Réenregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.buttonLarge]}
          onPress={handleOpenCamera}
        >
          <Text style={styles.buttonLargeText}>📹 Enregistrer une vidéo</Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearMessages}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {success && (
        <View style={styles.successBox}>
          <Text style={styles.successBoxText}>{success}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  guestMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeType: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successBanner: {
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success,
  },
  submittedMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonLarge: {
    backgroundColor: colors.primary,
    padding: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLargeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    flex: 1,
  },
  dismissText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  successBox: {
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  successBoxText: {
    color: colors.success,
    fontSize: 14,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  flipButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  recordButton: {
    backgroundColor: colors.error,
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#666',
  },
  recordButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
});
