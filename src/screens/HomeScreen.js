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

      // TEMPORAIRE: Données mock au lieu de Firebase
      console.log('📱 MOCK: Chargement données utilisateur...');
      
      // Mock user progress - utilisons les vrais IDs des compétences
      const progressData = {
        'beginner-foundation': { currentLevel: 2, unlockedLevels: [1, 2], xp: 150 },
        'strict-pullups': { currentLevel: 1, unlockedLevels: [1], xp: 50 }
      };
      setUserProgress(progressData);

      // Mock programmes complétés - aucun pour voir "en cours"
      const completed = []; // Vidé pour tester l'affichage "en cours"
      setCompletedPrograms(completed);

      // Mock dernière séance avec Timestamp simulé
      const lastSession = {
        programId: 'beginner-foundation',
        levelId: 2,
        completedAt: {
          toDate: () => new Date() // Simule un Firestore Timestamp
        },
        finalScore: 85
      };
      setLastWorkoutSession(lastSession);

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

  // Trouve les compétences en cours (commencées, pas terminées ET débloquées)
  const getSkillsInProgress = () => {
    const inProgress = streetPrograms.filter(skill => {
      const isCompleted = completedPrograms.includes(skill.id);
      const isUnlocked = skill.prerequisites.length === 0 || 
        skill.prerequisites.every(prereq => completedPrograms.includes(prereq));
      const progress = userProgress[skill.id];
      const hasProgress = progress && (progress.currentLevel > 0 || progress.unlockedLevels?.length > 0);
      
      // Doit être: pas complétée, débloquée, ET avoir des progrès
      return !isCompleted && isUnlocked && hasProgress;
    }).slice(0, 3);
    
    return inProgress;
  };

  // Trouve les prochaines compétences débloquées
  const getNextUnlockedSkills = () => {
    const unlocked = streetPrograms.filter(program => {
      const isCompleted = completedPrograms.includes(program.id);
      const isUnlocked = program.prerequisites.length === 0 || 
        program.prerequisites.every(prereq => completedPrograms.includes(prereq));
      const progress = userProgress[program.id];
      const hasProgress = progress && progress.currentLevel > 0;
      return !isCompleted && isUnlocked && !hasProgress; // Exclut celles en cours
    });

    return unlocked
      .sort((a, b) => a.position.tier - b.position.tier)
      .slice(0, 3);
  };

  // Détermine l'état d'une compétence
  const getSkillState = (skill) => {
    const isCompleted = completedPrograms.includes(skill.id);
    const isUnlocked = skill.prerequisites.length === 0 || 
      skill.prerequisites.every(prereq => completedPrograms.includes(prereq));
    const progress = userProgress[skill.id];
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

  // Navigation vers une compétence spécifique
  const navigateToSkill = (skill) => {
    const progress = userProgress[skill.id];
    navigation.navigate('ProgramDetail', {
      program: skill,
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
  const skillsInProgress = getSkillsInProgress();
  const nextSkills = getNextUnlockedSkills();
  const hasNoProgress = completedPrograms.length === 0 && Object.keys(userProgress).length === 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Les Programmes disponibles</Text>
        {hasNoProgress && (
          <Text style={styles.subtitle}>Commence ton aventure ! 🚀</Text>
        )}
      </Animated.View>

      {/* Card principale Street Workout */}
      <Animated.View style={[styles.mainCardContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={navigateToSkillTree} activeOpacity={0.9}>
          <View style={styles.gradientCard}>
            <View style={styles.mainCardContent}>
              <View style={styles.mainCardHeader}>
                <Text style={styles.mainCardIcon}>🏋️</Text>
                <View style={styles.mainCardInfo}>
                  <Text style={styles.mainCardTitle}>Programme Street Workout</Text>
                  <Text style={styles.mainCardDescription}>
                    20 compétences à débloquer
                  </Text>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userStats.totalCompleted}/20</Text>
                  <Text style={styles.statLabel}>Débloquées</Text>
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
                Voir le programme
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Section Compétences en cours */}
      {skillsInProgress.length > 0 && (
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>⚡ Compétences en cours d'apprentissage</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesScroll}>
            {skillsInProgress.map((skill, index) => (
              <View key={skill.id} style={styles.miniNodeContainer}>
                <SkillNode
                  program={skill}
                  state={getSkillState(skill)}
                  progress={userProgress[skill.id]}
                  onPress={() => navigateToSkill(skill)}
                  size={60}
                />
                <Text style={styles.miniNodeName} numberOfLines={2}>
                  {skill.name}
                </Text>
                <Text style={styles.miniNodeProgress}>
                  Niveau {userProgress[skill.id]?.currentLevel || 1}/{skill.levels?.length || 'N/A'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Section Progression rapide */}
      {nextSkills.length > 0 && (
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🎯 À débloquer bientôt</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesScroll}>
            {nextSkills.map((skill, index) => (
              <View key={skill.id} style={styles.miniNodeContainer}>
                <SkillNode
                  program={skill}
                  state={getSkillState(skill)}
                  progress={userProgress[skill.id]}
                  onPress={() => navigateToSkill(skill)}
                  size={60}
                />
                <Text style={styles.miniNodeName} numberOfLines={2}>
                  {skill.name}
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
                  const beginnerSkill = streetPrograms.find(p => p.id === 'beginner-foundation');
                  if (beginnerSkill) navigateToSkill(beginnerSkill);
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
                  {streetPrograms.find(p => p.id === lastWorkoutSession.programId)?.name || 'Compétence'}
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
                  const skill = streetPrograms.find(p => p.id === lastWorkoutSession.programId);
                  if (skill) navigateToSkill(skill);
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
  miniNodeProgress: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
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
    fontSize: 40,
    marginRight: 12,
    textAlign: 'center',
    width: 50,
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
