import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import { getFirestore } from '../config/firebase.simple';
const firestore = getFirestore();

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';
import UserHeader from '../components/UserHeader';
import { WorkoutCard } from '../components/cards';
import { getProgramColor } from '../theme/colors';
import { getUserSessionQueue } from '../services/sessionQueueService';
import { loadProgramsMeta, loadProgramDetails } from '../data/programsLoader';

const BACKGROUND_IMAGE = require('../../assets/programmes/street-bg.jpg');

const EntrainementScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState(null);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadAllTrainingData();
    }
  }, [user?.uid]);

  // Recharger les stats quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      if (user?.uid) {
        loadUserStats();
      }
    }, [user?.uid])
  );

  const loadUserStats = async () => {
    try {
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        setUserStats(userDoc.data());
      }
    } catch (error) {
      console.error('❌ loadUserStats error:', error);
    }
  };

  const loadAllTrainingData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('💪 Loading training data (authenticated)');
      
      const [userDoc, queue, history] = await Promise.all([
        firestore.collection('users').doc(user.uid).get(),
        getUserSessionQueue(user.uid),
        loadTrainingHistory()
      ]);

      if (userDoc.exists) {
        setUserStats(userDoc.data());
      }

      setSessionQueue(queue);
      setSessionHistory(history);

    } catch (error) {
      console.error('❌ loadAllTrainingData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingHistory = async () => {
    try {
      const snapshot = await firestore
        .collection('workoutSessions')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      // Filtrer UNIQUEMENT les trainings (pas les challenges)
      const trainings = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(session => {
          // Si type est défini, exclure les challenges
          if (session.type) {
            return session.type !== 'challenge';
          }
          // Sinon, heuristique: trainings ont plusieurs exercices
          return session.exercises?.length > 1;
        });

      console.log('🏋️ Training history loaded:', trainings.length);
      return trainings;
    } catch (error) {
      console.error('❌ loadTrainingHistory error:', error);
      // Si erreur d'index manquant
      if (error.message?.includes('index') || error.code === 'failed-precondition') {
        console.warn('🔥 INDEX FIRESTORE MANQUANT');
      }
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllTrainingData();
    setRefreshing(false);
  };

  const handlePreviewSession = async (session) => {
    try {
      // Charger les détails du programme et du niveau
      const meta = await loadProgramsMeta();
      const category = meta.categories.find(cat => cat.id === session.programId);
      
      if (!category) {
        console.error('Programme non trouvé');
        return;
      }
      
      const skillDetails = await loadProgramDetails(session.programId, session.skillId);
      if (!skillDetails) {
        console.error('Compétence non trouvée');
        return;
      }

      // Naviguer vers l'écran de preview/détails du workout
      navigation.navigate('ReviewWorkout', {
        program: {
          id: session.programId,
          name: category.name,
          icon: category.icon,
        },
        level: {
          id: session.skillId,
          number: session.levelNumber || 1,
          name: skillDetails.name,
          exercises: session.exercises || [],
        },
        mode: 'preview', // Mode preview pour juste voir sans démarrer
      });
    } catch (error) {
      console.error('❌ Error previewing session:', error);
    }
  };

  const handleStartSession = async (session) => {
    try {
      const meta = await loadProgramsMeta();
      const category = meta.categories.find(cat => cat.id === session.programId);
      
      if (!category) {
        console.error('Programme non trouvé');
        return;
      }
      
      const skillDetails = await loadProgramDetails(session.programId, session.skillId);
      if (!skillDetails) {
        console.error('Compétence non trouvée');
        return;
      }
      
      const levelIndex = session.levelNumber - 1;
      const level = skillDetails.levels?.[levelIndex];
      if (!level) {
        console.error('Niveau non trouvé');
        return;
      }
      
      const programData = {
        id: session.skillId,
        name: skillDetails.name,
        icon: skillDetails.icon,
        color: skillDetails.color,
        difficulty: skillDetails.difficulty,
      };

      navigation.navigate('Workout', {
        programId: session.programId,
        program: programData,
        level: {
          ...level,
          number: session.levelNumber,
        },
        queueId: session.id,
      });
    } catch (error) {
      console.error('handleStartSession error:', error);
    }
  };

  const formatDate = (t) => {
    if (!t) return '';
    const d = t.toDate ? t.toDate() : new Date(t);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 900) return '#4ADE80';
    if (score >= 750) return '#60A5FA';
    if (score >= 600) return '#FBBF24';
    return '#F87171';
  };

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* USER HEADER */}
          <UserHeader
            username={userStats?.displayName || 'Utilisateur'}
            globalLevel={userStats?.globalLevel || 0}
            globalXP={userStats?.globalXP || 0}
            title={userStats?.title || 'Débutant'}
            streak={userStats?.streakDays || 0}
            avatarId={userStats?.avatarId || 0}
            userId={user?.uid}
            onPress={() => navigation.navigate('Profile')}
            enableUsernameEdit={false}
          />

          {/* ENTRAÎNEMENTS DISPONIBLES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Entraînements disponibles</Text>
            {loading ? (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <ActivityIndicator size="small" color={colors.primary} />
                </Card.Content>
              </Card>
            ) : sessionQueue.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyIcon}>💪</Text>
                  <Text style={styles.emptyTitle}>Aucun entraînement en file</Text>
                  <Text style={styles.emptySubtext}>
                    Active un programme pour commencer !
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('Programme')}
                  >
                    <Text style={styles.emptyButtonText}>Voir les programmes</Text>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            ) : (
              sessionQueue.map(session => (
                <View key={session.id} style={styles.workoutWrapper}>
                  <WorkoutCard
                    session={session}
                    programColor={getProgramColor(session.programId)}
                    onPreview={() => handlePreviewSession(session)}
                    onStart={() => handleStartSession(session)}
                    disabled={session.status === 'completed'}
                  />
                </View>
              ))
            )}
          </View>

          {/* HISTORIQUE DES ENTRAÎNEMENTS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 Historique des Entraînements</Text>
            {loading ? (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <ActivityIndicator size="small" color={colors.primary} />
                </Card.Content>
              </Card>
            ) : sessionHistory.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={styles.emptyTitle}>Aucune séance effectuée</Text>
                  <Text style={styles.emptySubtext}>
                    Commence ton premier entraînement !
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.historyList}>
                {sessionHistory.map((session) => {
                  const isChallenge = session.type === 'challenge';
                  const displayName = isChallenge 
                    ? `🏆 ${session.exercises?.[0]?.name || 'Challenge'}` 
                    : (session.skillName || session.workoutName || 'Séance');
                  const displayIcon = isChallenge ? '🏆' : (session.programIcon || '💪');
                  
                  return (
                    <View key={session.id} style={[
                      styles.historyCard,
                      isChallenge && styles.historyChallengeCard
                    ]}>
                      <View style={styles.historyHeader}>
                        <View style={[
                          styles.historyIconContainer,
                          isChallenge && styles.historyChallengeIconContainer
                        ]}>
                          <Text style={styles.historyIcon}>{displayIcon}</Text>
                        </View>
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyName} numberOfLines={1}>
                            {displayName}
                          </Text>
                          <Text style={styles.historyDate}>
                            {formatDate(session.createdAt || session.endTime || session.date)}
                          </Text>
                        </View>
                        <View style={styles.historyStatus}>
                          {isChallenge ? (
                            <>
                              <Text style={styles.historyChallengeText}>VALIDÉ</Text>
                              <Text style={styles.historyStatusLabel}>challenge</Text>
                            </>
                          ) : (
                            <>
                              <Text style={[styles.historyScore, { color: getScoreColor(session.score || 0) }]}>
                                {session.score || 0}
                              </Text>
                              <Text style={styles.historyStatusLabel}>pts</Text>
                            </>
                          )}
                        </View>
                      </View>
                      <View style={styles.historyStats}>
                        {[
                          { label: 'XP gagné', value: '+' + (session.xpEarned || 0) },
                          { label: isChallenge ? 'Type' : 'Exercices', value: isChallenge ? 'Challenge' : (session.exercises?.length || 0) },
                          { label: 'Niveau', value: session.levelNumber || 1 }
                        ].map(stat => (
                          <View key={stat.label} style={styles.historyStat}>
                            <Text style={styles.historyStatLabel}>{stat.label}</Text>
                            <Text style={[
                              styles.historyStatValue,
                              { color: isChallenge ? '#FFD700' : rpgTheme.colors.neon.blue }
                            ]}>
                              {stat.value}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  workoutWrapper: {
    marginBottom: 12,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
  },
  historyChallengeCard: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },
  historyChallengeIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  historyIcon: {
    fontSize: 24,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  historyStatus: {
    alignItems: 'center',
  },
  historyScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  historyChallengeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  historyStatusLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default EntrainementScreen;
