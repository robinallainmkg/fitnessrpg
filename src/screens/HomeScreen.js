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
  Divider
} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getWithRetry } from '../utils/firestoreRetry';
import { colors } from '../theme/colors';
import UserHeader from '../components/UserHeader';
import ProgramProgressCard from '../components/ProgramProgressCard';
import LoadingProgramCard from '../components/LoadingProgramCard';
import TreeTooltipOverlay from '../components/onboarding/TreeTooltipOverlay';
import ActiveProgramCard from '../components/ActiveProgramCard';
import SessionQueueCard from '../components/SessionQueueCard';
import MissionCard from '../components/MissionCard';
import { useUserPrograms, useUserCategories } from '../hooks/useUserPrograms';
import { getUserSessionQueue } from '../services/sessionQueueService';
import programs from '../data/programs.json';

const HomeScreen = ({ navigation, route }) => {
  const [userStats, setUserStats] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showTooltip, setShowTooltip] = useState(false);
  const [cardLayout, setCardLayout] = useState(null);
  const firstCardRef = useRef(null);
  
  // Nouveaux états pour les programmes actifs et la queue de séances
  const [activePrograms, setActivePrograms] = useState([]);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [hasSelectedPrograms, setHasSelectedPrograms] = useState(null); // null = pas encore chargé, true/false = défini
  const refetchTriggered = useRef(false);
  const { user, isGuest } = useAuth();
  
  // Hook pour les programmes utilisateur (skills individuels)
  const { 
    userPrograms, 
    loading: programsLoading, 
    error: programsError,
    refetch: refetchPrograms 
  } = useUserPrograms();
  
  // Hook pour les catégories complètes avec progression agrégée
  const {
    categories: userCategories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useUserCategories();
  
  // ✅ OPTIMISATION: Calculer les recommandations localement au lieu d'appeler des hooks supplémentaires
  // Cela évite des requêtes Firestore dupliquées
  const recommendedPrograms = React.useMemo(() => {
    return userPrograms
      .filter(up => !up.isStarted && up.hasSkills)
      .slice(0, 3);
  }, [userPrograms]);
  
  const recommendedCategories = React.useMemo(() => {
    return userCategories
      .filter(cat => !cat.isStarted)
      .slice(0, 3);
  }, [userCategories]);

  // Fonction pour mesurer la première carte
  const measureFirstCard = () => {
    if (firstCardRef.current) {
      firstCardRef.current.measure((x, y, width, height, pageX, pageY) => {
        setCardLayout({ x: pageX, y: pageY, width, height });
      });
    }
  };

  useEffect(() => {
    if (user?.uid) {
      // Utilisateur authentifié
      loadAllData();
      startFadeAnimation();
    } else if (isGuest) {
      // Mode invité - initialiser avec des valeurs par défaut
      console.log('👤 Mode invité détecté - initialisation HomeScreen');
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
      setHasSelectedPrograms(false);
      setLoading(false);
      startFadeAnimation();
    }
    // Réinitialiser le flag refetch à chaque changement d'utilisateur
    refetchTriggered.current = false;
  }, [user, isGuest]);

  // UseEffect pour détecter le trigger tooltip ou refresh
  useEffect(() => {
    const checkTooltip = async () => {
      try {
        const shown = await AsyncStorage.getItem('@fitnessrpg:tree_tooltip_shown');
        const trigger = route.params?.triggerTreeTooltip;
        const refresh = route.params?.refresh;
        const forceRefresh = route.params?.forceRefresh;
        
        // Si c'est un forceRefresh (reset profile), recharger TOUTES les données
        if (forceRefresh) {
          console.log('🔄 Force refresh triggered - reloading all data');
          // NETTOYER LES PARAMS IMMÉDIATEMENT pour éviter la loop
          navigation.setParams({ forceRefresh: undefined, resetComplete: undefined });
          setHasSelectedPrograms(null); // Reset pour forcer la vérification
          await loadAllData();
          return;
        }
        
        // Si c'est un refresh depuis ProgramSelectionScreen, recharger les données
        if (refresh) {
          console.log('🔄 Refresh triggered from ProgramSelection');
          navigation.setParams({ refresh: undefined });
          await loadActiveProgramsAndQueue();
        }
        
        // Si c'est un trigger depuis ProgramSelectionScreen, refetch les programmes (une seule fois)
        if (trigger && !refetchTriggered.current) {
          refetchTriggered.current = true;
          refetchPrograms();
        }
        
        if (trigger && shown !== 'true' && userPrograms.length > 0) {
          setTimeout(() => {
            measureFirstCard();
          }, 600);
        }
      } catch (error) {
        console.error('Erreur vérification tooltip:', error);
      }
    };
    
    if (!programsLoading) {
      checkTooltip();
    }
  }, [route.params, programsLoading, userPrograms, refetchPrograms]);

  // UseEffect pour afficher le tooltip quand le layout est prêt
  useEffect(() => {
    if (cardLayout) {
      setShowTooltip(true);
    }
  }, [cardLayout]);

  // UseEffect pour recharger les programmes actifs quand on revient de la gestion
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Recharger les programmes actifs et la queue quand l'écran reçoit le focus
      if (user?.uid) {
        loadActiveProgramsAndQueue();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

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
      
      // Charger la dernière session
      const lastSessionData = await loadLastSession();
      setLastSession(lastSessionData);
      
      // Charger les programmes actifs et la queue de séances
      await loadActiveProgramsAndQueue();
      
    } catch (error) {
      console.error('❌ Erreur chargement données HomeScreen:', error);
      
      // Mode dégradé : Si Firestore unavailable, continuer avec données par défaut
      if (error.code === 'firestore/unavailable') {
        console.warn('⚠️ Mode dégradé activé - Firestore indisponible');
        setUserStats({
          globalXP: 0,
          globalLevel: 0,
          title: 'Débutant',
          stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
          programs: {},
          streakDays: 0,
          displayName: user.email?.split('@')[0] || 'Utilisateur',
          avatarId: 0
        });
        setHasSelectedPrograms(false);
        setLastSession(null);
      } else {
        // Autre erreur, afficher alerte
        Alert.alert(
          'Erreur de connexion', 
          'Impossible de charger vos données. Vérifiez votre connexion internet.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const userRef = firestore().collection('users').doc(user.uid);
      const userDoc = await getWithRetry(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Vérifier si l'utilisateur a sélectionné des programmes
        const selectedPrograms = userData.selectedPrograms || [];
        const activePrograms = userData.activePrograms || [];
        const hasPrograms = selectedPrograms.length > 0 || activePrograms.length > 0;
        setHasSelectedPrograms(hasPrograms);
        
        // Structure pour utilisateur migré
        if (userData.migrationVersion) {
          return {
            globalXP: userData.globalXP || 0,
            globalLevel: userData.globalLevel || 0,
            title: userData.title || 'Débutant',
            stats: userData.stats || { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
            programs: userData.programs || { street: { xp: 0, level: 0, completedSkills: 0 } },
            streakDays: userData.streak || 0,
            displayName: userData.displayName || user.email?.split('@')[0] || 'Utilisateur',
            avatarId: userData.avatarId || 0
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
          displayName: userData.displayName || user.email?.split('@')[0] || 'Utilisateur',
          avatarId: userData.avatarId || 0
        };
      }
      
      // Nouvel utilisateur
      setHasSelectedPrograms(false);
      return {
        globalXP: 0,
        globalLevel: 0,
        title: 'Débutant',
        stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
        programs: {},
        streakDays: 0,
        displayName: user.email?.split('@')[0] || 'Utilisateur',
        avatarId: 0
      };
      
    } catch (error) {
      console.error('Erreur chargement stats utilisateur:', error);
      return null;
    }
  };



  const loadLastSession = async () => {
    try {
      const snapshot = await firestore()
        .collection('workoutSessions')
        .where('userId', '==', user.uid)
        .orderBy('completedAt', 'desc')
        .limit(1)
        .get();
      
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
      // Si l'erreur est liée à un index manquant, ignorer silencieusement
      if (error.message && error.message.includes('index')) {
        console.warn('⚠️ Index Firestore manquant pour workoutSessions - session ignorée');
        return null;
      }
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

  // Nouvelle fonction : Charger les programmes actifs et la queue de séances
  const loadActiveProgramsAndQueue = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingQueue(true);
      
      // Récupérer les données utilisateur avec retry
      const userRef = firestore().collection('users').doc(user.uid);
      const userDoc = await getWithRetry(userRef);
      
      if (!userDoc.exists()) {
        setActivePrograms([]);
        setSessionQueue([]);
        return;
      }
      
      const userData = userDoc.data();
      const activeProgramIds = userData.activePrograms || [];
      
      console.log('🔍 Active program IDs from Firestore:', activeProgramIds);
      
      // Charger les détails des programmes actifs (categories, pas skills)
      const activeProgramsData = activeProgramIds.map(categoryId => {
        // Trouver la catégorie (programme) dans programs.json
        const category = programs.categories.find(cat => cat.id === categoryId);
        
        if (!category) {
          console.warn(`❌ Category not found for id: ${categoryId}`);
          return null;
        }
        
        console.log(`✅ Found category: ${category.name}`);
        
        const programProgress = userData.programs?.[categoryId] || {
          level: 1,
          xp: 0,
          completedSkills: [], // Array
          skillProgress: {}
        };
        
        // Calculer le nombre total de skills/compétences dans cette catégorie
        const totalSkills = category.programs?.length || 0;
        
        // completedSkills est maintenant un array d'IDs de compétences complétées
        const completedCount = Array.isArray(programProgress.completedSkills) 
          ? programProgress.completedSkills.length 
          : 0;
        
        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          completedSkills: completedCount,
          totalSkills: totalSkills,
          status: 'active'
        };
      }).filter(Boolean);
      
      console.log('📊 Active programs data:', activeProgramsData);
      setActivePrograms(activeProgramsData);
      
      // Charger la queue de séances
      const queue = await getUserSessionQueue(user.uid);
      console.log('📋 Session queue:', queue);
      setSessionQueue(queue);
      
    } catch (error) {
      // Mode silencieux - log minimal
      if (__DEV__ && error.code !== 'firestore/unavailable') {
        console.warn('⚠️ loadActiveProgramsAndQueue error:', error.code);
      }
      
      // Fallback: définir des valeurs par défaut pour éviter les crashes UI
      setActivePrograms([]);
      setSessionQueue([]);
    } finally {
      setLoadingQueue(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    await loadActiveProgramsAndQueue(); // Recharger programmes actifs et queue
    await refetchPrograms(); // Recharger aussi les programmes
    setRefreshing(false);
  };

  const handleStartSession = (session) => {
    console.log('🚀 Démarrage de la séance:', session);
    
    // Trouver le programme complet dans programs.json
    const category = programs.categories.find(cat => cat.id === session.programId);
    if (!category) {
      Alert.alert('Erreur', 'Programme non trouvé');
      return;
    }
    
    // Trouver la compétence (skill) dans le programme
    const skill = category.programs.find(p => p.id === session.skillId);
    if (!skill) {
      Alert.alert('Erreur', 'Compétence non trouvée');
      return;
    }
    
    // Trouver le niveau dans la compétence
    const levelIndex = session.levelNumber - 1; // levelNumber est 1-based
    const level = skill.levels[levelIndex];
    if (!level) {
      Alert.alert('Erreur', 'Niveau non trouvé');
      return;
    }
    
    // Naviguer vers l'écran de workout avec les objets complets
    navigation.navigate('Workout', {
      program: {
        id: skill.id,
        name: skill.name,
        category: category.name,
        icon: session.programIcon || skill.icon,
      },
      level: {
        id: level.id,
        name: level.name,
        subtitle: level.subtitle,
        exercises: level.exercises || [],
        xpReward: level.xpReward,
      }
    });
  };

  const handlePreviewSession = (session) => {
    console.log('👁️ Aperçu de la séance:', session);

    // Trouver le programme complet dans programs.json
    const category = programs.categories.find(cat => cat.id === session.programId);
    if (!category) {
      Alert.alert('Erreur', 'Programme non trouvé');
      return;
    }

    // Trouver la compétence (skill) dans le programme
    const skill = category.programs.find(p => p.id === session.skillId);
    if (!skill) {
      Alert.alert('Erreur', 'Compétence non trouvée');
      return;
    }

    // Trouver le niveau dans la compétence
    const levelIndex = session.levelNumber - 1; // levelNumber est 1-based
    const level = skill.levels[levelIndex];
    if (!level) {
      Alert.alert('Erreur', 'Niveau non trouvé');
      return;
    }

    // Transformer en objet workout pour WorkoutPreviewScreen
    const workout = {
      id: level.id,
      name: `${skill.name} - ${level.name}`,
      subtitle: level.subtitle || '',
      description: skill.description || `Entraînement ${skill.name} niveau ${level.id}`,
      difficulty: skill.difficulty || 'Intermédiaire',
      estimatedDuration: null, // Sera calculé dans WorkoutPreviewScreen
      xpReward: level.xpReward || 100,
      exercises: level.exercises || [],
    };

    // Naviguer vers l'aperçu
    navigation.navigate('WorkoutPreview', { workout });
  };

  const handleViewActiveProgram = (programId) => {
    // Naviguer vers la vue détaillée du programme (arbre de compétences)
    navigation.navigate('SkillTree', { programId });
  };

  const handleViewProgram = (programId) => {
    navigation.navigate('SkillTree', { programId });
  };



  const handleTooltipDismiss = async () => {
    try {
      await AsyncStorage.setItem('@fitnessrpg:tree_tooltip_shown', 'true');
      setShowTooltip(false);
      
      const firstProgram = userPrograms.find(up => up.isStarted);
      if (firstProgram) {
        navigation.navigate('SkillTree', { programId: firstProgram.program.id });
      }
    } catch (error) {
      console.error('Erreur sauvegarde tooltip:', error);
    }
  };

  // Handlers pour les programmes
  const handleViewTree = (programId) => {
    navigation.navigate('SkillTree', { programId });
  };

  const handleContinueProgram = (programId, currentLevel) => {
    navigation.navigate('SkillTree', { 
      programId, 
      highlightLevel: currentLevel 
    });
  };

  // Composant Mes Programmes
  const MyProgramsSection = ({ programs, onViewTree, onContinue }) => {
    if (!programs || programs.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Mes Programmes</Text>
        
        {programs.map(({ program, progress }) => {
          const hasStarted = progress && progress.level > 0;
          const completionPercentage = progress ? Math.round((progress.completedSkills / progress.totalSkills) * 100) : 0;
          
          return (
            <Card 
              key={program.id} 
              style={styles.programCard}
              ref={program.id === programs[0]?.program?.id ? firstCardRef : null}
            >
              <Card.Content>
                <View style={styles.programHeader}>
                  <Text style={styles.programIcon}>{program.icon}</Text>
                  <View style={styles.programInfo}>
                    <Text style={styles.programName}>{program.name}</Text>
                    {hasStarted ? (
                      <Text style={styles.programProgress}>
                        Niveau {progress.level} • {completionPercentage}% complété
                      </Text>
                    ) : (
                      <Text style={styles.programProgress}>
                        Non commencé • {progress.totalSkills} compétences disponibles
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.programActions}>
                  <Button
                    mode="outlined"
                    onPress={() => onViewTree(program.id)}
                    style={styles.actionButton}
                    icon="file-tree"
                    compact
                  >
                    Voir l'arbre
                  </Button>
                  
                  {hasStarted && (
                    <Button
                      mode="contained"
                      onPress={() => onContinue(program.id, progress.level)}
                      style={styles.actionButton}
                      icon="play"
                      compact
                    >
                      Continuer niveau {progress.level}
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          );
        })}
        
        <Button
          mode="text"
          onPress={() => navigation.navigate('ProgramSelection')}
          style={styles.addProgramButton}
          icon="plus"
        >
          Ajouter un programme
        </Button>
      </View>
    );
  };

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

  // Détection mode - vérifier si l'utilisateur a sélectionné des programmes dans Firestore
  const forceShowDashboard = route.params?.forceShowDashboard;
  // Note: L'onboarding est maintenant géré par OnboardingScreen.js séparé via App.js

  if (loading || hasSelectedPrograms === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de ton profil...</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/Home-BG-0.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <ScrollView 
        style={styles.scrollContainer}
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
            avatarId={userStats.avatarId || 0}
          />

          {/* Streak */}
          <StreakCard streak={userStats.streakDays} />

        {/* ===== NOUVELLE SECTION : Programmes Actifs ===== */}
        {loadingQueue ? (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <ActivityIndicator size="small" color={colors.primary} />
            </Card.Content>
          </Card>
        ) : activePrograms.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                ⚔️ Quêtes en cours
              </Text>
              <TouchableOpacity
                style={styles.manageButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProgramSelection')}
              >
                <Text style={styles.manageButtonIcon}>⚙️</Text>
                <Text style={styles.manageButtonText}>Gérer</Text>
              </TouchableOpacity>
            </View>
            {activePrograms.map(program => (
              <ActiveProgramCard
                key={program.id}
                program={program}
                onPress={() => handleViewActiveProgram(program.id)}
              />
            ))}
          </View>
        ) : (
          <Card style={[styles.sectionCard, styles.emptyStateCard]}>
            <Card.Content style={styles.emptyStateContent}>
              <View style={styles.emptyStateIconContainer}>
                <Text style={styles.emptyStateIcon}>📋</Text>
              </View>
              <Text style={styles.emptyStateTitle}>
                Aucun programme actif
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Active un programme pour commencer ton aventure
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ProgramSelection')}
                style={styles.emptyStateButton}
                labelStyle={styles.emptyStateButtonLabel}
                buttonColor={colors.primary}
              >
                Choisir un programme
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* ===== NOUVELLE SECTION : Queue de Séances ===== */}
        {sessionQueue.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🎯 Missions disponibles
              </Text>
            </View>
            {sessionQueue.slice(0, 5).map(session => (
              <MissionCard
                key={session.id}
                session={session}
                onPreview={() => handlePreviewSession(session)}
                onStart={() => handleStartSession(session)}
                disabled={session.status === 'completed'}
              />
            ))}
          </View>
        )}



        {/* Dernière séance */}
        <LastSessionCard session={lastSession} />

        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
      </Animated.View>
      </ScrollView>
      
      {showTooltip && cardLayout && (
        <TreeTooltipOverlay 
          cardLayout={cardLayout}
          onDismiss={handleTooltipDismiss}
        />
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
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
  
  // Onboarding
  onboardingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  onboardingContent: {
    alignItems: 'center',
  },
  onboardingQuote: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 36,
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  onboardingFeatures: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
    marginTop: 2,
    width: 36,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureTextBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  startButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
  startButtonContent: {
    paddingVertical: 8,
  },
  resetButton: {
    marginTop: 20,
    opacity: 0.7,
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

  // Program section styles
  programCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  programIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  programProgress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  programActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  addProgramButton: {
    marginHorizontal: 16,
    marginTop: 8,
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

  // Nouvelles sections
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.3,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(77, 158, 255, 0.15)', // Fond unique simplifié
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.4)',
    gap: 6,
  },
  manageButtonIcon: {
    fontSize: 16,
    color: '#4D9EFF',
  },
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
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    elevation: 0,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateIcon: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    elevation: 2,
  },
  emptyStateButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;
