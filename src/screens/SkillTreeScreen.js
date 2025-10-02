import React, { useState, useEffect, useCallback } from 'react';
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
import { Modal, Portal, Button, Divider, Badge, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import SkillNode from '../components/SkillNode';
import programs from '../data/programs.json';
import { colors } from '../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dimensions responsives de l'arbre
const NODE_SIZE = 80;
const PADDING = 20;
// Calcul responsive : largeur disponible / 5 colonnes
const COLUMN_WIDTH = Math.max(120, (screenWidth - PADDING * 2) / 5);
// Hauteur adaptée pour 15 tiers (augmenté pour avoir plus d'espace)
const ROW_HEIGHT = Math.max(140, COLUMN_WIDTH * 1.2);
const TREE_WIDTH = 5 * COLUMN_WIDTH;
const TREE_HEIGHT = 15 * ROW_HEIGHT; // Augmenté de 10 à 15

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
    
    // Centre du nœud circulaire (80x80) dans le container (100 width)
    // Le nœud est centré dans son container, donc offset de (100-80)/2 = 10px
    // Ajustement de quelques pixels vers la droite pour un alignement parfait
    const nodeOffset = (SKILLNODE_CONTAINER_WIDTH - NODE_SIZE) / 2 + 5; // +5px vers la droite
    
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
      top: fromCenterY - 1.5, // Centrer la ligne verticalement
      width: distance,
      backgroundColor: 'transparent', // Sera défini dans le rendu
      transform: `rotate(${angle}deg)`,
      transformOrigin: '0 50%',
      // Z-index sera défini dans renderConnections
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
            
            let lineColor, opacity, height, shadowColor;
            
            if (isUnlocked) {
              // Lignes vers nœuds UNLOCKED : couleur du programme source
              lineColor = program.color || colors.primary;
              opacity = 0.8;
              height = 3;
              shadowColor = program.color || colors.primary;
            } else {
              // Lignes vers nœuds LOCKED - Plus visibles
              lineColor = '#666666';
              opacity = 0.4; // Augmenté de 0.15 à 0.4
              height = 2;
              shadowColor = 'transparent';
            }

            // Style unifié pour toutes les lignes (pas de segments pour éviter les problèmes d'alignement)
            const lineId = `${program.id}-${unlockedId}`;
            const animatedOpacity = animatedLines.get(lineId);
            
            if (animatedOpacity && isUnlocked) {
              // Ligne animée pour unlocked
              connections.push(
                <Animated.View
                  key={lineId}
                  style={[
                    lineStyle,
                    {
                      height: height,
                      backgroundColor: lineColor,
                      opacity: animatedOpacity,
                      zIndex: 1,
                      borderRadius: height / 2,
                      shadowColor: shadowColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  ]}
                />
              );
            } else {
              // Ligne statique (locked ou unlocked)
              connections.push(
                <View
                  key={lineId}
                  style={[
                    lineStyle,
                    {
                      height: height,
                      backgroundColor: lineColor,
                      opacity: opacity,
                      zIndex: 1,
                      borderRadius: height / 2,
                      // Glow seulement pour unlocked
                      ...(isUnlocked && {
                        shadowColor: shadowColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 4,
                        elevation: 2,
                      })
                    }
                  ]}
                />
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
          contentContainerStyle={[
            styles.modalContainer,
            { borderColor: selectedProgram.color }
          ]}
        >
          {/* Header avec icône du programme */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalIcon}>{selectedProgram.icon}</Text>
            <IconButton 
              icon="close" 
              size={24} 
              onPress={closeModal}
              style={styles.modalCloseButton}
            />
          </View>

          {/* Titre et infos principales */}
          <View style={styles.modalTitleSection}>
            <Text style={styles.modalTitle}>{selectedProgram.name}</Text>
            <Badge 
              style={[styles.difficultyBadge, { backgroundColor: selectedProgram.color }]}
            >
              {selectedProgram.difficulty}
            </Badge>
          </View>

          <Text style={styles.modalDescription}>
            {selectedProgram.description}
          </Text>

          <Divider style={styles.modalDivider} />

          {/* Informations du programme */}
          <View style={styles.modalInfoSection}>
            <Text style={styles.modalSectionTitle}>📊 Informations</Text>
            <View style={styles.modalInfoGrid}>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Durée</Text>
                <Text style={styles.modalInfoValue}>{selectedProgram.totalWeeks} semaines</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>XP Reward</Text>
                <Text style={styles.modalInfoValue}>{selectedProgram.xpReward} XP</Text>
              </View>
            </View>
          </View>

          <Divider style={styles.modalDivider} />

          {/* Prérequis avec statuts */}
          {prerequisites.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔒 Prérequis</Text>
              {prerequisites.map(prereq => (
                <View key={prereq.id} style={styles.modalPrereqItem}>
                  <Text style={styles.modalPrereqText}>• {prereq.name}</Text>
                  <Badge 
                    style={[
                      styles.modalPrereqBadge,
                      { backgroundColor: prereq.completed ? colors.success : colors.error }
                    ]}
                  >
                    {prereq.completed ? '✓' : '✗'}
                  </Badge>
                </View>
              ))}
            </View>
          )}

          {/* Compétences débloquées */}
          {unlockedPrograms.length > 0 && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🔓 Débloque</Text>
              {unlockedPrograms.map(program => (
                <Text key={program.id} style={styles.modalUnlockText}>
                  • {program.name}
                </Text>
              ))}
            </View>
          )}

          {/* Bouton d'action */}
          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={navigateToDetailsFromModal}
              style={[styles.modalButton, { backgroundColor: selectedProgram.color }]}
              labelStyle={styles.modalButtonText}
            >
              Voir les détails
            </Button>
          </View>

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏋️ Street Workout</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {userStats.totalCompleted}/{streetPrograms.length} compétences débloquées
          </Text>
          <Text style={styles.xpText}>
            {userStats.totalXP} XP • Tier {userStats.currentTier}
          </Text>
        </View>
      </View>

      {/* Badge Admin */}
      {isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>👑 MODE ADMIN - Toutes les compétences débloquées</Text>
        </View>
      )}

      {/* Arbre de compétences */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          contentContainerStyle={{ 
            height: TREE_HEIGHT + PADDING * 2, 
            paddingHorizontal: PADDING, 
            paddingVertical: PADDING 
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8
  },
  statsContainer: {
    alignItems: 'center'
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  xpText: {
    fontSize: 14,
    color: colors.textSecondary
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
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxHeight: screenHeight * 0.8,
    borderWidth: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  modalCloseButton: {
    margin: 0,
    padding: 0,
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  difficultyBadge: {
    marginLeft: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalInfoSection: {
    marginBottom: 8,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalPrereqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalPrereqText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  modalPrereqBadge: {
    marginLeft: 12,
    minWidth: 24,
  },
  modalUnlockText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  modalActions: {
    marginTop: 8,
  },
  modalButton: {
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default SkillTreeScreen;
