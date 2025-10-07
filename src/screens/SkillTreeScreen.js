import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import SkillNode from '../components/SkillNode';
import programs from '../data/programs.json';
import { colors } from '../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dimensions responsives de l'arbre
const NODE_SIZE = 80;
const PADDING = 40;
// Calcul responsive : largeur disponible / 5 colonnes
const COLUMN_WIDTH = Math.max(180, (screenWidth - PADDING * 2) / 5);
// Hauteur réduite pour rapprocher les blocs verticalement
const ROW_HEIGHT = Math.max(140, COLUMN_WIDTH * 1.0);
const TREE_WIDTH = 5 * COLUMN_WIDTH + PADDING * 2; // Inclut le padding des deux côtés
const TREE_HEIGHT = 15 * ROW_HEIGHT + PADDING * 2; // Inclut le padding des deux côtés

const SkillTreeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [userProgress, setUserProgress] = useState({});
  const [completedPrograms, setCompletedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [animatedLines, setAnimatedLines] = useState(new Map()); // Map pour les animations de lignes
  
  // Refs pour le scroll horizontal
  const horizontalScrollRef = useRef(null);
  const verticalScrollRef = useRef(null);
  
  // Mode Admin - emails autorisés (actuellement désactivé)
  const ADMIN_EMAILS = []; // Vide pour désactiver le mode admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const [userStats, setUserStats] = useState({
    totalCompleted: 0,
    totalXP: 0,
    currentTier: 0
  });

  // Récupère le programme Street Workout
  const streetCategory = programs.categories.find(cat => cat.id === 'street');
  const streetPrograms = streetCategory?.programs || [];
  
  console.log('📱 DEBUG ARBRE:', {
    streetCategory: !!streetCategory,
    streetProgramsCount: streetPrograms.length,
    firstProgram: streetPrograms[0]?.name,
    loading,
    dataLoaded
  });

  // Charge les données utilisateur - VERSION MOCK
  const loadUserData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      console.log('📱 MOCK: Chargement données SkillTree...');

      // Mock user progress
      const progressData = {
        'pull-up-basics': { 
          currentLevel: 2, 
          xp: 150, 
          programId: 'pull-up-basics',
          userId: userId 
        },
        'muscle-up-prep': { 
          currentLevel: 1, 
          xp: 50, 
          programId: 'muscle-up-prep',
          userId: userId 
        }
      };
      setUserProgress(progressData);

      // Mock user data
      const userData = {
        totalXP: 200,
        completedPrograms: ['pull-up-basics']
      };
      const completed = userData?.completedPrograms || [];
      setCompletedPrograms(completed);

      // Calcule les statistiques
      const totalCompleted = completed.length;
      const totalXP = completed.reduce((sum, programId) => {
        const program = streetPrograms.find(p => p.id === programId);
        return sum + (program?.xpReward || 0);
      }, 0);

      // Calcule le tier actuel (le plus haut tier débloqué)
      let currentTier = 0;
      streetPrograms.forEach(program => {
        const isUnlocked = program.prerequisites.length === 0 || 
          program.prerequisites.every(prereq => completed.includes(prereq));
        if (isUnlocked && program.position.tier > currentTier) {
          currentTier = program.position.tier;
        }
      });

      setUserStats({
        totalCompleted,
        totalXP,
        currentTier
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger vos progrès');
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && !dataLoaded) {
      loadUserData();
    }
  }, [userId]);

  // Centrage automatique sur la première compétence
  useEffect(() => {
    if (!loading && streetPrograms.length > 0 && horizontalScrollRef.current && verticalScrollRef.current) {
      // Trouver "Fondations Débutant" ou la première compétence
      const firstProgram = streetPrograms.find(p => p.id === 'beginner-foundation') || streetPrograms[0];
      
      if (firstProgram) {
        const SKILLNODE_CONTAINER_WIDTH = 100;
        
        // Calculer la position du centre du nœud
        const nodeX = firstProgram.position.x * COLUMN_WIDTH + (COLUMN_WIDTH - SKILLNODE_CONTAINER_WIDTH) / 2 + PADDING + (SKILLNODE_CONTAINER_WIDTH / 2);
        const nodeY = firstProgram.position.y * ROW_HEIGHT + (ROW_HEIGHT - NODE_SIZE) / 2 + PADDING;
        
        // Centrer horizontalement et verticalement avec un délai pour que les ScrollViews soient montés
        setTimeout(() => {
          if (horizontalScrollRef.current) {
            // Centrer le nœud au milieu de l'écran
            const scrollX = nodeX - (screenWidth / 2);
            horizontalScrollRef.current.scrollTo({
              x: Math.max(0, scrollX),
              animated: true
            });
          }
          if (verticalScrollRef.current) {
            verticalScrollRef.current.scrollTo({
              y: Math.max(0, nodeY - 200),
              animated: true
            });
          }
        }, 100);
      }
    }
  }, [loading, streetPrograms]);

  // Détermine l'état d'un programme
  const getProgramState = useCallback((program) => {
    const isCompleted = completedPrograms.includes(program.id);
    const isUnlocked = program.prerequisites.length === 0 || 
      program.prerequisites.every(prereq => completedPrograms.includes(prereq));
    const progress = userProgress[program.id];
    const hasProgress = progress && progress.currentLevel > 0;

    // MODE ADMIN : Tout est débloqué !
    if (isAdmin) {
      if (isCompleted) return 'COMPLETED';
      if (hasProgress) return 'IN_PROGRESS';
      return 'UNLOCKED'; // Admin = tout débloqué
    }

    // Force TOUJOURS "Fondations Débutant" comme débloqué (programme de base)
    if (program.id === 'beginner-foundation') {
      if (isCompleted) return 'COMPLETED';
      if (hasProgress) return 'IN_PROGRESS';
      return 'UNLOCKED'; // Toujours débloqué
    }

    if (isCompleted) return 'COMPLETED';
    if (hasProgress) return 'IN_PROGRESS';
    if (isUnlocked) return 'UNLOCKED';
    return 'LOCKED';
  }, [completedPrograms, userProgress, isAdmin]);

  // Gère le tap sur un nœud
  const handleNodePress = useCallback((program) => {
    console.log('🔥 CLIC DÉTECTÉ sur:', program.name, 'ID:', program.id);
    
    const state = getProgramState(program);
    const isUnlocked = state === 'UNLOCKED' || state === 'IN_PROGRESS' || state === 'COMPLETED';
    const progress = userProgress[program.id];
    
    console.log('🔥 Clic sur programme:', program.name, 'État:', state, 'Débloqué:', isUnlocked);
    
    // Navigate dans TOUS les cas (locked ou unlocked)
    navigation.navigate('ProgramDetail', {
      program,
      category: streetCategory?.name || 'Street Workout',
      userProgress: progress || null,
      isLocked: !isUnlocked, // NOUVEAU : passe l'info locked/unlocked
      programState: state,
      completedPrograms,
      allPrograms: streetPrograms
    });
  }, [getProgramState, completedPrograms, streetPrograms, navigation, streetCategory, userProgress]);

  // Gère le long press sur un nœud
  const handleNodeLongPress = useCallback((program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  }, []);

  // Obtient les compétences prérequises avec leurs statuts
  const getPrerequisitesWithStatus = useCallback((program) => {
    return program.prerequisites.map(prereqId => {
      const prereqProgram = streetPrograms.find(p => p.id === prereqId);
      const isCompleted = completedPrograms.includes(prereqId);
      return {
        id: prereqId,
        name: prereqProgram?.name || prereqId,
        completed: isCompleted
      };
    });
  }, [streetPrograms, completedPrograms]);

  // Obtient les compétences que cette compétence débloque
  const getUnlockedPrograms = useCallback((program) => {
    return program.unlocks?.map(unlockedId => {
      const unlockedProgram = streetPrograms.find(p => p.id === unlockedId);
      return {
        id: unlockedId,
        name: unlockedProgram?.name || unlockedId
      };
    }) || [];
  }, [streetPrograms]);

  // Ferme la modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedProgram(null);
  }, []);

  // Navigate vers les détails depuis la modal
  const navigateToDetailsFromModal = useCallback(() => {
    if (selectedProgram) {
      closeModal();
      handleNodePress(selectedProgram);
    }
  }, [selectedProgram, closeModal, handleNodePress]);

  // Fonction pour animer une ligne quand elle se débloque
  const animateLineUnlock = useCallback((lineId) => {
    const animValue = new Animated.Value(0.15);
    setAnimatedLines(prev => new Map(prev.set(lineId, animValue)));
    
    Animated.timing(animValue, {
      toValue: 0.8,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []);

  // Détecte les changements d'état des compétences pour animer les lignes
  useEffect(() => {
    streetPrograms.forEach((program) => {
      if (program.unlocks && program.unlocks.length > 0) {
        program.unlocks.forEach(unlockedId => {
          const unlockedProgram = streetPrograms.find(p => p.id === unlockedId);
          if (unlockedProgram) {
            const toState = getProgramState(unlockedProgram);
            const lineId = `${program.id}-${unlockedId}`;
            
            // Si le programme vient de se débloquer et qu'on n'a pas encore animé cette ligne
            if ((toState === 'UNLOCKED' || toState === 'IN_PROGRESS' || toState === 'COMPLETED') && 
                !animatedLines.has(lineId)) {
              animateLineUnlock(lineId);
            }
          }
        });
      }
    });
  }, [completedPrograms, userProgress, animateLineUnlock, streetPrograms, getProgramState, animatedLines]);

  // Calcul précis des positions de lignes avec compensation des marges SkillNode
  const calculateConnectionLine = useCallback((fromProgram, toProgram) => {
    // Position du container SkillNode (avec width: 100 et margin: 8)
    const SKILLNODE_MARGIN = 8;
    const SKILLNODE_CONTAINER_WIDTH = 100;
    
    // Position de base de chaque container SkillNode
    const fromContainerX = fromProgram.position.x * COLUMN_WIDTH + (COLUMN_WIDTH - SKILLNODE_CONTAINER_WIDTH) / 2 + PADDING;
    const fromContainerY = fromProgram.position.y * ROW_HEIGHT + (ROW_HEIGHT - NODE_SIZE) / 2 + PADDING;
    const toContainerX = toProgram.position.x * COLUMN_WIDTH + (COLUMN_WIDTH - SKILLNODE_CONTAINER_WIDTH) / 2 + PADDING;
    const toContainerY = toProgram.position.y * ROW_HEIGHT + (ROW_HEIGHT - NODE_SIZE) / 2 + PADDING;
    
    // Centre exact du nœud circulaire (80x80) dans le container (100 width)
    // Le nœud est centré dans son container : offset de (100-80)/2 = 10px
    const nodeOffset = (SKILLNODE_CONTAINER_WIDTH - NODE_SIZE) / 2;
    
    const fromCenterX = fromContainerX + nodeOffset + NODE_SIZE / 2;
    const fromCenterY = fromContainerY + SKILLNODE_MARGIN + NODE_SIZE / 2;
    const toCenterX = toContainerX + nodeOffset + NODE_SIZE / 2;
    const toCenterY = toContainerY + SKILLNODE_MARGIN + NODE_SIZE / 2;

    // Calcul de la ligne
    const deltaX = toCenterX - fromCenterX;
    const deltaY = toCenterY - fromCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    return {
      position: 'absolute',
      left: fromCenterX,
      top: fromCenterY - 2, // Centrer la ligne verticalement (height 4 / 2)
      width: distance,
      height: 4,
      backgroundColor: 'transparent',
      transform: [{ rotate: `${angle}deg` }],
      transformOrigin: '0 50%',
      zIndex: 1,
    };
  }, []);

  // Rend les connexions entre les nœuds avec styles améliorés
  const renderConnections = useCallback(() => {
    const connections = [];

    streetPrograms.forEach((program, index) => {
      if (program.unlocks && program.unlocks.length > 0) {
        program.unlocks.forEach(unlockedId => {
          const unlockedProgram = streetPrograms.find(p => p.id === unlockedId);
          if (unlockedProgram) {
            const lineStyle = calculateConnectionLine(program, unlockedProgram);
            const fromState = getProgramState(program);
            const toState = getProgramState(unlockedProgram);
            
            // Détermine si la ligne mène à un nœud débloqué
            const isUnlocked = toState === 'UNLOCKED' || toState === 'IN_PROGRESS' || toState === 'COMPLETED';
            
            // Style de ligne selon l'état
            const lineColor = program.color || '#4D9EFF';
            const opacity = isUnlocked ? 0.9 : 0.3; // Lignes vers locked sont semi-transparentes
            const gradientColors = isUnlocked 
              ? ['#4D9EFF', '#7B61FF']  // Bleu-violet pour débloqué
              : ['#555', '#444'];        // Gris pour verrouillé
            
            // Style unifié pour toutes les lignes
            const lineId = `${program.id}-${unlockedId}`;
            const animatedOpacity = animatedLines.get(lineId);
            
            if (animatedOpacity && isUnlocked) {
              // Ligne animée avec gradient (uniquement pour débloquées)
              connections.push(
                <Animated.View
                  key={lineId}
                  style={[
                    lineStyle,
                    {
                      overflow: 'hidden',
                      borderRadius: 2,
                      opacity: animatedOpacity,
                    }
                  ]}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      shadowColor: '#4D9EFF',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </Animated.View>
              );
            } else {
              // Ligne statique avec gradient (wrapper View nécessaire pour transform)
              connections.push(
                <View
                  key={lineId}
                  style={[
                    lineStyle,
                    {
                      overflow: 'hidden',
                      borderRadius: 2,
                      opacity: opacity,
                    }
                  ]}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      shadowColor: isUnlocked ? '#4D9EFF' : '#000',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: isUnlocked ? 0.6 : 0.2,
                      shadowRadius: isUnlocked ? 4 : 2,
                      elevation: isUnlocked ? 2 : 1,
                    }}
                  />
                </View>
              );
            }
          }
        });
      }
    });

    return connections;
  }, [streetPrograms, calculateConnectionLine, getProgramState, animatedLines]);

  // Modal de détails avec React Native Paper
  const renderModal = () => {
    if (!selectedProgram) return null;

    const programState = getProgramState(selectedProgram);
    const prerequisites = getPrerequisitesWithStatus(selectedProgram);
    const unlockedPrograms = getUnlockedPrograms(selectedProgram);

    return (
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          {/* Icône close en haut à droite */}
          <TouchableOpacity 
            onPress={closeModal}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseIcon}>✕</Text>
          </TouchableOpacity>

          {/* Header avec icône et titre */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { borderColor: selectedProgram.color }]}>
              <Text style={styles.modalIcon}>{selectedProgram.icon}</Text>
            </View>
            <Text style={styles.modalTitle}>{selectedProgram.name}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: selectedProgram.color }]}>
              <Text style={styles.difficultyText}>{selectedProgram.difficulty}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.modalDescription}>
            {selectedProgram.description}
          </Text>

          {/* XP Reward - mis en avant */}
          <View style={[styles.xpRewardContainer, { borderColor: selectedProgram.color }]}>
            <Text style={styles.xpRewardLabel}>Récompense XP</Text>
            <Text style={[styles.xpRewardValue, { color: selectedProgram.color }]}>
              +{selectedProgram.xpReward} XP
            </Text>
          </View>

          {/* Prérequis */}
          {prerequisites.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔒 Prérequis</Text>
              {prerequisites.map(prereq => (
                <View key={prereq.id} style={styles.prerequisiteItem}>
                  <View style={styles.prerequisiteLeft}>
                    <View style={[
                      styles.prerequisiteIndicator,
                      { backgroundColor: prereq.completed ? '#4CAF50' : '#F44336' }
                    ]} />
                    <Text style={styles.prerequisiteText}>{prereq.name}</Text>
                  </View>
                  <Text style={styles.prerequisiteStatus}>
                    {prereq.completed ? '✓' : '✗'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Débloque */}
          {unlockedPrograms.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔓 Débloque</Text>
              {unlockedPrograms.map(program => (
                <View key={program.id} style={styles.unlockItem}>
                  <Text style={styles.unlockIcon}>→</Text>
                  <Text style={styles.unlockText}>{program.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bouton d'action */}
          <TouchableOpacity
            onPress={navigateToDetailsFromModal}
            style={[styles.modalButton, { backgroundColor: selectedProgram.color }]}
          >
            <Text style={styles.modalButtonText}>Commencer le programme</Text>
          </TouchableOpacity>

        </Modal>
      </Portal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de votre arbre...</Text>
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton retour en position absolute */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Header avec gradient - style identique à SkillDetailScreen */}
      <LinearGradient
        colors={['#7B61FF', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>🏋️</Text>
        </View>
        <Text style={styles.headerTitle}>Street Workout</Text>
        <Text style={styles.headerDescription}>Arbre de progression</Text>
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Compétences</Text>
            <Text style={styles.badgeValue}>
              {userStats.totalCompleted}/{streetPrograms.length}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>XP Total</Text>
            <Text style={styles.badgeValue}>{userStats.totalXP}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Tier Max</Text>
            <Text style={styles.badgeValue}>{userStats.currentTier}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Badge Admin */}
      {isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>👑 MODE ADMIN - Toutes les compétences débloquées</Text>
        </View>
      )}

      {/* Arbre de compétences avec scroll horizontal amélioré */}
      <ScrollView
        ref={horizontalScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        decelerationRate="fast"
      >
        <ScrollView
          ref={verticalScrollRef}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          contentContainerStyle={{ 
            width: TREE_WIDTH,
            height: TREE_HEIGHT
          }}
          style={styles.verticalScroll}
        >
          <View style={styles.treeContainer}>

            {/* Connexions */}
            {renderConnections()}

            {/* Nœuds */}
            {streetPrograms.map(program => {
              let state = getProgramState(program);
              const progress = userProgress[program.id];
              
              // Force UNLOCKED pour Fondations Débutant au niveau du rendu
              if (program.id === 'beginner-foundation') {
                state = progress && progress.currentLevel > 0 ? 'IN_PROGRESS' : 
                        completedPrograms.includes(program.id) ? 'COMPLETED' : 'UNLOCKED';
              }
              
              return (
                <View
                  key={program.id}
                  style={[
                    styles.nodeContainer,
                    {
                      left: program.position.x * COLUMN_WIDTH + (COLUMN_WIDTH - 100) / 2 + PADDING, // 100 = SKILLNODE_CONTAINER_WIDTH
                      top: program.position.y * ROW_HEIGHT + (ROW_HEIGHT - NODE_SIZE) / 2 + PADDING
                    }
                  ]}
                >
                  <SkillNode
                    program={program}
                    state={state}
                    progress={progress}
                    onPress={() => handleNodePress(program)}
                    onLongPress={() => handleNodeLongPress(program)}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <Text style={styles.legendItem}>🔒 Verrouillé</Text>
          <Text style={styles.legendItem}>🟢 Disponible</Text>
        </View>
        <View style={styles.legendRow}>
          <Text style={styles.legendItem}>🟡 En cours</Text>
          <Text style={styles.legendItem}>✅ Complété</Text>
        </View>
      </View>

      {/* Modal */}
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    color: colors.textPrimary,
    marginTop: 16,
    fontSize: 16
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerIcon: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    minWidth: 80,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  horizontalScroll: {
    flex: 1,
    backgroundColor: colors.background
  },
  verticalScroll: {
    flex: 1,
    backgroundColor: colors.background
  },
  treeContainer: {
    width: TREE_WIDTH,
    height: TREE_HEIGHT,
    position: 'relative'
  },
  nodeContainer: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    zIndex: 10 // Au-dessus des lignes
  },
  connectionLine: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  legend: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4
  },
  legendItem: {
    fontSize: 12,
    color: colors.textSecondary
  },
  adminBadge: {
    backgroundColor: colors.success,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  adminText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  // Styles pour la nouvelle modal Paper
  modalContainer: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 20,
    padding: 0,
    maxHeight: screenHeight * 0.85,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalDescription: {
    fontSize: 15,
    color: '#AAAAAA',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  xpRewardContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpRewardLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  xpRewardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  prerequisiteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prerequisiteIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  prerequisiteText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  prerequisiteStatus: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  unlockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  unlockIcon: {
    fontSize: 16,
    color: '#4D9EFF',
    marginRight: 12,
    fontWeight: 'bold',
  },
  unlockText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalButton: {
    marginHorizontal: 24,
    marginVertical: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});

export default SkillTreeScreen;
