import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar
} from 'react-native-paper';
import { AuthContext } from '../contexts/AuthContext';
import { getUserData, getUserProgress, getUserWorkoutSessions } from '../services/firebase';
import { colors } from '../theme/colors';
import { programs } from '../data/programs.json';
import UserHeader from '../components/UserHeader';
import UserStatsCard from '../components/UserStatsCard';

// Données statiques
const streetCategory = programs.categories.find(cat => cat.id === 'street');
const streetPrograms = streetCategory?.programs || [];

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [inProgressSkills, setInProgressSkills] = useState([]);
  const [upcomingSkills, setUpcomingSkills] = useState([]);
  const [lastSession, setLastSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userProgress, setUserProgress] = useState({});
  const [lastWorkoutSession, setLastWorkoutSession] = useState(null);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Charger données utilisateur
      const userDataFromDB = await getUserData(user.uid);
      setUserData(userDataFromDB);

      // Charger le progrès
      const progress = await getUserProgress(user.uid);
      setUserProgress(progress);
      
      // Charger dernière session
      await loadLastWorkoutSession();
      
      // Charger les compétences en cours
      await loadInProgressSkills();
      
      // Calculer les prochaines compétences recommandées
      calculateUpcomingSkills(userDataFromDB);
      
      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      Alert.alert('Erreur', 'Impossible de charger vos données');
    } finally {
      setLoading(false);
    }
  };

  const loadLastWorkoutSession = async () => {
    try {
      const sessions = await getUserWorkoutSessions(user.uid, 1);
      if (sessions.length > 0) {
        setLastWorkoutSession(sessions[0]);
      }
    } catch (error) {
      console.error('Erreur chargement dernière session:', error);
    }
  };

  const loadInProgressSkills = async () => {
    try {
      const progressSnapshot = await getUserProgress(user.uid);
      const inProgress = [];
      
      Object.entries(progressSnapshot).forEach(([skillId, progressData]) => {
        if (progressData.currentSession && !progressData.isCompleted) {
          const skill = streetPrograms.find(p => p.id === skillId);
          if (skill) {
            inProgress.push({
              ...skill,
              progress: progressData
            });
          }
        }
      });
      
      setInProgressSkills(inProgress.slice(0, 3)); // Limiter à 3
    } catch (error) {
      console.error('Erreur chargement skills en cours:', error);
    }
  };

  const calculateUpcomingSkills = (userDataFromDB) => {
    if (!userDataFromDB.programs?.street?.unlockedSkills) {
      // Premier skill pour nouveaux utilisateurs
      const firstSkill = streetPrograms.find(p => p.id === 'beginner-foundation');
      if (firstSkill) {
        setUpcomingSkills([firstSkill]);
      }
      return;
    }

    const unlockedSkills = userDataFromDB.programs.street.unlockedSkills || [];
    const completedSkills = userDataFromDB.programs.street.completedSkills || [];
    
    // Trouve les compétences disponibles non commencées
    const available = streetPrograms.filter(skill => {
      // Doit être débloquée
      const isUnlocked = unlockedSkills.includes(skill.id);
      // Ne doit pas être terminée
      const notCompleted = !completedSkills.includes(skill.id);
      // Ne doit pas être en cours
      const notInProgress = !inProgressSkills.some(ip => ip.id === skill.id);
      
      return isUnlocked && notCompleted && notInProgress;
    });
    
    // Trier par position dans l'arbre et prendre les 3 premiers
    const sorted = available.sort((a, b) => {
      if (a.position.tier !== b.position.tier) {
        return a.position.tier - b.position.tier;
      }
      return a.position.x - b.position.x;
    });
    
    setUpcomingSkills(sorted.slice(0, 3));
  };

  const calculateStreetProgress = (userDataFromDB) => {
    const completedPrograms = userDataFromDB.programs?.street?.completedSkills || [];
    const totalCompleted = completedPrograms.length;

    // Calcule l'XP total
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
      const progress = userProgress[skill.id];
      return progress && progress.currentSession && !progress.isCompleted;
    });
    
    return inProgress.slice(0, 3); // Limiter à 3
  };

  // Détermine le statut d'une compétence
  const getSkillStatus = (skill) => {
    const progress = userProgress[skill.id];
    
    if (progress?.isCompleted) return 'COMPLETED';
    if (progress?.currentSession) return 'IN_PROGRESS';
    
    // Vérifier si débloquée
    const unlockedSkills = userData?.programs?.street?.unlockedSkills || [];
    const isUnlocked = unlockedSkills.includes(skill.id) || 
      skill.prerequisites.every(prereq => 
        userData?.programs?.street?.completedSkills?.includes(prereq)
      );
    
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

  // Composant Onboarding pour nouveaux utilisateurs
  const OnboardingView = () => (
    <View style={styles.onboardingContainer}>
      <View style={styles.onboardingContent}>
        <Text style={styles.onboardingTitle}>
          🔥 Bienvenue dans votre parcours Street Workout !
        </Text>
        
        <View style={styles.onboardingFeatures}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💪</Text>
            <Text style={styles.featureText}>
              Développe ta force avec des programmes progressifs
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>
              Débloque de nouvelles compétences en progressant
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>
              Suis tes progrès et accumule de l'expérience
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>
              Atteins le niveau master et maîtrise le Muscle-Up
            </Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={() => {
            const beginnerSkill = streetPrograms.find(p => p.id === 'beginner-foundation');
            if (beginnerSkill) navigateToSkill(beginnerSkill);
          }}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
        >
          🚀 Commencer mon parcours
        </Button>
      </View>
    </View>
  );

  // Composant Card de progression programme
  const ProgramProgressCard = ({ program, progress }) => (
    <Card style={styles.programCard}>
      <Card.Content>
        <View style={styles.programHeader}>
          <Text style={styles.programIcon}>{program.icon}</Text>
          <View style={styles.programInfo}>
            <Text style={styles.programName}>{program.name}</Text>
            <Text style={styles.programProgress}>
              {progress.completedSkills || 0} compétences • Niveau {progress.level || 0}
            </Text>
          </View>
          <Chip 
            mode="flat" 
            style={styles.xpChip}
            textStyle={styles.xpChipText}
          >
            {(progress.xp || 0).toLocaleString()} XP
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  // Composant Card de compétence
  const SkillCard = ({ skill, showProgress = false }) => {
    const status = getSkillStatus(skill);
    const progress = userProgress[skill.id];
    
    const getStatusColor = () => {
      switch (status) {
        case 'COMPLETED': return colors.success;
        case 'IN_PROGRESS': return colors.warning;
        case 'UNLOCKED': return colors.primary;
        default: return colors.textSecondary;
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'COMPLETED': return '✅';
        case 'IN_PROGRESS': return '🔄';
        case 'UNLOCKED': return '🔓';
        default: return '🔒';
      }
    };

    return (
      <Card 
        style={styles.skillCard}
        onPress={() => status !== 'LOCKED' && navigateToSkill(skill)}
      >
        <Card.Content>
          <View style={styles.skillHeader}>
            <Text style={styles.skillIcon}>{skill.icon}</Text>
            <View style={styles.skillInfo}>
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillDescription} numberOfLines={2}>
                {skill.description}
              </Text>
              {showProgress && progress && (
                <View style={styles.progressContainer}>
                  <ProgressBar 
                    progress={progress.overallProgress || 0} 
                    color={getStatusColor()}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    {Math.round((progress.overallProgress || 0) * 100)}%
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.skillStatus}>
              <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
              <Chip
                mode="flat"
                style={[styles.xpChip, { backgroundColor: getStatusColor() + '20' }]}
                textStyle={[styles.xpChipText, { color: getStatusColor() }]}
              >
                +{skill.xpReward} XP
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Écran de chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de vos données...</Text>
      </View>
    );
  }

  // Si nouvel utilisateur (pas de programmes dans userData)
  if (!userData || !userData.programs || Object.keys(userData.programs).length === 0) {
    return <OnboardingView />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header utilisateur */}
        <UserHeader
          username={userData?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
          globalLevel={userData?.globalLevel || 0}
          globalXP={userData?.globalXP || 0}
          currentStreak={userData?.currentStreak || 0}
          nextLevelXP={userData?.nextLevelXP || 1000}
        />

        {/* Statistiques utilisateur */}
        <UserStatsCard stats={userData?.stats} />

        {/* Section Compétences en cours */}
        {inProgressSkills.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>🔄 En cours</Text>
            {inProgressSkills.map((skill) => (
              <SkillCard 
                key={skill.id} 
                skill={skill} 
                showProgress={true}
              />
            ))}
          </Animated.View>
        )}

        {/* Section Prochaines compétences */}
        {upcomingSkills.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>🎯 Recommandées</Text>
            {upcomingSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </Animated.View>
        )}

        {/* Bouton vers l'arbre complet */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Button
            mode="outlined"
            onPress={navigateToSkillTree}
            style={styles.treeButton}
            icon="file-tree"
          >
            Voir l'arbre complet des compétences
          </Button>
        </Animated.View>

        {/* Section Quick Start pour nouveaux utilisateurs */}
        {(!userData.programs?.street?.completedSkills || 
          userData.programs.street.completedSkills.length === 0) && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>🚀 Commencer</Text>
            <Card style={styles.beginnerCard}>
              <Card.Content>
                <View style={styles.beginnerHeader}>
                  <Text style={styles.beginnerIcon}>💪</Text>
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

      </Animated.View>
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
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  // Onboarding styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  onboardingContent: {
    alignItems: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  onboardingFeatures: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
  },
  startButtonContent: {
    paddingVertical: 8,
  },
  
  // Section styles
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  
  // Program card styles
  programCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    backgroundColor: colors.surface,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  programProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  xpChip: {
    backgroundColor: colors.primary + '20',
  },
  xpChipText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  
  // Skill card styles
  skillCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  skillStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  
  // Progress styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 35,
    textAlign: 'right',
  },
  
  // Button styles
  treeButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  
  // Beginner section styles
  beginnerCard: {
    marginHorizontal: 16,
    elevation: 4,
    backgroundColor: colors.surface,
  },
  beginnerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  beginnerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  beginnerInfo: {
    flex: 1,
  },
  beginnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  beginnerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  beginnerButton: {
    borderRadius: 8,
  },
  beginnerButtonContent: {
    paddingVertical: 4,
  },
});

export default HomeScreen;
