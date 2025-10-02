import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  RefreshControl
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Chip,
  Divider
} from 'react-native-paper';
import { collection, doc, getDocs, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';
import UserHeader from '../components/UserHeader';
import UserStatsCard from '../components/UserStatsCard';
import ProgramProgressCard from '../components/ProgramProgressCard';
import LoadingProgramCard from '../components/LoadingProgramCard';
import { useUserPrograms, useRecommendedPrograms } from '../hooks/useUserPrograms';
import programs from '../data/programs.json';

const HomeScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState(null);
  const [inProgressSkills, setInProgressSkills] = useState([]);
  const [upcomingSkills, setUpcomingSkills] = useState([]);
  const [lastSession, setLastSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();
  
  // Hook pour les programmes utilisateur
  const { 
    userPrograms, 
    loading: programsLoading, 
    error: programsError,
    refetch: refetchPrograms 
  } = useUserPrograms();
  
  // Hook pour les programmes recommandés
  const { recommendedPrograms } = useRecommendedPrograms(3);

  useEffect(() => {
    if (user?.uid) {
      loadAllData();
      startFadeAnimation();
    }
  }, [user]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Charger les stats utilisateur depuis Firestore
      const userStatsData = await loadUserStats();
      setUserStats(userStatsData);
      
      // Charger les skills en cours et à débloquer
      const { inProgress, upcoming } = await loadSkillsData(userStatsData);
      setInProgressSkills(inProgress);
      setUpcomingSkills(upcoming);
      
      // Charger la dernière session
      const lastSessionData = await loadLastSession();
      setLastSession(lastSessionData);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Structure pour utilisateur migré
        if (userData.migrationVersion) {
          return {
            globalXP: userData.globalXP || 0,
            globalLevel: userData.globalLevel || 0,
            title: userData.title || 'Débutant',
            stats: userData.stats || { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
            programs: userData.programs || { street: { xp: 0, level: 0, completedSkills: 0 } },
            streakDays: userData.streak || 0,
            displayName: userData.displayName || user.email?.split('@')[0] || 'Utilisateur'
          };
        }
        
        // Structure pour utilisateur non-migré (legacy)
        const totalXP = userData.totalXP || 0;
        const globalLevel = Math.floor(Math.sqrt(totalXP / 100));
        
        return {
          globalXP: totalXP,
          globalLevel: globalLevel,
          title: getTitleFromLevel(globalLevel),
          stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
          programs: {
            street: {
              xp: totalXP,
              level: globalLevel,
              completedSkills: userData.completedPrograms?.length || 0
            }
          },
          streakDays: 0,
          displayName: userData.displayName || user.email?.split('@')[0] || 'Utilisateur'
        };
      }
      
      // Nouvel utilisateur
      return {
        globalXP: 0,
        globalLevel: 0,
        title: 'Débutant',
        stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
        programs: {},
        streakDays: 0,
        displayName: user.email?.split('@')[0] || 'Utilisateur'
      };
      
    } catch (error) {
      console.error('Erreur chargement stats utilisateur:', error);
      return null;
    }
  };

  const loadSkillsData = async (userStatsData) => {
    try {
      // Pour l'instant, on utilise les données statiques
      // TODO: Implémenter le chargement depuis skillProgress
      
      const streetPrograms = programs.categories
        .find(cat => cat.id === 'street')?.programs || [];
      
      const completedCount = userStatsData?.programs?.street?.completedSkills || 0;
      
      // Skills en cours (simulé)
      const inProgress = streetPrograms.slice(0, Math.min(2, streetPrograms.length));
      
      // Skills à débloquer (les 2 suivants)
      const upcoming = streetPrograms.slice(completedCount, completedCount + 2);
      
      return { inProgress, upcoming };
      
    } catch (error) {
      console.error('Erreur chargement skills:', error);
      return { inProgress: [], upcoming: [] };
    }
  };

  const loadLastSession = async () => {
    try {
      const sessionsQuery = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', user.uid),
        orderBy('completedAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(sessionsQuery);
      
      if (!snapshot.empty) {
        const sessionData = snapshot.docs[0].data();
        return {
          id: snapshot.docs[0].id,
          ...sessionData,
          completedAt: sessionData.completedAt?.toDate()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Erreur chargement dernière session:', error);
      return null;
    }
  };

  const getTitleFromLevel = (level) => {
    if (level >= 20) return "Légende";
    if (level >= 12) return "Maître";
    if (level >= 7) return "Champion";
    if (level >= 3) return "Guerrier";
    return "Débutant";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    await refetchPrograms(); // Recharger aussi les programmes
    setRefreshing(false);
  };

  const handleStartJourney = () => {
    navigation.navigate('SkillTree');
  };

  const handleViewProgram = (programId) => {
    navigation.navigate('SkillTree', { programId });
  };

  const handleViewSkill = (skillId) => {
    navigation.navigate('SkillDetail', { skillId });
  };

  const handleContinueSession = () => {
    // TODO: Reprendre la dernière session
    navigation.navigate('Workout');
  };

  // Composants internes
  const OnboardingView = () => (
    <View style={styles.onboardingContainer}>
      <Animated.View style={[styles.onboardingContent, { opacity: fadeAnim }]}>
        <Text style={styles.onboardingTitle}>
          Bienvenue dans HybridRPG ⚔️🔥
        </Text>
        
        <View style={styles.onboardingFeatures}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💪</Text>
            <Text style={styles.featureText}>
              Entraîne-toi, gagne de l’XP et booste tes stats
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>
              Débloque des skills et deviens un athlète hybride
            </Text>
          </View>
        </View>

        {/* Programmes recommandés pour les nouveaux utilisateurs */}
        {!programsLoading && recommendedPrograms.length > 0 && (
          <View style={styles.recommendedSection}>
            <Text style={styles.recommendedTitle}>
              Programmes populaires pour commencer 🚀
            </Text>
            {recommendedPrograms.slice(0, 2).map(({ program, progress }) => (
              <ProgramProgressCard
                key={program.id}
                program={program}
                progress={progress}
                onPress={() => handleViewProgram(program.id)}
              />
            ))}
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleStartJourney}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
          buttonColor={colors.primary}
        >
          Commencer mon aventure
        </Button>
      </Animated.View>
    </View>
  );



  const StreakCard = ({ streak }) => {
    if (streak === 0) return null;
    
    return (
      <Card style={styles.streakCard}>
        <Card.Content>
          <View style={styles.streakContent}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Série active</Text>
              <Text style={styles.streakDays}>{streak} jours consécutifs</Text>
            </View>
            <Chip mode="flat" style={styles.streakChip}>
              En feu !
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const InProgressSkillsSection = ({ skills }) => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ En cours</Text>
        
        {skills.map((skill) => (
          <Card 
            key={skill.id} 
            style={styles.skillCard}
            onPress={() => handleViewSkill(skill.id)}
          >
            <Card.Content>
              <View style={styles.skillHeader}>
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDifficulty}>{skill.difficulty}</Text>
                </View>
                <Chip mode="outlined" compact>
                  En cours
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}
        
        <Button
          mode="outlined"
          onPress={handleContinueSession}
          style={styles.continueButton}
          icon="play"
        >
          Continuer l'entraînement
        </Button>
      </View>
    );
  };

  const UpcomingSkillsSection = ({ skills }) => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 À débloquer</Text>
        
        {skills.map((skill) => (
          <Card 
            key={skill.id} 
            style={styles.upcomingSkillCard}
            onPress={() => handleViewSkill(skill.id)}
          >
            <Card.Content>
              <View style={styles.skillHeader}>
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription} numberOfLines={2}>
                    {skill.description}
                  </Text>
                </View>
                <Chip mode="flat" style={styles.upcomingChip}>
                  Bientôt
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const LastSessionCard = ({ session }) => {
    if (!session) return null;
    
    const formatDate = (date) => {
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) return "Aujourd'hui";
      if (diff === 1) return "Hier";
      return `Il y a ${diff} jours`;
    };
    
    return (
      <Card style={styles.lastSessionCard}>
        <Card.Content>
          <View style={styles.lastSessionHeader}>
            <Text style={styles.lastSessionTitle}>📈 Dernière séance</Text>
            <Text style={styles.lastSessionDate}>
              {formatDate(session.completedAt)}
            </Text>
          </View>
          
          <View style={styles.lastSessionStats}>
            <View style={styles.sessionStat}>
              <Text style={styles.sessionStatValue}>{session.score}%</Text>
              <Text style={styles.sessionStatLabel}>Score</Text>
            </View>
            
            <View style={styles.sessionStat}>
              <Text style={styles.sessionStatValue}>+{session.xpGained || 0}</Text>
              <Text style={styles.sessionStatLabel}>XP</Text>
            </View>
            
            <View style={styles.sessionStat}>
              <Text style={styles.sessionStatValue}>
                {Math.floor((session.duration || 0) / 60)}min
              </Text>
              <Text style={styles.sessionStatLabel}>Durée</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Détection mode
  const isNewUser = !userStats || (
    userStats.globalXP === 0 && 
    (!userStats.programs?.street || userStats.programs.street.completedSkills === 0)
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de ton profil...</Text>
      </View>
    );
  }

  if (isNewUser) {
    return <OnboardingView />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header utilisateur */}
        <UserHeader
          username={userStats.displayName}
          globalLevel={userStats.globalLevel}
          globalXP={userStats.globalXP}
          title={userStats.title}
          streak={userStats.streakDays}
        />

        {/* Stats utilisateur */}
        <UserStatsCard stats={userStats.stats} />

        {/* Streak */}
        <StreakCard streak={userStats.streakDays} />

        {/* Programmes actifs */}
        {programsLoading ? (
          <LoadingProgramCard count={2} />
        ) : programsError ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                Erreur lors du chargement des programmes
              </Text>
              <Button 
                mode="outlined" 
                onPress={refetchPrograms}
                style={{ marginTop: 8 }}
              >
                Réessayer
              </Button>
            </Card.Content>
          </Card>
        ) : (
          userPrograms
            .filter(up => up.isStarted) // Seulement les programmes commencés
            .map(({ program, progress }) => (
              <ProgramProgressCard
                key={program.id}
                program={program}
                progress={progress}
                onPress={() => handleViewProgram(program.id)}
              />
            ))
        )}

        {/* Section En cours */}
        <InProgressSkillsSection skills={inProgressSkills} />

        {/* Section À débloquer */}
        <UpcomingSkillsSection skills={upcomingSkills} />

        {/* Dernière séance */}
        <LastSessionCard session={lastSession} />

        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
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
  
  // Onboarding
  onboardingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  onboardingContent: {
    alignItems: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
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
    fontSize: 32,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  startButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
  startButtonContent: {
    paddingVertical: 8,
  },
  
  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  

  
  // Streak Card
  streakCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.warning + '10',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  streakDays: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  streakChip: {
    backgroundColor: colors.warning + '20',
  },
  
  // Skill Cards
  skillCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  upcomingSkillCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
    backgroundColor: colors.surface + 'DD',
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
  },
  skillDifficulty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  upcomingChip: {
    backgroundColor: colors.primary + '20',
  },
  
  // Continue Button
  continueButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  
  // Last Session Card
  lastSessionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  lastSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastSessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  lastSessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastSessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sessionStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  // Recommended section
  recommendedSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },

  // Error card
  errorCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;
