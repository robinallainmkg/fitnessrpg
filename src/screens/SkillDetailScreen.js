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

const SkillDetailScreen = ({ route, navigation }) => {
  const { 
    program: skill, // Aliaser program en skill pour la transition
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

  // État de la compétence - utilise maintenant isLocked directement
  const isSkillLocked = isLocked === true;
  const currentLevel = userProgress?.currentLevel || 1;

  // Initialisation des niveaux expandés : niveau actuel ouvert par défaut
  useEffect(() => {
    if (!isSkillLocked) {
      setExpandedLevels(new Set([currentLevel]));
      
      // Scroll vers le niveau actuel après un délai
      setTimeout(() => {
        scrollToCurrentLevel();
      }, 500);
    }
  }, [currentLevel, isSkillLocked]);

  const scrollToCurrentLevel = () => {
    if (scrollViewRef.current && !isSkillLocked) {
      // Estimation de la position du niveau actuel
      const estimatedPosition = (currentLevel - 1) * 300; // ~300px par niveau
      scrollViewRef.current.scrollTo({ 
        y: estimatedPosition, 
        animated: true 
      });
    }
  };

  const toggleLevel = (levelId) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  const toggleExercise = (exerciseKey) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseKey)) {
      newExpanded.delete(exerciseKey);
    } else {
      newExpanded.add(exerciseKey);
    }
    setExpandedExercises(newExpanded);
  };

  const navigateToWorkout = (level) => {
    if (isSkillLocked) {
      Alert.alert(
        'Compétence verrouillée',
        'Vous devez d\'abord compléter les prérequis pour débloquer cette compétence.'
      );
      return;
    }

    if (level.id > currentLevel) {
      Alert.alert(
        'Niveau verrouillé',
        `Vous devez d'abord valider le niveau ${currentLevel} pour débloquer ce niveau.`
      );
      return;
    }

    navigation.navigate('Workout', {
      program: skill,
      level: level,
      category: category
    });
  };

  const getStatusForLevel = (levelId) => {
    if (isSkillLocked) return 'locked';
    
    const completedLevels = userProgress?.completedLevels || [];
    const unlockedLevels = userProgress?.unlockedLevels || [1];
    
    if (completedLevels.includes(levelId)) return 'completed';
    if (unlockedLevels.includes(levelId) || levelId <= currentLevel) return 'available';
    return 'locked';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'available': return '🎯';
      case 'locked': return '🔒';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'available': return colors.primary;
      case 'locked': return colors.textSecondary;
      default: return colors.border;
    }
  };

  const getButtonText = (level, status) => {
    if (isSkillLocked || status === 'locked') return 'Verrouillé';
    if (status === 'completed') return 'Refaire le niveau';
    if (level.id === currentLevel) return 'Continuer le niveau';
    return 'Commencer le niveau';
  };

  const getButtonMode = (status) => {
    if (status === 'available') return 'contained';
    return 'outlined';
  };

  const renderExercise = (exercise, exerciseIndex, levelId) => {
    const exerciseKey = `${levelId}-${exerciseIndex}`;
    const isExpanded = expandedExercises.has(exerciseKey);

    return (
      <TouchableOpacity
        key={exerciseIndex}
        onPress={() => toggleExercise(exerciseKey)}
        style={styles.exerciseContainer}
      >
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>
              {exerciseIndex + 1}. {exercise.name}
            </Text>
            <Text style={styles.exerciseTargets}>
              {exercise.sets} × {exercise.target} {exercise.type === 'time' ? 's' : 'reps'}
            </Text>
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.exerciseDetails}>
            <Text style={styles.exerciseDescription}>
              {exercise.description}
            </Text>
            
            <View style={styles.exerciseSpecs}>
              <Badge style={[styles.specBadge, { backgroundColor: colors.info + '30' }]}>
                <Text style={styles.specText}>
                  {exercise.rest}s repos
                </Text>
              </Badge>
              <Badge style={[styles.specBadge, { backgroundColor: colors.warning + '30' }]}>
                <Text style={styles.specText}>
                  {exercise.rpe}
                </Text>
              </Badge>
            </View>

            {exercise.tips && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Conseil :</Text>
                <Text style={styles.tipsText}>{exercise.tips}</Text>
              </View>
            )}

            {exercise.safety && (
              <View style={styles.safetyContainer}>
                <Text style={styles.safetyTitle}>⚠️ Sécurité :</Text>
                <Text style={styles.safetyText}>{exercise.safety}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLevel = (level) => {
    const status = getStatusForLevel(level.id);
    const isExpanded = expandedLevels.has(level.id);
    const statusIcon = getStatusIcon(status);
    const statusColor = getStatusColor(status);
    const isCurrentLevel = level.id === currentLevel && !isSkillLocked;

    return (
      <Card 
        key={level.id} 
        style={[
          styles.levelCard,
          isCurrentLevel && styles.currentLevelCard
        ]}
      >
        <TouchableOpacity
          onPress={() => toggleLevel(level.id)}
          style={styles.levelHeader}
        >
          <View style={styles.levelTitleContainer}>
            <Text style={styles.levelStatus}>{statusIcon}</Text>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelTitle, { color: statusColor }]}>
                {level.name.replace(/^Semaine \d+-?\d* : /, '')}
              </Text>
              {level.subtitle && (
                <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
              )}
            </View>
            {isCurrentLevel && (
              <Chip 
                style={styles.currentChip}
                textStyle={styles.currentChipText}
              >
                Actuel
              </Chip>
            )}
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.levelContent}>
            <View style={styles.levelDetails}>
              <Text style={styles.levelDescription}>
                {level.exercises?.length || 0} exercices • {level.xpReward} XP
              </Text>
            </View>

            {level.exercises && level.exercises.map((exercise, index) => 
              renderExercise(exercise, index, level.id)
            )}

            <View style={styles.levelActions}>
              <Button
                mode={getButtonMode(status)}
                onPress={() => navigateToWorkout(level)}
                disabled={status === 'locked'}
                style={[
                  styles.levelButton,
                  status === 'available' && styles.availableButton
                ]}
                labelStyle={[
                  styles.levelButtonText,
                  status === 'available' && styles.availableButtonText
                ]}
              >
                {getButtonText(level, status)}
              </Button>
            </View>
          </View>
        )}
      </Card>
    );
  };

  if (!skill) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Compétence non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.headerSurface}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{skill.icon}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{skill.name}</Text>
            <Text style={styles.headerDescription}>{skill.description}</Text>
            <Text style={styles.headerDifficulty}>
              {skill.difficulty} • {skill.totalWeeks} semaines • {skill.xpReward} XP
            </Text>
          </View>
        </View>
      </Surface>

      {/* État verrouillé */}
      {isSkillLocked && (
        <Card style={styles.lockedCard}>
          <Card.Content style={styles.lockedContent}>
            <Text style={styles.lockedIcon}>🔒</Text>
            <Text style={styles.lockedTitle}>Compétence verrouillée</Text>
            <Text style={styles.lockedText}>
              Complétez les prérequis pour débloquer cette compétence
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Section des niveaux */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Niveaux de progression</Text>
        {!isSkillLocked && skill.levels && (
          <Text style={styles.sectionSubtitle}>
            Niveau actuel : {currentLevel}/{skill.levels.length}
          </Text>
        )}
      </View>

      {/* Liste des niveaux */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.levelsContainer}
        showsVerticalScrollIndicator={false}
      >
        {skill.levels && skill.levels.map(level => renderLevel(level))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  headerSurface: {
    elevation: 4,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerIcon: {
    fontSize: 64,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  headerDifficulty: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  lockedCard: {
    margin: 16,
    backgroundColor: colors.surface,
  },
  lockedContent: {
    alignItems: 'center',
    padding: 24,
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelsContainer: {
    flex: 1,
    padding: 16,
  },
  levelCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  currentLevelCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  levelTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelStatus: {
    fontSize: 24,
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentChip: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  currentChipText: {
    color: 'white',
    fontSize: 12,
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  levelContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  levelDetails: {
    marginBottom: 16,
  },
  levelDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  exerciseContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  exerciseTargets: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exerciseDetails: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseSpecs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  specBadge: {
    borderRadius: 12,
  },
  specText: {
    fontSize: 12,
    color: colors.text,
  },
  tipsContainer: {
    backgroundColor: colors.info + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  safetyContainer: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  levelActions: {
    marginTop: 16,
  },
  levelButton: {
    borderRadius: 8,
  },
  availableButton: {
    backgroundColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  availableButtonText: {
    color: 'white',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default SkillDetailScreen;
