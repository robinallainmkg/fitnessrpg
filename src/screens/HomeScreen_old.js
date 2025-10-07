import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Chip,
  Divider
} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import UserHeader from '../components/UserHeader';
import UserStatsCard from '../components/UserStatsCard';
import programs from '../data/programs.json';

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
  const { user } = useAuth();
  const userId = user?.uid;

  // Détection mode nouvel utilisateur
  const isNewUser = !userData || (
    (userData.globalXP === 0 || !userData.globalXP) && 
    (!userData.programs?.street?.completedSkills || userData.programs.street.completedSkills === 0)
  );

  useEffect(() => {
    if (userId) {
      loadUserData();
      startFadeAnimation();
    }
  }, [userId]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // 1. Charger les données utilisateur complètes
      const userDocRef = firestore().doc(`users/${userId}`);
      const userDoc = await userDocRef.get();
      const userDataFromDB = userDoc.exists ? userDoc.data() : null;
      
      if (userDataFromDB) {
        setUserData(userDataFromDB);
        
        // 2. Charger les skills en cours
        await loadInProgressSkills(userDataFromDB);
        
        // 3. Calculer les skills à débloquer
        calculateUpcomingSkills(userDataFromDB);
        
        // 4. Charger la dernière session
        await loadLastSession();
      }
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInProgressSkills = async (userDataFromDB) => {
    try {
      // Récupérer les progressions de skills depuis Firestore
      const progressQuery = firestore()
        .collection('skillProgress')
        .where('userId', '==', userId)
        .where('status', '==', 'in_progress');
      
      const progressSnapshot = await progressQuery.get();
      const inProgress = [];
      
      progressSnapshot.forEach(doc => {
        const progressData = doc.data();
        const skill = streetPrograms.find(p => p.id === progressData.skillId);
        if (skill) {
          inProgress.push({
            ...skill,
            progress: progressData
          });
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

    const completedSkillIds = userDataFromDB.programs.street.unlockedSkills || [];
    const upcoming = [];

    // Parcourir les skills pour trouver ceux débloqués mais pas commencés
    streetPrograms.forEach(skill => {
      if (completedSkillIds.includes(skill.id)) return; // Déjà fait
      
      // Vérifier si les prérequis sont remplis
      const hasPrerequisites = skill.prerequisites?.every(prereqId => 
        completedSkillIds.includes(prereqId)
      ) ?? true;
      
      if (hasPrerequisites) {
        upcoming.push(skill);
      }
    });

    setUpcomingSkills(upcoming.slice(0, 2)); // Limiter à 2
  };

  const loadLastSession = async () => {
    try {
      const sessionsQuery = firestore()
        .collection('workoutSessions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1);
      
      const sessionsSnapshot = await sessionsQuery.get();
      if (!sessionsSnapshot.empty) {
        const sessionData = sessionsSnapshot.docs[0].data();
        setLastSession(sessionData);
      }
    } catch (error) {
      console.error('Erreur chargement dernière session:', error);
    }
  };

  const handleStartJourney = async () => {
    // Naviguer vers le premier programme
    const firstSkill = streetPrograms.find(p => p.id === 'beginner-foundation');
    if (firstSkill) {
      navigation.navigate('SkillDetail', { 
        skill: firstSkill,
        category: streetCategory 
      });
    }
  };

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

  // Composant Onboarding pour nouveaux utilisateurs
  const OnboardingView = () => (
    <View style={styles.onboardingContainer}>
      <Animated.View style={[styles.onboardingContent, { opacity: fadeAnim }]}>
        <Text style={styles.onboardingTitle}>
          Bienvenue dans ton aventure fitness ! 🚀
        </Text>
        
        <View style={styles.onboardingFeatures}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💪</Text>
            <Text style={styles.featureText}>
              Progresse à travers des compétences structurées
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>
              Gagne de l'XP et débloque de nouveaux défis
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>
              Développe tes 5 caractéristiques physiques
            </Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={handleStartJourney}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
          buttonColor={colors.primary}
        >
          Commencer l'aventure
        </Button>
      </Animated.View>
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

  // Section skills en cours
  const InProgressSkillsSection = ({ skills }) => {
    if (!skills || skills.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ En cours</Text>
        {skills.map(skill => (
          <TouchableOpacity
            key={skill.id}
            onPress={() => navigation.navigate('SkillDetail', { 
              skill, 
              category: streetCategory 
            })}
          >
            <Card style={styles.skillCard}>
              <Card.Content>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillIcon}>{skill.icon}</Text>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillProgress}>
                      Progression: {Math.round((skill.progress?.completedLevels || 0) / (skill.totalWeeks || 4) * 100)}%
                    </Text>
                  </View>
                  <Text style={styles.skillDifficulty}>{skill.difficulty}</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Section skills à débloquer
  const UpcomingSkillsSection = ({ skills }) => {
    if (!skills || skills.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 À débloquer</Text>
        {skills.map(skill => (
          <TouchableOpacity
            key={skill.id}
            onPress={() => navigation.navigate('SkillDetail', { 
              skill, 
              category: streetCategory 
            })}
          >
            <Card style={styles.skillCard}>
              <Card.Content>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillIcon}>{skill.icon}</Text>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillDescription} numberOfLines={2}>
                      {skill.description}
                    </Text>
                  </View>
                  <Chip 
                    mode="outlined" 
                    style={styles.rewardChip}
                    textStyle={styles.rewardChipText}
                  >
                    +{skill.xpReward} XP
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Card streak
  const StreakCard = ({ streak }) => {
    if (!streak || streak === 0) return null;

    return (
      <Card style={[styles.streakCard, { backgroundColor: colors.warning + '20' }]}>
        <Card.Content>
          <View style={styles.streakContent}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakDays}>{streak} jours</Text>
              <Text style={styles.streakLabel}>Série active</Text>
            </View>
            <Text style={styles.streakMotivation}>Continue !</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Card dernière session
  const LastSessionCard = ({ session }) => {
    if (!session) return null;

    const sessionDate = session.createdAt?.toDate?.() || new Date(session.createdAt);
    const formatDate = (date) => {
      const today = new Date();
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      return date.toLocaleDateString('fr-FR');
    };

    return (
      <Card style={styles.sessionCard}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionIcon}>📋</Text>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Dernière séance</Text>
              <Text style={styles.sessionDate}>{formatDate(sessionDate)}</Text>
            </View>
            <Chip 
              mode="flat" 
              style={[styles.scoreChip, { 
                backgroundColor: session.score >= 80 ? colors.success + '20' : colors.warning + '20' 
              }]}
              textStyle={[styles.scoreChipText, { 
                color: session.score >= 80 ? colors.success : colors.warning 
              }]}
            >
              {session.score || 0}%
            </Chip>
          </View>
          
          {session.skillName && (
            <Text style={styles.sessionSkill}>
              {session.skillName}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de tes données...</Text>
      </View>
    );
  }

  if (isNewUser) {
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
          title={userData?.title || 'Débutant'}
          streak={userData?.streak || 0}
        />

        {/* Stats utilisateur */}
        <UserStatsCard stats={userData?.stats || {}} />

        {/* Streak card */}
        <StreakCard streak={userData?.streak || 0} />

        {/* Programmes actifs */}
        {userData?.programs && Object.keys(userData.programs).map(programId => {
          const program = programs.categories
            .flatMap(cat => cat.programs)
            .find(p => p.id === programId) || streetCategory;
          
          return (
            <ProgramProgressCard
              key={programId}
              program={program}
              progress={userData.programs[programId]}
            />
          );
        })}

        {/* Section En cours */}
        <InProgressSkillsSection skills={inProgressSkills} />

        {/* Section À débloquer */}
        <UpcomingSkillsSection skills={upcomingSkills} />

        {/* Dernière séance */}
        <LastSessionCard session={lastSession} />
      </Animated.View>
    </ScrollView>
  );
};

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
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  skillProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  skillDifficulty: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  rewardChip: {
    borderColor: colors.success,
  },
  rewardChipText: {
    color: colors.success,
    fontSize: 12,
  },
  
  // Streak card styles
  streakCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakDays: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.warning,
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  streakMotivation: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  
  // Session card styles
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sessionDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sessionSkill: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  scoreChip: {
    minWidth: 60,
  },
  scoreChipText: {
    fontWeight: 'bold',
  },
});

export default HomeScreen;
