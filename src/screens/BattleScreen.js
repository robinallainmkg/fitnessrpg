import React, { useState, useEffect, useRef } from 'react';
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
import { useChallenge } from '../contexts/ChallengeContext';
import { colors } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';
import UserHeader from '../components/UserHeader';
import DailyChallengeCard from '../components/DailyChallengeCard';
import QuestePrincipale from '../components/QuestePrincipale';
import ChallengeCard from '../components/ChallengeCard';
import { getAvailableChallenges, recommendTodayChallenge } from '../services/skillChallengeService';

const BACKGROUND_IMAGE = require('../../assets/programmes/street-bg.jpg');

const BattleScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState(null);
  const [todaySkillChallenge, setTodaySkillChallenge] = useState(null);
  const [skillChallenges, setSkillChallenges] = useState([]);
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastLoadRef = useRef(0); // Pour éviter de recharger trop souvent
  
  const { user } = useAuth();
  const { todayChallenge, loadingChallenge, loadTodayChallenge } = useChallenge();

  // Recharger toutes les données quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      if (user?.uid) {
        const now = Date.now();
        // Recharger seulement si la dernière charge date de plus de 2 secondes
        if (now - lastLoadRef.current > 2000) {
          console.log('🔄 BattleScreen focused - reloading challenges');
          lastLoadRef.current = now;
          // Rechargement optimisé : seulement challenges + stats (pas historique)
          loadChallengesOnly();
        } else {
          console.log('⏭️ Skip reload - too soon');
        }
      }
    }, [user?.uid])
  );

  const loadChallengesOnly = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('⚡ Quick reload: challenges only');
      
      // Charger en parallèle : stats + challenges
      const [userStatsData, allChallenges] = await Promise.all([
        loadUserStats(),
        getAvailableChallenges(user.uid)
      ]);

      console.log('📋 Challenges reloaded:', allChallenges?.length || 0);

      // Recommander le skill challenge du jour
      if (allChallenges && allChallenges.length > 0 && userStatsData) {
        const recommended = recommendTodayChallenge(allChallenges, userStatsData);
        if (recommended) {
          setTodaySkillChallenge(recommended);
          console.log('🎯 Today skill challenge:', recommended.title);
        } else {
          setTodaySkillChallenge(null);
        }
      } else {
        setTodaySkillChallenge(null);
        setSkillChallenges([]);
      }

      // Tous les skill challenges
      if (allChallenges && allChallenges.length > 0) {
        setSkillChallenges(allChallenges);
      } else {
        setSkillChallenges([]);
      }

    } catch (error) {
      console.error('❌ loadChallengesOnly error:', error);
    }
  };

  const loadAllBattleData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('⚔️ Loading battle data (authenticated)');
      
      // Charger les stats d'abord
      const userStatsData = await loadUserStats();
      
      // Puis charger challenges et historique
      const [allChallenges, history] = await Promise.all([
        getAvailableChallenges(user.uid),
        loadChallengeHistory()
      ]);

      console.log('📋 All challenges loaded:', allChallenges?.length || 0);

      // Charger le daily challenge (défi quotidien vidéo)
      if (loadTodayChallenge) {
        await loadTodayChallenge(user.uid);
      }

      // Recommander le skill challenge du jour
      if (allChallenges && allChallenges.length > 0 && userStatsData) {
        const recommended = recommendTodayChallenge(allChallenges, userStatsData);
        if (recommended) {
          setTodaySkillChallenge(recommended);
          console.log('🎯 Today skill challenge:', recommended.title);
        } else {
          console.warn('⚠️ recommendTodayChallenge returned null');
        }
      } else {
        console.warn('⚠️ Cannot recommend challenge:', {
          hasChallenges: !!allChallenges?.length,
          hasUserStats: !!userStatsData
        });
      }

      // Tous les skill challenges
      if (allChallenges && allChallenges.length > 0) {
        setSkillChallenges(allChallenges);
        console.log('✅ Skill challenges set:', allChallenges.length);
      } else {
        console.warn('⚠️ No challenges found - user may not have active programs');
        setTodaySkillChallenge(null);
        setSkillChallenges([]);
      }

      setChallengeHistory(history);

    } catch (error) {
      console.error('❌ loadAllBattleData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      const data = userDoc.exists ? userDoc.data() : null;
      if (data) {
        setUserStats(data);
      }
      return data;
    } catch (error) {
      console.error('❌ loadUserStats error:', error);
      return null;
    }
  };

  const loadChallengeHistory = async () => {
    try {
      const snapshot = await firestore
        .collection('workoutSessions')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      // Filtrer les challenges côté client
      // Un challenge a soit type='challenge', soit exercises.length === 1 (un seul exercice avec reps)
      const challenges = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(session => {
          // Si type est défini, l'utiliser
          if (session.type) {
            return session.type === 'challenge';
          }
          // Sinon, heuristique: challenges ont généralement 1 exercice
          // (les trainings ont plusieurs exercices)
          return session.exercises?.length === 1;
        });

      console.log('📜 Challenge history loaded:', challenges.length);
      return challenges;
    } catch (error) {
      console.error('❌ loadChallengeHistory error:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllBattleData();
    setRefreshing(false);
  };

  const handleChallengePress = (challenge) => {
    navigation.navigate('SkillChallenge', {
      programId: challenge.programId,
      levelId: challenge.levelId,
    });
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

          {/* DÉFI DU JOUR - DAILY CHALLENGE (VIDEO) */}
          <DailyChallengeCard
            challenge={todayChallenge}
            hasSubmitted={todayChallenge?.submitted || false}
            loading={loadingChallenge}
            onPress={() => navigation.navigate('Challenge')}
          />

          {/* QUÊTE DU JOUR - SKILL CHALLENGE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Quête du Jour</Text>
            {loading ? (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <ActivityIndicator size="small" color={colors.primary} />
                </Card.Content>
              </Card>
            ) : todaySkillChallenge ? (
              <QuestePrincipale
                challenge={todaySkillChallenge}
                onPress={() => handleChallengePress(todaySkillChallenge)}
              />
            ) : skillChallenges.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyIcon}>⚔️</Text>
                  <Text style={styles.emptyTitle}>Aucune quête disponible</Text>
                  <Text style={styles.emptySubtext}>
                    Active un programme pour débloquer des quêtes !
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
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyIcon}>⏳</Text>
                  <Text style={styles.emptyTitle}>Pas de quête aujourd'hui</Text>
                  <Text style={styles.emptySubtext}>
                    Tous les challenges ont été complétés ou sont en attente !
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>

          {/* AUTRES QUÊTES PRINCIPALES */}
          {skillChallenges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚔️ Quêtes Principales</Text>
              {skillChallenges
                .filter(c => c.status === 'available' || c.status === 'pending' || c.status === 'rejected')
                .slice(0, 5)
                .map((challenge) => (
                  <View key={`${challenge.programId}_${challenge.levelId}`} style={styles.challengeWrapper}>
                    <ChallengeCard
                      challenge={challenge}
                      onPress={() => handleChallengePress(challenge)}
                    />
                  </View>
                ))}
            </View>
          )}

          {/* HISTORIQUE DES CHALLENGES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 Historique des Batailles</Text>
            {loading ? (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <ActivityIndicator size="small" color={colors.primary} />
                </Card.Content>
              </Card>
            ) : challengeHistory.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyIcon}>⚔️</Text>
                  <Text style={styles.emptyTitle}>Aucune bataille encore</Text>
                  <Text style={styles.emptySubtext}>
                    Complète ton premier challenge pour commencer !
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.historyList}>
                {challengeHistory.map((session) => {
                  const displayName = session.exercises?.[0]?.name || 'Challenge';
                  const displayIcon = session.programIcon || '🏆';
                  
                  return (
                    <View key={session.id} style={styles.historyCard}>
                      <View style={styles.historyHeader}>
                        <View style={styles.historyIconContainer}>
                          <Text style={styles.historyIcon}>{displayIcon}</Text>
                        </View>
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyName} numberOfLines={1}>
                            🏆 {displayName}
                          </Text>
                          <Text style={styles.historyDate}>
                            {formatDate(session.createdAt || session.endTime || session.date)}
                          </Text>
                        </View>
                        <View style={styles.historyStatus}>
                          <Text style={styles.historyStatusText}>VALIDÉ</Text>
                          <Text style={styles.historyStatusLabel}>challenge</Text>
                        </View>
                      </View>
                      <View style={styles.historyStats}>
                        {[
                          { label: 'XP gagné', value: '+' + (session.xpEarned || 0) },
                          { label: 'Type', value: 'Challenge' },
                          { label: 'Niveau', value: session.levelNumber || 1 }
                        ].map(stat => (
                          <View key={stat.label} style={styles.historyStat}>
                            <Text style={styles.historyStatLabel}>{stat.label}</Text>
                            <Text style={styles.historyStatValue}>{stat.value}</Text>
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
  challengeWrapper: {
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
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#4D9EFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
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
  historyStatusText: {
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
    color: '#FFD700',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default BattleScreen;
