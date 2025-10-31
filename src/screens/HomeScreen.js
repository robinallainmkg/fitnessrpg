import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';

// ✅ IMPORT UNIFIÉ - Firebase simple config
import { getFirestore, FieldValue } from '../config/firebase.simple';
const firestore = getFirestore();

import { useAuth } from '../contexts/AuthContext';
import { useChallenge } from '../contexts/ChallengeContext';
import { colors, getProgramColor } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';
import UserHeader from '../components/UserHeader';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { ProgramCard, WorkoutCard } from '../components/cards';
import { useUserPrograms } from '../hooks/useUserPrograms';
import { getUserSessionQueue } from '../services/sessionQueueService';
import { loadProgramsMeta } from '../data/programsLoader';
import { loadProgramDetails } from '../data/programsLoader';
import { logger } from '../utils/debugHelper';

// ═══ Images de fond des programmes ═══
// Pattern: {categoryId}-bg.jpg ou selon programs-meta.json
// Ajouter une nouvelle image: street => street-bg.jpg, running => running-5.jpg, etc.
const PROGRAM_IMAGES = {
  street: require('../../assets/programmes/street-bg.jpg'),
  running: require('../../assets/programmes/running-5.jpg'),
  // Pour les prochains programmes, utiliser le même pattern: yoga => yoga-bg.jpg, etc.
};

