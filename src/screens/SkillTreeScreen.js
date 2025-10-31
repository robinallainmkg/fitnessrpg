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
  Animated,
  ImageBackground
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line as SvgLine, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import SkillNode from '../components/SkillNode';
import { loadProgramsMeta } from '../data/programsLoader';
import { loadProgramTree } from '../utils/programLoader';
import { colors } from '../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ═══ Pattern images: {categoryId}-bg.jpg ou selon programs-meta.json
const getProgramImageSource = (categoryId) => {
  const imageMap = {
    street: require('../../assets/programmes/street-bg.jpg'),
    running: require('../../assets/programmes/running-5.jpg'),
    // Ajouter les nouvelles images ici: yoga: require('../../assets/programmes/yoga-bg.jpg'),
  };
  return imageMap[categoryId] || null;
};

// Dimensions responsives de l'arbre
const NODE_SIZE = 80;
const PADDING = 40;
// Calcul responsive : largeur disponible / 5 colonnes - réduit pour plus de densité
const COLUMN_WIDTH = Math.max(150, (screenWidth - PADDING * 2) / 5.5); // Réduit de 180 à 150
// Hauteur réduite pour rapprocher les blocs verticalement
const ROW_HEIGHT = Math.max(110, COLUMN_WIDTH * 0.75); // Réduit de 1.0 à 0.75 et 140 à 110
const TREE_WIDTH = 5 * COLUMN_WIDTH + PADDING * 2; // Inclut le padding des deux côtés
const TREE_HEIGHT = 15 * ROW_HEIGHT + PADDING * 2; // Inclut le padding des deux côtés

const SkillTreeScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const userId = user?.uid;
  
  // ⭐ CORRECTION: Lire le programId des params, fallback sur 'street'
  const programId = route.params?.programId || 'street';
  const [userProgress, setUserProgress] = useState({});
  const [completedPrograms, setCompletedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [animatedLines, setAnimatedLines] = useState(new Map()); // Map pour les animations de lignes
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentPrograms, setCurrentPrograms] = useState([]);
  
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

  // Charger les métadonnées de la catégorie et le tree
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        console.log(`🌳 [SkillTree] Chargement ${programId}...`);
        
        // Charger métadonnées
        const meta = await loadProgramsMeta();
        const category = meta.categories.find(cat => cat.id === programId);
        
        if (!category) {
          console.error(`❌ [SkillTree] Catégorie ${programId} non trouvée`);
          return;
        }
        
        setCurrentCategory(category);
        
        // Charger le tree
        const treeData = await loadProgramTree(programId);
        if (treeData && treeData.tree) {
          setCurrentPrograms(treeData.tree);
          console.log(`✅ [SkillTree] ${programId} chargé: ${treeData.tree.length} programmes`);
        }
      } catch (error) {
        console.error(`❌ [SkillTree] Erreur chargement ${programId}:`, error);
      }
    };
    
    loadCategoryData();
  }, [programId]);
  
  console.log('📱 DEBUG ARBRE:', {
    programId,
    categoryFound: !!currentCategory,
    categoryName: currentCategory?.name,
    programsCount: currentPrograms.length,
    firstProgram: currentPrograms[0]?.name,
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
        const program = currentPrograms.find(p => p.id === programId);
        return sum + (program?.xpReward || 0);
      }, 0);

      // Calcule le tier actuel (le plus haut tier débloqué)
      let currentTier = 0;
      currentPrograms.forEach(program => {
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
    if (!loading && currentPrograms.length > 0 && horizontalScrollRef.current && verticalScrollRef.current) {
      // Trouver "Fondations Débutant" ou la première compétence
      const firstProgram = currentPrograms.find(p => p.id === 'beginner-foundation') || currentPrograms[0];
      
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
  }, [loading, currentPrograms]);

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
  const handleNodePress = useCallback(async (program) => {
    console.log('🔥 CLIC DÉTECTÉ sur:', program.name, 'ID:', program.id);
    
    const state = getProgramState(program);
    const isUnlocked = state === 'UNLOCKED' || state === 'IN_PROGRESS' || state === 'COMPLETED';
    const progress = userProgress[program.id];
    
    console.log('🔥 Clic sur programme:', program.name, 'État:', state, 'Débloqué:', isUnlocked);
    
    // Charger les détails complets du programme (avec levels)
    const { loadProgramDetails } = require('../data/programsLoader');
    const programDetails = await loadProgramDetails(programId, program.id);
    
    console.log('📥 Détails chargés pour', program.id, ':', programDetails);
    
    // Fusionner les données du tree avec les détails
    const fullProgram = {
      ...program,
      ...programDetails
    };
    
    // Navigate dans TOUS les cas (locked ou unlocked)
    navigation.navigate('ProgramDetail', {
      program: fullProgram,
      category: currentCategory || { name: 'Street Workout' },
      userProgress: progress || null,
      isLocked: !isUnlocked, // NOUVEAU : passe l'info locked/unlocked
      programState: state,
      completedPrograms,
      allPrograms: currentPrograms
    });
  }, [getProgramState, completedPrograms, currentPrograms, navigation, currentCategory, userProgress, programId]);

  // Gère le long press sur un nœud
  const handleNodeLongPress = useCallback((program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  }, []);

  // Obtient les compétences prérequises avec leurs statuts
  const getPrerequisitesWithStatus = useCallback((program) => {
    return program.prerequisites.map(prereqId => {
      const prereqProgram = currentPrograms.find(p => p.id === prereqId);
      const isCompleted = completedPrograms.includes(prereqId);
      return {
        id: prereqId,
        name: prereqProgram?.name || prereqId,
        completed: isCompleted
      };
    });
  }, [currentPrograms, completedPrograms]);

  // Obtient les compétences que cette compétence débloque
  const getUnlockedPrograms = useCallback((program) => {
    return program.unlocks?.map(unlockedId => {
      const unlockedProgram = currentPrograms.find(p => p.id === unlockedId);
      return {
        id: unlockedId,
        name: unlockedProgram?.name || unlockedId
      };
    }) || [];
  }, [currentPrograms]);

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
    currentPrograms.forEach((program) => {
      if (program.unlocks && program.unlocks.length > 0) {
        program.unlocks.forEach(unlockedId => {
          const unlockedProgram = currentPrograms.find(p => p.id === unlockedId);
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
  }, [completedPrograms, userProgress, animateLineUnlock, currentPrograms, getProgramState, animatedLines]);

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

  // Rend les connexions entre les nœuds avec SVG pour les traits pointillés
  const renderConnectionsSvg = useCallback(() => {
    const lines = [];

    currentPrograms.forEach((program) => {
      if (program.unlocks && program.unlocks.length > 0) {
        program.unlocks.forEach(unlockedId => {
          const unlockedProgram = currentPrograms.find(p => p.id === unlockedId);
          if (unlockedProgram) {
            const fromState = getProgramState(program);
            const toState = getProgramState(unlockedProgram);
            const isUnlocked = toState === 'UNLOCKED' || toState === 'IN_PROGRESS' || toState === 'COMPLETED';

            // Calcul des positions
            const SKILLNODE_CONTAINER_WIDTH = 100;
            const SKILLNODE_MARGIN = 8;
            const nodeOffset = (SKILLNODE_CONTAINER_WIDTH - NODE_SIZE) / 2;
            
            const fromContainerX = program.position.x * COLUMN_WIDTH + (COLUMN_WIDTH - SKILLNODE_CONTAINER_WIDTH) / 2 + PADDING;
            const fromContainerY = program.position.y * ROW_HEIGHT + (ROW_HEIGHT - NODE_SIZE) / 2 + PADDING;
            const toContainerX = unlockedProgram.position.x * COLUMN_WIDTH + (COLUMN_WIDTH - SKILLNODE_CONTAINER_WIDTH) / 2 + PADDING;
            const toContainerY = unlockedProgram.position.y * ROW_HEIGHT + (ROW_HEIGHT - NODE_SIZE) / 2 + PADDING;
            
            const fromCenterX = fromContainerX + nodeOffset + NODE_SIZE / 2;
            const fromCenterY = fromContainerY + SKILLNODE_MARGIN + NODE_SIZE / 2;
            const toCenterX = toContainerX + nodeOffset + NODE_SIZE / 2;
            const toCenterY = toContainerY + SKILLNODE_MARGIN + NODE_SIZE / 2;

            const lineId = `${program.id}-${unlockedId}`;
            const strokeColor = isUnlocked ? '#4D9EFF' : '#999';
            const strokeOpacity = isUnlocked ? 0.8 : 0.3;
            const strokeWidth = isUnlocked ? 2.5 : 1.5;

            lines.push({
              x1: fromCenterX,
              y1: fromCenterY,
              x2: toCenterX,
              y2: toCenterY,
              color: strokeColor,
              opacity: strokeOpacity,
              width: strokeWidth,
              isUnlocked,
              lineId,
            });
          }
        });
      }
    });

    if (lines.length === 0) return null;

    return (
      <Svg
        width={TREE_WIDTH}
        height={TREE_HEIGHT}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <Defs>
          <SvgLinearGradient id="unlockedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#4D9EFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7B61FF" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {lines.map((line) => (
          <SvgLine
            key={line.lineId}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.isUnlocked ? 'url(#unlockedGradient)' : line.color}
            strokeWidth={line.width}
            strokeOpacity={line.opacity}
            strokeDasharray={line.isUnlocked ? '0' : '4,3'}
            strokeLinecap="round"
          />
        ))}
      </Svg>
    );
  }, [currentPrograms, getProgramState]);

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

          {/* Header avec icône et titre */a}
          <View style={styles.modalHeader}>
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

      {/* Header avec image de background - DYNAMIQUE selon le programme */}
      <ImageBackground
        source={getProgramImageSource(programId)}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        {/* Overlay sombre avec gradient pour la lisibilité */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.7)',
            'rgba(0, 0, 0, 0.85)',
            'rgba(15, 23, 42, 0.95)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerOverlay}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{currentCategory?.name || 'Programme'}</Text>
            <Text style={styles.headerDescription}>Arbre de progression</Text>
            <View style={styles.badgesContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Compétences</Text>
                <Text style={styles.badgeValue}>
                  {userStats.totalCompleted}/{currentPrograms.length}
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
          </View>
        </LinearGradient>
      </ImageBackground>

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

            {/* Nœuds */}
            {currentPrograms.map(program => {
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

            {/* Connexions SVG - RENDU APRÈS les nœuds avec z-index supérieur */}
            {renderConnectionsSvg()}

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
  // 🖼️ Header avec image de background
  headerBackground: {
    width: '100%',
    overflow: 'hidden',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerOverlay: {
    width: '100%',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  headerDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    minWidth: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '800',
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
    zIndex: 2
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
