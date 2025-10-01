import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  List,
  Badge,
  Surface
} from 'react-native-paper';
import { colors } from '../theme/colors';
import programsData from '../data/programs.json';

const ProgramDetailScreen = ({ route, navigation }) => {
  const { 
    program, 
    category, 
    userProgress, 
    isLocked, // NOUVEAU : paramètre direct pour indiquer si locked
    programState,
    completedPrograms,
    allPrograms 
  } = route.params;

  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [expandedExercises, setExpandedExercises] = useState(new Set());
  const scrollViewRef = useRef(null);

  // État du programme - utilise maintenant isLocked directement
  const isProgramLocked = isLocked === true;
  const currentLevel = userProgress?.currentLevel || 1;

  // Initialisation des niveaux expandés : niveau actuel ouvert par défaut
  useEffect(() => {
    if (!isProgramLocked) {
      setExpandedLevels(new Set([currentLevel]));
      
      // Scroll vers le niveau actuel après un délai
      setTimeout(() => {
        scrollToCurrentLevel();
      }, 500);
    }
  }, [currentLevel, isProgramLocked]);

  const scrollToCurrentLevel = () => {
    if (scrollViewRef.current && !isProgramLocked) {
      // Scroll approximatif vers le niveau actuel
      const levelIndex = currentLevel - 1;
      const scrollPosition = levelIndex * 250; // Hauteur approximative par niveau
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  };

  // Logique d'état des niveaux
  const getLevelStatus = (level) => {
    if (isProgramLocked) {
      return {
        status: 'program_locked',
        color: '#666666',
        text: '🔒 Programme verrouillé',
        backgroundColor: '#2A2A2A',
        canPlay: false,
        message: 'Débloque ce programme pour accéder aux niveaux'
      };
    }

    if (level.id < currentLevel) {
      return {
        status: 'completed',
        color: colors.success,
        text: '✅ Complété',
        backgroundColor: '#4CAF5026', // vert 15% opacity
        canPlay: true,
        buttonText: 'Refaire',
        buttonMode: 'outlined'
      };
    } else if (level.id === currentLevel) {
      return {
        status: 'current',
        color: program.color,
        text: '🎯 Niveau actuel',
        backgroundColor: program.color + '33', // 20% opacity
        canPlay: true,
        buttonText: 'Commencer',
        buttonMode: 'contained'
      };
    } else {
      return {
        status: 'locked_level',
        color: '#666666',
        text: '🔒 Verrouillé',
        backgroundColor: 'rgba(255,255,255,0.05)',
        canPlay: false,
        message: `Complète le niveau ${currentLevel} pour débloquer`,
        opacity: 0.6
      };
    }
  };

  // Gestion des prérequis
  const getPrerequisites = () => {
    if (!program.prerequisites || program.prerequisites.length === 0) return [];
    
    return program.prerequisites.map(prereqId => {
      const prereqProgram = allPrograms?.find(p => p.id === prereqId);
      const isCompleted = completedPrograms?.includes(prereqId);
      return {
        id: prereqId,
        name: prereqProgram?.name || prereqId,
        completed: isCompleted,
        program: prereqProgram
      };
    });
  };

  // Navigation vers un prérequis
  const navigateToPrerequisite = (prereqProgram) => {
    if (prereqProgram) {
      navigation.push('ProgramDetail', {
        program: prereqProgram,
        category,
        userProgress: userProgress,
        programState: completedPrograms?.includes(prereqProgram.id) ? 'COMPLETED' : 'UNLOCKED',
        completedPrograms,
        allPrograms
      });
    }
  };

  // Toggle expansion des niveaux
  const toggleLevelExpansion = (levelId) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  // Toggle expansion des exercices
  const toggleExerciseExpansion = (exerciseKey) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseKey)) {
      newExpanded.delete(exerciseKey);
    } else {
      newExpanded.add(exerciseKey);
    }
    setExpandedExercises(newExpanded);
  };

  const getEstimatedLevelDuration = (level) => {
    const exerciseCount = level.exercises?.length || 0;
    return exerciseCount * 5; // 5 minutes par exercice (simplifié)
  };

  const getRPEColor = (rpe) => {
    if (rpe <= 6) return colors.success;
    if (rpe <= 8) return colors.warning;
    return colors.error;
  };

  const findProgramById = (programId) => {
    // Chercher dans toutes les catégories (si elles existent) ou dans programs
    if (programsData.categories) {
      for (const cat of programsData.categories) {
        const found = cat.programs.find(p => p.id === programId);
        if (found) return found;
      }
    } else if (programsData.programs) {
      return programsData.programs.find(p => p.id === programId);
    }
    return null;
  };

  const isPrerequisiteCompleted = (prerequisiteId) => {
    // Vérifier si un prérequis est complété (placeholder logic)
    return userProgress?.completedPrograms?.includes(prerequisiteId) || false;
  };

  const handlePrerequisiteClick = (prerequisite) => {
    if (!isPrerequisiteCompleted(prerequisite.id)) {
      Alert.alert(
        'Programme requis',
        `Vous devez d'abord compléter "${prerequisite.name}" pour accéder à ce programme.`,
        [{ text: 'OK' }]
      );
    }
  };

  const startWorkout = (level) => {
    navigation.navigate('Workout', { program, level });
  };

  const getTotalExercises = (level) => {
    return level.exercises?.length || 0;
  };

  const prerequisites = getPrerequisites();

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      contentContainerStyle={styles.content}
    >
      {/* Banner rouge si programme verrouillé */}
      {isProgramLocked && (
        <Surface style={styles.lockedBanner}>
          <Text style={styles.lockedBannerTitle}>🔒 Programme verrouillé</Text>
          <Text style={styles.lockedBannerText}>
            Complète les prérequis pour débloquer ce challenge
          </Text>
          
          {/* Liste des prérequis */}
          {prerequisites.length > 0 && (
            <View style={styles.prerequisitesList}>
              {prerequisites.map((prereq, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.prerequisiteItem}
                  onPress={() => navigateToPrerequisite(prereq.program)}
                >
                  <Text style={styles.prerequisiteIcon}>
                    {prereq.completed ? '✅' : '❌'}
                  </Text>
                  <Text style={[
                    styles.prerequisiteName,
                    { color: prereq.completed ? colors.success : colors.error }
                  ]}>
                    {prereq.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Retour à l'arbre
          </Button>
        </Surface>
      )}

      {/* Header du programme */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Text style={styles.programIcon}>{program.icon}</Text>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.programDescription}>
            {program.description}
          </Text>
          
          {/* Stats du programme */}
          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{program.levels.length}</Text>
              <Text style={styles.statLabel}>Niveaux</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProgress?.currentLevel || 1}
              </Text>
              <Text style={styles.statLabel}>Niveau actuel</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProgress?.totalSessions || 0}
              </Text>
              <Text style={styles.statLabel}>Séances</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Informations du programme */}
      <Card style={[styles.card, styles.infoCard]}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Catégorie:</Text>
            <Text style={styles.infoValue}>{category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Difficulté:</Text>
            <Text style={styles.infoValue}>{program.difficulty || 'Intermédiaire'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Durée estimée:</Text>
            <Text style={styles.infoValue}>
              {getEstimatedLevelDuration(program.levels[0])} min par séance
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fréquence:</Text>
            <Text style={styles.infoValue}>2-3 séances par semaine</Text>
          </View>
        </Card.Content>
      </Card>

      <View>
        {program.levels.map((level, index) => {
          const levelStatus = getLevelStatus(level);
          const isLevelExpanded = expandedLevels.has(level.id);

          return (
            <Card 
              key={level.id} 
              style={[
                styles.levelCard,
                { 
                  backgroundColor: levelStatus.backgroundColor,
                  opacity: levelStatus.opacity || 1 
                }
              ]}
            >
              {/* Header cliquable du niveau */}
              <TouchableOpacity
                onPress={() => toggleLevelExpansion(level.id)}
                style={styles.levelHeaderContainer}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleContainer}>
                    <Text style={[styles.levelTitle, { color: levelStatus.color }]}>
                      Niveau {level.id} - {level.name}
                    </Text>
                    <Text style={styles.levelSubtitle}>
                      {level.subtitle}
                    </Text>
                  </View>
                  
                  <View style={styles.levelBadges}>
                    <Badge 
                      style={[styles.statusBadge, { backgroundColor: levelStatus.color }]}
                    >
                      {levelStatus.text}
                    </Badge>
                    <Badge style={styles.xpBadge}>
                      {level.xpReward || 100} XP
                    </Badge>
                    <Text style={styles.expandIcon}>
                      {isLevelExpanded ? '▼' : '▶'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Contenu expandable du niveau */}
              {isLevelExpanded && (
                <Card.Content>
                  {/* Info rapide du niveau */}
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelInfoText}>
                      {level.exercises?.length || 0} exercices • ~{getEstimatedLevelDuration(level)} min
                    </Text>
                  </View>

                  {/* Message pour les niveaux verrouillés */}
                  {levelStatus.message && (
                    <View style={styles.statusMessageContainer}>
                      <Text style={styles.statusMessage}>
                        {levelStatus.message}
                      </Text>
                    </View>
                  )}

                  {/* Bouton d'action selon le statut */}
                  {levelStatus.canPlay && (
                    <Button
                      mode={levelStatus.buttonMode}
                      onPress={() => navigation.navigate('Workout', { program, level })}
                      style={[
                        styles.levelButton,
                        levelStatus.status === 'current' && styles.currentLevelButton
                      ]}
                    >
                      {levelStatus.buttonText}
                    </Button>
                  )}

                  {/* Meilleur score pour les niveaux complétés */}
                  {levelStatus.status === 'completed' && userProgress?.bestScores?.[level.id] && (
                    <View style={styles.bestScoreContainer}>
                      <Text style={styles.bestScoreText}>
                        🏆 Meilleur score: {userProgress.bestScores[level.id]}%
                      </Text>
                    </View>
                  )}
                </Card.Content>
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: colors.surface,
    marginBottom: 24,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    padding: 24,
  },
  programIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  programName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  programDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  levelsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  levelCard: {
    elevation: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  levelContent: {
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  levelWeek: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  xpValue: {
    color: colors.warning,
  },
  bestScoreContainer: {
    backgroundColor: colors.success + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  bestScoreText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  lockMessageContainer: {
    backgroundColor: colors.textSecondary + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  lockMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButton: {
    borderRadius: 10,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    elevation: 2,
  },
  primaryButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  // Styles pour les informations de prérequis
  infoCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  prerequisiteCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: 16,
  },
  prerequisiteItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prerequisiteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prerequisiteName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  prerequisiteStatus: {
    alignItems: 'flex-end',
  },
  completedStatus: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  incompleteStatus: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  unlocksCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    marginBottom: 16,
  },
  unlockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unlockName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  unlockIcon: {
    fontSize: 18,
  },
  // Nouveaux styles pour la refactorisation
  lockedBanner: {
    backgroundColor: colors.error + '20',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  lockedBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  lockedBannerText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  prerequisitesList: {
    marginBottom: 16,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  prerequisiteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  prerequisiteName: {
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    borderColor: colors.error,
  },
  levelsContainer: {
    marginTop: 16,
  },
  levelCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  levelHeaderContainer: {
    padding: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    color: 'white',
  },
  xpBadge: {
    backgroundColor: colors.warning,
    color: 'white',
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  levelInfo: {
    marginBottom: 12,
  },
  levelInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusMessageContainer: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  levelButton: {
    marginVertical: 12,
  },
  currentLevelButton: {
    backgroundColor: colors.primary,
  },
  bestScoreContainer: {
    backgroundColor: colors.success + '20',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  bestScoreText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    marginVertical: 4,
    borderRadius: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  exerciseExpandIcon: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exerciseDetails: {
    paddingTop: 0,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  exerciseSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exerciseSpec: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rpeBadge: {
    color: 'white',
  },
  tipsContainer: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default ProgramDetailScreen;
