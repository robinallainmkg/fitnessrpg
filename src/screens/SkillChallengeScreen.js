import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { getFirestore } from '../config/firebase.simple';

const firestore = getFirestore();

/**
 * Écran pour présenter et tenter le challenge vidéo d'un niveau
 * - Affiche les critères de validation
 * - Gère les 3 tentatives max par jour
 * - Options: Training / Challenge Video / Skip
 */
const SkillChallengeScreen = ({ route, navigation }) => {
  const { program, level } = route.params;
  const { user } = useAuth();
  const { skipChallenge } = useWorkout();
  
  const [attemptsToday, setAttemptsToday] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState(null); // 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallengeStatus();
  }, []);

  const loadChallengeStatus = async () => {
    if (!user?.uid) return;

    try {
      // Vérifier le statut du challenge
      const challengesRef = firestore
        .collection('skillChallenges')
        .where('userId', '==', user.uid)
        .where('programId', '==', program.id)
        .where('levelId', '==', level.id);

      const snapshot = await challengesRef.get();
      
      if (!snapshot.empty) {
        const challengeDoc = snapshot.docs[0].data();
        setChallengeStatus(challengeDoc.status);

        // Compter les tentatives d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todayAttempts = (challengeDoc.attempts || []).filter(attempt => {
          const attemptDate = attempt.date.toDate().toISOString().split('T')[0];
          return attemptDate === today;
        });
        setAttemptsToday(todayAttempts.length);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading challenge status:', error);
      setLoading(false);
    }
  };

  const canAttempt = attemptsToday < (level.challenge?.maxAttemptsPerDay || 3);

  const handleGoToTraining = () => {
    navigation.navigate('Workout', {
      program,
      level,
      mode: 'training'
    });
  };

  const handleStartChallenge = () => {
    if (!canAttempt) {
      Alert.alert(
        '⏰ Limite atteinte',
        'Tu as déjà fait 3 tentatives aujourd\'hui. Reviens demain ou entraîne-toi en attendant !',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('Challenge', {
      challengeType: 'skill',
      programId: program.id,
      levelId: level.id,
      challenge: level.challenge
    });
  };

  const handleSkipChallenge = () => {
    Alert.alert(
      '⚠️ Passer sans validation ?',
      `Tu peux continuer sans faire le challenge vidéo, mais tu ne gagneras pas les ${level.xpReward} XP. Tu pourras revenir le faire plus tard.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer sans XP',
          style: 'destructive',
          onPress: async () => {
            try {
              // Utiliser la méthode du WorkoutContext
              await skipChallenge(program.id, level.id);

              Alert.alert(
                '✅ Niveau passé',
                'Tu peux maintenant accéder au niveau suivant. Reviens faire ce challenge quand tu veux !',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('SkillTree', { program })
                  }
                ]
              );
            } catch (error) {
              console.error('Error skipping challenge:', error);
              Alert.alert('Erreur', 'Impossible de passer le challenge');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  const challenge = level.challenge;

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.levelName}>{level.name}</Text>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>

        {/* Status du challenge */}
        {challengeStatus === 'approved' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>✅</Text>
            <Text style={styles.statusTitle}>Challenge Validé !</Text>
            <Text style={styles.statusText}>
              Tu as gagné {level.xpReward} XP
            </Text>
          </View>
        )}

        {challengeStatus === 'pending' && (
          <View style={[styles.statusCard, styles.statusPending]}>
            <Text style={styles.statusIcon}>⏳</Text>
            <Text style={styles.statusTitle}>En attente de validation</Text>
            <Text style={styles.statusText}>
              Ta vidéo est en cours de review
            </Text>
          </View>
        )}

        {challengeStatus === 'rejected' && (
          <View style={[styles.statusCard, styles.statusRejected]}>
            <Text style={styles.statusIcon}>❌</Text>
            <Text style={styles.statusTitle}>Challenge refusé</Text>
            <Text style={styles.statusText}>
              Entraîne-toi et réessaie !
            </Text>
          </View>
        )}

        {/* Requirements Card */}
        <View style={styles.requirementsCard}>
          <Text style={styles.requirementTitle}>📋 Objectif du Challenge</Text>
          
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>
              {challenge.requirements.exercise}
            </Text>
            <View style={styles.repsTarget}>
              <Text style={styles.repsNumber}>{challenge.requirements.reps}</Text>
              <Text style={styles.repsLabel}>répétitions</Text>
            </View>
          </View>

          <Text style={styles.criteriaTitleStyle}>✅ Critères de validation</Text>
          {challenge.requirements.validationCriteria.map((criteria, index) => (
            <View key={index} style={styles.criteriaItem}>
              <Text style={styles.criteriaText}>{criteria}</Text>
            </View>
          ))}

          {challenge.requirements.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsText}>{challenge.requirements.tips}</Text>
            </View>
          )}
        </View>

        {/* Attempts Card */}
        <View style={styles.attemptsCard}>
          <View style={styles.attemptsHeader}>
            <Text style={styles.attemptsTitle}>🎯 Tentatives</Text>
            <Text style={styles.attemptsCount}>
              {attemptsToday}/{challenge.maxAttemptsPerDay} aujourd'hui
            </Text>
          </View>
          
          {!canAttempt && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⏰ Reviens demain pour de nouvelles tentatives !
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Bouton Entraînement */}
          <TouchableOpacity
            style={styles.trainingButton}
            onPress={handleGoToTraining}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>🏋️ S'entraîner d'abord</Text>
              <Text style={styles.buttonSubtext}>Mode entraînement - Pas d'XP</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bouton Challenge */}
          {challengeStatus !== 'approved' && (
            <TouchableOpacity
              style={[styles.challengeButton, !canAttempt && styles.disabled]}
              disabled={!canAttempt || challengeStatus === 'pending'}
              onPress={handleStartChallenge}
            >
              <LinearGradient
                colors={
                  canAttempt && challengeStatus !== 'pending'
                    ? ['#10B981', '#059669']
                    : ['#6B7280', '#4B5563']
                }
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {challengeStatus === 'pending'
                    ? '⏳ En attente de validation'
                    : `🎥 Faire le challenge (+${level.xpReward} XP)`}
                </Text>
                {canAttempt && challengeStatus !== 'pending' && (
                  <Text style={styles.buttonSubtext}>
                    Durée vidéo: {challenge.videoMinDuration}-{challenge.videoMaxDuration}s
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Bouton Skip */}
          {challengeStatus !== 'approved' && challengeStatus !== 'pending' && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipChallenge}
            >
              <Text style={styles.skipButtonText}>⏭️ Passer sans XP</Text>
              <Text style={styles.skipButtonSubtext}>
                Tu pourras revenir plus tard
              </Text>
            </TouchableOpacity>
          )}

          {/* Bouton Voir l'arbre - Toujours visible */}
          <TouchableOpacity
            style={styles.viewTreeButton}
            onPress={() => navigation.navigate('SkillTree', { programId: program.category })}
          >
            <Text style={styles.viewTreeButtonText}>🌳 Voir l'arbre de compétences</Text>
            <Text style={styles.viewTreeButtonSubtext}>
              Explorer tous les niveaux du programme
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  levelName: {
    fontSize: 16,
    color: '#7B61FF',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  challengeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },

  // Status Card
  statusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // Requirements Card
  requirementsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  requirementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  exerciseInfo: {
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 12,
  },
  repsTarget: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(123, 97, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  repsNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7B61FF',
    marginRight: 8,
  },
  repsLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  criteriaTitleStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  criteriaItem: {
    marginBottom: 8,
  },
  criteriaText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  tipsBox: {
    marginTop: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FBB936',
  },
  tipsText: {
    fontSize: 14,
    color: '#FBB936',
    lineHeight: 20,
  },

  // Attempts Card
  attemptsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.2)',
  },
  attemptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attemptsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  attemptsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7B61FF',
  },
  warningBox: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },

  // Actions
  actions: {
    gap: 12,
  },
  trainingButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  challengeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  skipButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  skipButtonSubtext: {
    fontSize: 13,
    color: '#64748B',
  },
  viewTreeButton: {
    backgroundColor: 'rgba(123, 97, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.4)',
    marginTop: 12,
  },
  viewTreeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B61FF',
    marginBottom: 4,
  },
  viewTreeButtonSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default SkillChallengeScreen;
