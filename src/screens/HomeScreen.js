import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { collection, doc, getDocs, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';
import SkillNode from '../components/SkillNode';
import programs from '../data/programs.json';

// Données statiques en dehors du composant pour éviter les re-calculs
const streetCategory = programs.categories.find(cat => cat.id === 'street');
const streetPrograms = streetCategory?.programs || [];

const HomeScreen = ({ navigation }) => {
  const [userProgress, setUserProgress] = useState({});
  const [completedPrograms, setCompletedPrograms] = useState([]);
  const [lastWorkoutSession, setLastWorkoutSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (userId && !dataLoaded) {
      loadUserData();
      startFadeAnimation();
    }
  }, [userId]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false  // Changé pour éviter l'erreur
    }).start();
  };

  const loadUserData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Charge les progrès utilisateur
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', userId)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progressData = {};
      progressSnapshot.forEach(doc => {
        const data = doc.data();
        progressData[data.programId] = data;
      });
      setUserProgress(progressData);

      // Charge les programmes complétés
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const completed = userData.completedPrograms || [];
      setCompletedPrograms(completed);

      // Charge la dernière séance d'entraînement
      try {
        const workoutQuery = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', userId),
          orderBy('completedAt', 'desc'),
          limit(1)
        );
        const workoutSnapshot = await getDocs(workoutQuery);
        if (!workoutSnapshot.empty) {
          const lastSession = workoutSnapshot.docs[0].data();
          setLastWorkoutSession(lastSession);
        }
      } catch (error) {
        // Aucune séance trouvée
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger vos données');
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  }, [userId]);

  // Calcule les statistiques utilisateur
  const calculateUserStats = () => {
    const totalCompleted = completedPrograms.length;
    const totalXP = completedPrograms.reduce((sum, programId) => {
      const program = streetPrograms.find(p => p.id === programId);
      return sum + (program?.xpReward || 0);
    }, 0);

    // Calcule le tier actuel (le plus haut tier débloqué)
    let currentTier = 0;
    streetPrograms.forEach(program => {
      const isUnlocked = program.prerequisites.length === 0 || 
        program.prerequisites.every(prereq => completedPrograms.includes(prereq));
      if (isUnlocked && program.position.tier > currentTier) {
        currentTier = program.position.tier;
      }
    });

    return { totalCompleted, totalXP, currentTier };
  };

  // Trouve les prochains challenges débloqués
  const getNextUnlockedChallenges = () => {
    const unlocked = streetPrograms.filter(program => {
      const isCompleted = completedPrograms.includes(program.id);
      const isUnlocked = program.prerequisites.length === 0 || 
        program.prerequisites.every(prereq => completedPrograms.includes(prereq));
      return !isCompleted && isUnlocked;
    });

    return unlocked
      .sort((a, b) => a.position.tier - b.position.tier)
      .slice(0, 3);
  };

  // Détermine l'état d'un programme
  const getProgramState = (program) => {
    const isCompleted = completedPrograms.includes(program.id);
    const isUnlocked = program.prerequisites.length === 0 || 
      program.prerequisites.every(prereq => completedPrograms.includes(prereq));
    const progress = userProgress[program.id];
    const hasProgress = progress && progress.currentLevel > 0;

    if (isCompleted) return 'COMPLETED';
    if (hasProgress) return 'IN_PROGRESS';
    if (isUnlocked) return 'UNLOCKED';
    return 'LOCKED';
  };

  // Navigation vers l'arbre de compétences
  const navigateToSkillTree = () => {
    navigation.navigate('SkillTree', { category: streetCategory });
  };

  // Navigation vers un programme spécifique
  const navigateToProgram = (program) => {
    const progress = userProgress[program.id];
    navigation.navigate('ProgramDetail', {
      program,
      category: streetCategory,
      userProgress: progress
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de votre progression...</Text>
      </View>
    );
  }

  const userStats = calculateUserStats();
  const nextChallenges = getNextUnlockedChallenges();
  const hasNoProgress = completedPrograms.length === 0 && Object.keys(userProgress).length === 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Mes Programmes</Text>
        <Text style={styles.subtitle}>
          {hasNoProgress 
            ? "Commence ton aventure ! 🚀" 
            : `Bienvenue dans votre progression Street Workout`
          }
        </Text>
      </Animated.View>

      {/* Card principale Street Workout */}
      <Animated.View style={[styles.mainCardContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={navigateToSkillTree} activeOpacity={0.9}>
          <View style={styles.gradientCard}>
            <View style={styles.mainCardContent}>
              <View style={styles.mainCardHeader}>
                <Text style={styles.mainCardIcon}>🏋️</Text>
                <View style={styles.mainCardInfo}>
                  <Text style={styles.mainCardTitle}>Street Workout</Text>
                  <Text style={styles.mainCardDescription}>
                    Arbre de 20 compétences à débloquer
                  </Text>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.totalCompleted}/20</Text>
                  <Text style={styles.statLabel}>Challenges</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>Tier {userStats.currentTier}</Text>
                  <Text style={styles.statLabel}>Niveau</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.totalXP}</Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={navigateToSkillTree}
                style={styles.skillTreeButton}
                contentStyle={styles.skillTreeButtonContent}
                labelStyle={styles.skillTreeButtonLabel}
              >
                Voir l'arbre
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Section Progression rapide */}
      {nextChallenges.length > 0 && (
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🎯 Prochains défis</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesScroll}>
            {nextChallenges.map((program, index) => (
              <View key={program.id} style={styles.miniNodeContainer}>
                <SkillNode
                  program={program}
                  state={getProgramState(program)}
                  progress={userProgress[program.id]}
                  onPress={() => navigateToProgram(program)}
                  size={60}
                />
                <Text style={styles.miniNodeName} numberOfLines={2}>
                  {program.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Highlight pour débutant */}
      {hasNoProgress && (
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🌱 Commence ici</Text>
          <Card style={styles.beginnerCard}>
            <Card.Content style={styles.beginnerCardContent}>
              <View style={styles.beginnerHeader}>
                <Text style={styles.beginnerIcon}>🌱</Text>
                <View style={styles.beginnerInfo}>
                  <Text style={styles.beginnerTitle}>Fondations Débutant</Text>
                  <Text style={styles.beginnerDescription}>
                    Point de départ pour tous. Construis ta première base de force.
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => {
                  const beginnerProgram = streetPrograms.find(p => p.id === 'beginner-foundation');
                  if (beginnerProgram) navigateToProgram(beginnerProgram);
                }}
                style={styles.beginnerButton}
                contentStyle={styles.beginnerButtonContent}
              >
                Commencer maintenant
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Section Dernière séance */}
      {lastWorkoutSession && (
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>📊 Dernière séance</Text>
          <Card style={styles.lastSessionCard}>
            <Card.Content style={styles.lastSessionContent}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionProgram}>
                  {streetPrograms.find(p => p.id === lastWorkoutSession.programId)?.name || 'Programme'}
                </Text>
                <Text style={styles.sessionDate}>
                  {new Date(lastWorkoutSession.completedAt?.toDate()).toLocaleDateString()}
                </Text>
                <Text style={styles.sessionScore}>
                  Score: {Math.round(lastWorkoutSession.finalScore || 0)}%
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => {
                  const program = streetPrograms.find(p => p.id === lastWorkoutSession.programId);
                  if (program) navigateToProgram(program);
                }}
                style={styles.continueButton}
              >
                Continuer
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  mainCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  gradientCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: colors.primary,
  },
  mainCardContent: {
    padding: 24,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainCardIcon: {
    fontSize: 64,
    marginRight: 16,
  },
  mainCardInfo: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  mainCardDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillTreeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skillTreeButtonContent: {
    paddingVertical: 12,
  },
  skillTreeButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  challengesScroll: {
    paddingVertical: 8,
  },
  miniNodeContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  miniNodeName: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  beginnerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 4,
  },
  beginnerCardContent: {
    padding: 20,
  },
  beginnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  beginnerIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  beginnerInfo: {
    flex: 1,
  },
  beginnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  beginnerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  beginnerButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
  },
  beginnerButtonContent: {
    paddingVertical: 8,
  },
  lastSessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 2,
  },
  lastSessionContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionProgram: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  sessionScore: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    borderColor: colors.primary,
    borderRadius: 8,
  },
});

export default HomeScreen;
