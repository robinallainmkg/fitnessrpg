import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import {
  Text,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

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
              {exercise.sets} séries × {exercise.target} {exercise.type === 'time' ? 's' : 'reps'}
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
              <View style={styles.specBadge}>
                <Text style={styles.specText}>⏱ {exercise.rest}s repos</Text>
              </View>
              <View style={styles.specBadge}>
                <Text style={styles.specText}>💪 {exercise.rpe}</Text>
              </View>
            </View>

            {exercise.tips && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Conseil</Text>
                <Text style={styles.tipsText}>{exercise.tips}</Text>
              </View>
            )}

            {exercise.safety && (
              <View style={styles.safetyContainer}>
                <Text style={styles.safetyTitle}>⚠️ Sécurité</Text>
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
      <View 
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
              <View style={styles.currentChip}>
                <Text style={styles.currentChipText}>Actuel</Text>
              </View>
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

            <TouchableOpacity
              onPress={() => navigateToWorkout(level)}
              disabled={status === 'locked'}
              style={[
                styles.levelButton,
                status === 'available' && styles.availableButton,
                status === 'locked' && styles.lockedButton
              ]}
            >
              <Text style={[
                styles.levelButtonText,
                status === 'available' && styles.availableButtonText
              ]}>
                {getButtonText(level, status)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    <SafeAreaView style={styles.container}>
      {/* Bouton retour en position absolute */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Header avec gradient */}
      
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#0A0A0A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{skill.name}</Text>
            <Text style={styles.headerDescription}>{skill.description}</Text>
            
            {/* Badges */}
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, { backgroundColor: skill.color || '#4D9EFF' }]}>
                <Text style={styles.badgeText}>{skill.difficulty}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {skill.totalLevels || skill.levels?.length || 0} niveaux
                </Text>
              </View>
              {skill.xpReward && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>+{skill.xpReward} XP</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

      {/* Contenu scrollable */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* État verrouillé - Message d'info mais on affiche quand même les niveaux */}
        {isSkillLocked && (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedIcon}>🔒</Text>
            <Text style={styles.lockedTitle}>Compétence verrouillée</Text>
            <Text style={styles.lockedText}>
              Complétez les prérequis pour débloquer cette compétence.
            </Text>
          </View>
        )}

        {/* Progression */}
        {!isSkillLocked && skill.levels && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progression</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${(currentLevel / skill.levels.length) * 100}%`,
                      backgroundColor: skill.color || '#4D9EFF'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                Niveau {currentLevel}/{skill.levels.length}
              </Text>
            </View>
          </View>
        )}

        {/* Section titre niveaux */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Niveaux</Text>
        </View>

        {/* Liste des niveaux */}
        {skill.levels && skill.levels.length > 0 ? (
          skill.levels.map(level => renderLevel(level))
        ) : (
          <View style={styles.noLevelsCard}>
            <Text style={styles.noLevelsIcon}>📋</Text>
            <Text style={styles.noLevelsText}>
              Aucun niveau disponible pour cette compétence
            </Text>
            <Text style={styles.noLevelsSubtext}>
              Les détails seront bientôt ajoutés
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    paddingBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingRight: 24,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lockedCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'right',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  levelCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  currentLevelCard: {
    borderColor: '#4D9EFF',
    borderWidth: 2,
  },
  levelHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  levelStatus: {
    fontSize: 24,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  currentChip: {
    backgroundColor: '#4D9EFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expandIcon: {
    fontSize: 16,
    color: '#AAAAAA',
    marginLeft: 12,
  },
  levelContent: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  levelDetails: {
    marginBottom: 16,
  },
  levelDescription: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  exerciseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseTargets: {
    fontSize: 14,
    color: '#4D9EFF',
  },
  exerciseDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseSpecs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  specBadge: {
    backgroundColor: 'rgba(77, 158, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  specText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  tipsContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: '#AAAAAA',
    lineHeight: 18,
  },
  safetyContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 13,
    color: '#AAAAAA',
    lineHeight: 18,
  },
  levelButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  availableButton: {
    backgroundColor: '#4D9EFF',
  },
  lockedButton: {
    backgroundColor: '#222',
    opacity: 0.5,
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  availableButtonText: {
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  errorText: {
    fontSize: 18,
    color: '#AAAAAA',
  },
});

export default SkillDetailScreen;