const HomeScreen = ({ navigation, route }) => {
  logger.section('🏠 HomeScreen Component Loaded');
  
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activePrograms, setActivePrograms] = useState([]);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  
  const { user, isGuest } = useAuth();
  const { todayChallenge, loadingChallenge, loadTodayChallenge } = useChallenge();
  
  const { 
    userPrograms, 
    loading: programsLoading, 
    refetch: refetchPrograms 
  } = useUserPrograms();

  // Initialisation au chargement
  useEffect(() => {
    console.log('🔄 HomeScreen mount - user:', user?.uid, 'isGuest:', isGuest);
    
    if (user?.uid) {
      console.log('✅ Utilisateur authentifié détecté');
      loadAllData();
      if (loadTodayChallenge) {
        loadTodayChallenge(user.uid); // Charger le défi du jour
      }
      startFadeAnimation();
    } else if (isGuest) {
      console.log('👤 Mode invité détecté');
      setUserStats({
        globalXP: 0,
        globalLevel: 0,
        title: 'Invité',
        stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
        programs: {},
        streakDays: 0,
        displayName: 'Invité',
        avatarId: 0
      });
      setLoading(false);
      startFadeAnimation();
    } else {
      console.log('⏳ En attente d\'authentification...');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest]); // Retirer loadTodayChallenge pour éviter la loop infinie

  // Gestion des paramètres de navigation
  useEffect(() => {
    const checkParams = async () => {
      try {
        const { openProgramSelection, forceRefresh, refresh } = route.params || {};
        
        // Auto-ouverture sélection programme après onboarding
        const shouldOpenSelection = await AsyncStorage.getItem('@fitnessrpg:open_program_selection');
        if (shouldOpenSelection === 'true') {
          console.log('🎯 Auto-opening ProgramSelection (AsyncStorage)');
          await AsyncStorage.removeItem('@fitnessrpg:open_program_selection');
          setTimeout(() => navigation.navigate('ProgramSelection'), 500);
          return;
        }
        
        if (openProgramSelection) {
          console.log('🎯 Auto-opening ProgramSelection (route params)');
          navigation.setParams({ openProgramSelection: undefined });
          setTimeout(() => navigation.navigate('ProgramSelection'), 500);
          return;
        }
        
        if (forceRefresh) {
          console.log('🔄 Force refresh');
          navigation.setParams({ forceRefresh: undefined, resetComplete: undefined });
          await loadAllData();
          return;
        }
        
        if (refresh) {
          console.log('🔄 Refresh programs');
          navigation.setParams({ refresh: undefined });
          await loadActiveProgramsAndQueue();
        }
      } catch (error) {
        console.error('Erreur checkParams:', error);
      }
    };
    
    if (!programsLoading) {
      checkParams();
    }
  }, [route.params, programsLoading]);

  // ═══ Redirection automatique vers ProgramSelection si pas de programmes actifs ═══
  useEffect(() => {
    // Attendre que le chargement soit terminé et que l'utilisateur soit connecté
    if (!loading && !loadingQueue && user?.uid && !isGuest) {
      // Si aucun programme actif, rediriger vers la sélection
      if (activePrograms.length === 0) {
        console.log('⚠️ Aucun programme actif - redirection vers ProgramSelection');
        setTimeout(() => {
          navigation.navigate('ProgramSelection');
        }, 500);
      }
    }
  }, [loading, loadingQueue, activePrograms, user, isGuest, navigation]);

  // Refresh au focus de l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.uid) {
        console.log('🔄 Screen focused - refreshing data');
        loadActiveProgramsAndQueue();
        
        // Recharger le challenge du jour pour avoir le statut à jour
        if (loadTodayChallenge) {
          loadTodayChallenge(user.uid);
        }
      }
    });
    return unsubscribe;
  }, [navigation, user, loadTodayChallenge]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  };

  const loadAllData = async () => {
    console.log('🔄 loadAllData START');
    const startTime = Date.now();
    
    try {
      setLoading(true);
      
      // 🚀 OPTIMISATION: Charger user stats et programmes en parallèle
      const [userStatsData] = await Promise.all([
        loadUserStats(),
        loadActiveProgramsAndQueue(), // Parallélisé !
      ]);
      
      // Appliquer les stats
      if (userStatsData) {
        console.log('✅ User stats loaded:', userStatsData.globalLevel);
        setUserStats(userStatsData);
      } else {
        console.log('⚠️ Mode dégradé - stats par défaut');
        setUserStats({
          globalXP: 0,
          globalLevel: 0,
          title: 'Débutant',
          stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
          programs: {},
          streakDays: 0,
          displayName: user?.email?.split('@')[0] || 'Utilisateur',
          avatarId: 0
        });
      }
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ loadAllData COMPLETE en ${loadTime}ms`);
      
    } catch (error) {
      console.error('❌ loadAllData ERROR:', error);
      
      setUserStats({
        globalXP: 0,
        globalLevel: 0,
        title: 'Débutant',
        stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
        programs: {},
        streakDays: 0,
        displayName: user?.email?.split('@')[0] || 'Utilisateur',
        avatarId: 0
      });
      
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    // ═══ NOUVELLE ARCHITECTURE: Les invités ont un user.uid Firebase ═══
    // Ils utilisent Firestore normalement, juste isGuest=true dans leur document
    if (!user || !user.uid) {
      console.log('⏭️ Skip loadUserStats (no user)');
      return null;
    }
    
    try {
      console.log('📊 Loading user stats for:', user.uid, isGuest ? '(guest)' : '(authenticated)');
      
      const userDoc = await firestore
        .collection('users')
        .doc(user.uid)
        .get();
      
      if (userDoc.exists) {
        console.log('✅ User document exists');
        const userData = userDoc.data();
        
        // Structure standard
        return {
          globalXP: userData?.totalXP || userData?.globalXP || 0,
          globalLevel: userData?.globalLevel || Math.floor(Math.sqrt((userData?.totalXP || 0) / 100)),
          title: userData?.title || getTitleFromLevel(userData?.globalLevel || 0),
          stats: userData?.stats || { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
          programs: userData?.programs || {},
          streakDays: userData?.streak || 0,
          displayName: userData?.displayName || user.email?.split('@')[0] || 'Utilisateur',
          avatarId: userData?.avatarId || 0
        };
      }
      
      // Nouvel utilisateur - créer le document
      console.log('📝 Nouvel utilisateur - création document');
      
      const newUserData = {
        totalXP: 0,
        level: 1,
        globalXP: 0,
        globalLevel: 0,
        completedPrograms: [],
        userProgress: {},
        activePrograms: [],
        selectedPrograms: [],
        streak: 0,
        lastWorkoutDate: null,
        displayName: user.email?.split('@')[0] || user.displayName || 'Utilisateur',
        avatarId: 0,
        createdAt: FieldValue.serverTimestamp(),
      };
      
      // Ajouter email seulement si disponible (pas pour anonymous)
      if (user.email) {
        newUserData.email = user.email;
      }
      
      // Créer le document
      await firestore
        .collection('users')
        .doc(user.uid)
        .set(newUserData);
      
      console.log('✅ Document créé');
      
      return {
        globalXP: 0,
        globalLevel: 0,
        title: 'Débutant',
        stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
        programs: {},
        streakDays: 0,
        displayName: user.email?.split('@')[0] || user.displayName || 'Utilisateur',
        avatarId: 0
      };
      
    } catch (error) {
      console.error('❌ loadUserStats error:', error);
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

  const loadActiveProgramsAndQueue = async () => {
    // ═══ NOUVELLE ARCHITECTURE: Les invités ont un user.uid Firebase ═══
    if (!user?.uid) {
      console.log('⏭️ Skip loadActiveProgramsAndQueue (no user)');
      return;
    }
    
    try {
      setLoadingQueue(true);
      console.log('📋 Loading active programs and queue', isGuest ? '(guest)' : '(authenticated)');
      
      const userDoc = await firestore
        .collection('users')
        .doc(user.uid)
        .get();
      
      if (!userDoc.exists) {
        console.log('⚠️ User document not found');
        setActivePrograms([]);
        setSessionQueue([]);
        setLoadingQueue(false);
        return;
      }
      
      const userData = userDoc.data();
      
      // Vérification défensive : si userData est undefined ou null
      if (!userData) {
        console.log('⚠️ User document exists but data is empty');
        setActivePrograms([]);
        setSessionQueue([]);
        setLoadingQueue(false);
        return;
      }
      
      const activeProgramIds = userData.activePrograms || [];
      
      console.log('🔍 Active programs:', activeProgramIds);
      
      // Charger les métadonnées des catégories
      const meta = await loadProgramsMeta();
      
      // Mapper les programmes actifs
      const activeProgramsData = activeProgramIds
        .map(categoryId => {
          const category = meta.categories.find(cat => cat.id === categoryId);
          if (!category) {
            console.warn(`❌ Category ${categoryId} not found`);
            return null;
          }
          
          const programProgress = userData.programs?.[categoryId] || {
            level: 1,
            xp: 0,
            completedSkills: [],
            skillProgress: {}
          };
          
          const totalSkills = category.totalPrograms || 0;
          const completedCount = Array.isArray(programProgress.completedSkills) 
            ? programProgress.completedSkills.length 
            : 0;
          
          // Récupérer l'image depuis le mapping
          const backgroundImage = PROGRAM_IMAGES[categoryId] || null;
          
          return {
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            backgroundImage: backgroundImage,
            completedSkills: completedCount,
            totalSkills: totalSkills,
            status: 'active'
          };
        })
        .filter(Boolean);
      
      setActivePrograms(activeProgramsData);
      console.log('✅ Active programs loaded:', activeProgramsData.length);
      
      // Charger la queue
      const queue = await getUserSessionQueue(user.uid);
      setSessionQueue(queue);
      console.log('✅ Queue loaded:', queue.length);
      
    } catch (error) {
      console.error('❌ loadActiveProgramsAndQueue error:', error);
      setActivePrograms([]);
      setSessionQueue([]);
    } finally {
      setLoadingQueue(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    await refetchPrograms();
    setRefreshing(false);
  };

  const handleStartSession = async (session) => {
    try {
      // Charger les métadonnées de la catégorie
      const meta = await loadProgramsMeta();
      const category = meta.categories.find(cat => cat.id === session.programId);
      
      if (!category) {
        Alert.alert('Erreur', 'Programme non trouvé');
        return;
      }
      
      // Charger les détails du skill
      const skillDetails = await loadProgramDetails(session.programId, session.skillId);
      if (!skillDetails) {
        Alert.alert('Erreur', 'Compétence non trouvée');
        return;
      }
      
      const levelIndex = session.levelNumber - 1;
      const level = skillDetails.levels?.[levelIndex];
      if (!level) {
        Alert.alert('Erreur', 'Niveau non trouvé');
        return;
      }
      
      navigation.navigate('Workout', {
        program: {
          id: skillDetails.id,
          name: skillDetails.name || session.skillName,
          category: category.id, // ← ID pour Firestore (ex: 'street')
          categoryName: category.name, // ← Nom pour affichage
          icon: session.programIcon || skillDetails.icon,
        },
        level: {
          id: level.id,
          name: level.name,
          subtitle: level.subtitle,
          exercises: level.exercises || [],
          xpReward: level.xpReward,
        }
      });
    } catch (error) {
      console.error('Erreur start session:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la séance');
    }
  };

  const handlePreviewSession = async (session) => {
    try {
      // Charger les détails complets du skill
      const skillDetails = await loadProgramDetails(session.programId, session.skillId);
      
      if (!skillDetails) {
        Alert.alert('Erreur', 'Compétence non trouvée');
        return;
      }

      const levelIndex = session.levelNumber - 1;
      const level = skillDetails.levels?.[levelIndex];
      if (!level) {
        Alert.alert('Erreur', 'Niveau non trouvé');
        return;
      }

      const workout = {
        id: level.id,
        programId: session.skillId,
        programName: skillDetails.name || session.skillName,
        name: `${skillDetails.name || session.skillName} - ${level.name}`,
        subtitle: level.subtitle || '',
        description: skillDetails.description || `Entraînement ${session.skillName} niveau ${level.id}`,
        difficulty: skillDetails.difficulty || 'Intermédiaire',
        estimatedDuration: null,
        xpReward: level.xpReward || 100,
        exercises: level.exercises || [],
      };

      navigation.navigate('WorkoutPreview', { workout });
    } catch (error) {
      console.error('Erreur preview session:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'aperçu');
    }
  };

  const handleViewActiveProgram = (programId) => {
    navigation.navigate('SkillTree', { programId });
  };

  // Components
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
            <Chip mode="flat" style={styles.streakChip}>En feu !</Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de ton profil...</Text>
      </View>
    );
  }

  // Pas d'utilisateur
  if (!user && !isGuest) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>En attente de connexion...</Text>
      </View>
    );
  }

  // Rendu principal
  return (
    <ImageBackground 
      source={require('../../assets/Home-BG-0.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => navigation.navigate('DevDiagnostic')}
        >
          <Text style={styles.devButtonText}>🔧 DEBUG</Text>
        </TouchableOpacity>
      )}
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <UserHeader
            username={userStats?.displayName || 'Utilisateur'}
            globalLevel={userStats?.globalLevel || 0}
            globalXP={userStats?.globalXP || 0}
            title={userStats?.title || 'Débutant'}
            streak={userStats?.streakDays || 0}
            avatarId={userStats?.avatarId || 0}
            userId={user?.uid}
            onUsernameUpdate={(newName) => {
              setUserStats(prev => ({
                ...prev,
                displayName: newName
              }));
            }}
          />

          {/* DÉFI DU JOUR - En premier, juste après UserHeader */}
          <DailyChallengeCard
            challenge={todayChallenge}
            hasSubmitted={todayChallenge?.submitted || false}
            loading={loadingChallenge}
            onPress={() => navigation.navigate('Challenge')}
          />

          <StreakCard streak={userStats?.streakDays || 0} />

          {/* SECTION QUÊTES - EN PREMIER */}
          {loadingQueue ? (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <ActivityIndicator size="small" color={colors.primary} />
              </Card.Content>
            </Card>
          ) : sessionQueue.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⚔️ Quêtes disponibles</Text>
              </View>
              {sessionQueue.slice(0, 5).map(session => (
                <WorkoutCard
                  key={session.id}
                  session={session}
                  programColor={getProgramColor(session.programId)}
                  onPreview={() => handlePreviewSession(session)}
                  onStart={() => handleStartSession(session)}
                  disabled={session.status === 'completed'}
                />
              ))}
            </View>
          )}

          {/* SECTION PROGRAMMES - EN DEUXIÈME */}
          {loadingQueue ? (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <ActivityIndicator size="small" color={colors.primary} />
              </Card.Content>
            </Card>
          ) : activePrograms.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Programme(s)</Text>
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => navigation.navigate('ProgramSelection')}
                >
                  <Text style={styles.manageButtonIcon}>⚙️</Text>
                  <Text style={styles.manageButtonText}>Gérer</Text>
                </TouchableOpacity>
              </View>
              {activePrograms.map(program => (
                <View key={program.id} style={styles.programCardWrapper}>
                  <ProgramCard
                    program={program}
                    onViewTree={() => handleViewActiveProgram(program.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Card style={[styles.sectionCard, styles.emptyStateCard]}>
              <Card.Content style={styles.emptyStateContent}>
                <View style={styles.emptyStateIconContainer}>
                  <Text style={styles.emptyStateIcon}>📋</Text>
                </View>
                <Text style={styles.emptyStateTitle}>Aucun programme actif</Text>
                <Text style={styles.emptyStateSubtext}>
                  Active un programme pour commencer ton aventure
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('ProgramSelection')}
                  style={styles.emptyStateButton}
                  buttonColor={colors.primary}
                >
                  Choisir un programme
                </Button>
              </Card.Content>
            </Card>
          )}

          <View style={styles.bottomSpacer} />
        </Animated.View>
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
  section: { marginTop: 8, marginBottom: 0, marginHorizontal: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  programCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.4)',
    gap: 6,
  },
  manageButtonIcon: { fontSize: 16, color: '#4D9EFF' },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4D9EFF',
    letterSpacing: 0.3,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
  },
  emptyStateCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    elevation: 0,
  },
  emptyStateContent: { alignItems: 'center', paddingVertical: 24 },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateIcon: { fontSize: 32 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  emptyStateButton: { borderRadius: 12, elevation: 2 },
  streakCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.warning + '10',
  },
  streakContent: { flexDirection: 'row', alignItems: 'center' },
  streakIcon: { fontSize: 32, marginRight: 12 },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  streakDays: { fontSize: 14, color: colors.textSecondary },
  streakChip: { backgroundColor: colors.warning + '20' },
  bottomSpacer: { height: 20 },
  devButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  devButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});

export default HomeScreen;