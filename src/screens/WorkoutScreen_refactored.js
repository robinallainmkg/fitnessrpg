import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  ScrollView,
  Modal,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkout } from '../contexts/WorkoutContext';
import Timer from '../components/Timer';

const { width: screenWidth } = Dimensions.get('window');

const WorkoutScreen = ({ route, navigation }) => {
  const { program, level } = route.params;
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  
  const {
    workoutData,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    startWorkout,
    recordSet,
    skipRest,
    resetWorkout,
    getCurrentExercise,
    getCurrentSetNumber,
    getProgressPercentage
  } = useWorkout();

  const [reps, setReps] = useState(0);

  // Fonctions pour le compteur
  const increment = () => setReps(prev => prev + 1);
  const decrement = () => setReps(prev => Math.max(0, prev - 1));

  useEffect(() => {
    startWorkout(program, level);

    let backHandler;
    if (Platform.OS === 'android') {
      backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );
    }

    return () => {
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, []);

  const handleBackPress = () => {
    showAbandonAlert();
    return true;
  };

  const handleValidateSet = () => {
    if (reps === 0) {
      Alert.alert('Attention', 'Veuillez entrer une valeur supérieure à 0');
      return;
    }

    recordSet(reps);
    setReps(0);
  };

  const handleSkipRest = () => {
    skipRest();
  };

  const handleTimerComplete = () => {
    // Le timer se charge automatiquement de passer à l'état suivant
  };

  const showAbandonAlert = () => {
    setShowAbandonDialog(true);
  };

  const confirmAbandon = () => {
    setShowAbandonDialog(false);
    resetWorkout();
    navigation.navigate('Home');
  };

  const cancelAbandon = () => {
    setShowAbandonDialog(false);
  };

  // Redirection vers le résumé quand la séance est terminée
  useEffect(() => {
    if (workoutData && currentExerciseIndex >= workoutData.exercises.length) {
      navigation.replace('WorkoutSummary', { 
        program, 
        level, 
        workoutData 
      });
    }
  }, [currentExerciseIndex, workoutData]);

  if (!workoutData) {
    return (
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Préparation de votre séance...</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentExercise = getCurrentExercise();
  const progress = getProgressPercentage();
  const totalExercises = workoutData.exercises.length;
  const sessionProgress = (currentExerciseIndex / totalExercises) * 100;

  if (!currentExercise) {
    return (
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Aucun exercice trouvé...</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ÉCRAN DE REPOS
  if (isResting) {
    return (
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={showAbandonAlert}>
            <Text style={styles.headerButton}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Temps de repos</Text>
          </View>
          
          <TouchableOpacity onPress={showAbandonAlert}>
            <Text style={styles.headerButton}>⋮</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.restContent}>
          <Text style={styles.restTitle}>⚡ Récupération active</Text>
          <Text style={styles.restSubtitle}>
            Repos : {Math.floor(getCurrentExercise()?.rest / 60)}:{(getCurrentExercise()?.rest % 60).toString().padStart(2, '0')}
          </Text>
          
          <Timer 
            duration={restTimeRemaining}
            onComplete={handleTimerComplete}
            onSkip={handleSkipRest}
          />

          <LinearGradient
            colors={['rgba(77, 158, 255, 0.15)', 'rgba(123, 97, 255, 0.15)']}
            style={styles.nextExerciseInfo}
          >
            <Text style={styles.nextExerciseLabel}>⏭️ Prochaine série</Text>
            <Text style={styles.nextExerciseName}>
              {currentExercise?.name}
            </Text>
            <Text style={styles.nextExerciseSubtitle}>
              Série {getCurrentSetNumber()} / {currentExercise?.sets}
            </Text>
            <View style={styles.nextExerciseTargetContainer}>
              <Text style={styles.nextExerciseTargetLabel}>🎯 Objectif</Text>
              <Text style={styles.nextExerciseTarget}>
                {currentExercise?.target} {currentExercise?.type === 'time' ? 'sec' : 'reps'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Modal Abandon */}
        <Modal
          visible={showAbandonDialog}
          transparent
          animationType="fade"
          onRequestClose={cancelAbandon}
        >
          <View style={styles.abandonModalOverlay}>
            <LinearGradient
              colors={['#1E293B', '#0F172A']}
              style={styles.abandonModalContent}
            >
              <Text style={styles.abandonModalTitle}>
                ⚠️ Abandonner la séance ?
              </Text>
              <Text style={styles.abandonModalText}>
                Tu vas perdre toute ta progression actuelle. Cette action est irréversible.
              </Text>
              <View style={styles.abandonModalActions}>
                <TouchableOpacity onPress={cancelAbandon} style={styles.abandonCancelButton}>
                  <Text style={styles.abandonCancelText}>Annuler</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#F44336', '#D32F2F']}
                  style={styles.abandonConfirmButton}
                >
                  <TouchableOpacity onPress={confirmAbandon} style={styles.abandonConfirmTouch}>
                    <Text style={styles.abandonConfirmText}>Oui, abandonner</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </LinearGradient>
    );
  }

  // ÉCRAN PRINCIPAL D'ENTRAÎNEMENT
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      {/* Header fixe */}
      <View style={styles.header}>
        <TouchableOpacity onPress={showAbandonAlert}>
          <Text style={styles.headerButton}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Entraînement</Text>
        </View>
        
        <TouchableOpacity onPress={showAbandonAlert}>
          <Text style={styles.headerButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Contexte */}
        <View style={styles.contextSection}>
          {/* Programme & Compétence */}
          <View style={styles.programBadge}>
            <Text style={styles.programIcon}>{program.icon || '🏋️'}</Text>
            <Text style={styles.programName}>{program.category || program.name}</Text>
          </View>
          
          <Text style={styles.skillName}>{program.name}</Text>
          
          {/* Progression globale */}
          <View style={styles.overallProgress}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#4D9EFF', '#7B61FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              Exercice {currentExerciseIndex + 1}/{totalExercises} • {Math.round(progress)}% complété
            </Text>
          </View>
        </View>

        {/* Section Séance actuelle */}
        <View style={styles.sessionCard}>
          <Text style={styles.sectionLabel}>📍 Séance actuelle</Text>
          
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>{level.name}</Text>
            <Text style={styles.sessionSubtitle}>{level.subtitle || 'Développe ta force'}</Text>
            
            {/* Mini barre de progression de la séance */}
            <View style={styles.sessionProgressBar}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.sessionProgressFill, { width: `${sessionProgress}%` }]}
              />
            </View>
            <Text style={styles.sessionProgressText}>{Math.round(sessionProgress)}% complété</Text>
          </View>
        </View>

        {/* Section Exercice actuel */}
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseCounter}>🔥 Exercice {currentExerciseIndex + 1}/{totalExercises}</Text>
          
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          
          {/* Tip en évidence */}
          {currentExercise.tips && (
            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>💡</Text>
              <Text style={styles.tipText}>{currentExercise.tips.replace('💡 ', '')}</Text>
            </View>
          )}
          
          {/* Description condensée */}
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {currentExercise.description}
          </Text>
          
          <TouchableOpacity onPress={() => setShowDescriptionModal(true)}>
            <Text style={styles.expandButton}>Voir description complète →</Text>
          </TouchableOpacity>
          
          {/* Info série */}
          <View style={styles.setInfo}>
            <Text style={styles.setLabel}>Série {getCurrentSetNumber()}/{currentExercise.sets}</Text>
            <View style={styles.setDetails}>
              <View style={styles.setDetailItem}>
                <Text style={styles.setDetailText}>🎯 {currentExercise.target} {currentExercise.type === 'time' ? 'sec' : 'reps'}</Text>
              </View>
              <View style={styles.setDetailItem}>
                <Text style={styles.setDetailText}>RPE {currentExercise.rpe || '7/10'}</Text>
              </View>
              <View style={styles.setDetailItem}>
                <Text style={styles.setDetailText}>⏱️ {Math.floor(currentExercise.rest / 60)}:{(currentExercise.rest % 60).toString().padStart(2, '0')}</Text>
              </View>
            </View>
          </View>
          
          {/* Instruction */}
          <LinearGradient
            colors={['rgba(77, 158, 255, 0.15)', 'rgba(123, 97, 255, 0.15)']}
            style={styles.instruction}
          >
            <Text style={styles.instructionText}>
              {currentExercise.type === 'time' 
                ? '⏱️ Maintiens la position le plus longtemps possible'
                : '💎 Effectue le maximum de répétitions possible'
              }
            </Text>
          </LinearGradient>
        </View>

        {/* Section Input utilisateur */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            {currentExercise.type === 'time' 
              ? '⏱️ Combien de secondes as-tu tenu ?'
              : '💪 Combien de répétitions as-tu réalisées ?'
            }
          </Text>
          
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={decrement} style={styles.counterButton}>
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            
            <Text style={styles.counterValue}>{reps}</Text>
            
            <TouchableOpacity onPress={increment} style={styles.counterButton}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <LinearGradient
            colors={reps > 0 ? ['#4D9EFF', '#7B61FF'] : ['#334155', '#1E293B']}
            style={styles.validateButton}
          >
            <TouchableOpacity 
              onPress={handleValidateSet}
              disabled={reps === 0}
              style={styles.validateButtonTouch}
            >
              <Text style={[styles.validateText, { opacity: reps > 0 ? 1 : 0.5 }]}>✓ Valider la série</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Espacement bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de description */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>
              🔥 {currentExercise.name}
            </Text>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                {currentExercise.description}
              </Text>
              
              {currentExercise.tips && (
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.modalTipsContainer}
                >
                  <Text style={styles.modalTipsTitle}>💡 Conseils Pro</Text>
                  <Text style={styles.modalTips}>
                    {currentExercise.tips.replace('💡 ', '')}
                  </Text>
                </LinearGradient>
              )}
              
              <View style={styles.modalRpeContainer}>
                <Text style={styles.modalRpeTitle}>⚡ Intensité recommandée</Text>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.modalRpeChip}
                >
                  <Text style={styles.modalRpeText}>
                    {currentExercise.rpe || 'RPE 7/10'}
                  </Text>
                </LinearGradient>
              </View>
            </ScrollView>
            <LinearGradient
              colors={['#4D9EFF', '#7B61FF']}
              style={styles.modalCloseButtonGradient}
            >
              <TouchableOpacity 
                onPress={() => setShowDescriptionModal(false)}
                style={styles.modalCloseButtonTouch}
              >
                <Text style={styles.modalCloseButtonLabel}>Fermer</Text>
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Abandon */}
      <Modal
        visible={showAbandonDialog}
        transparent
        animationType="fade"
        onRequestClose={cancelAbandon}
      >
        <View style={styles.abandonModalOverlay}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.abandonModalContent}
          >
            <Text style={styles.abandonModalTitle}>
              ⚠️ Abandonner la séance ?
            </Text>
            <Text style={styles.abandonModalText}>
              Tu vas perdre toute ta progression actuelle. Cette action est irréversible.
            </Text>
            <View style={styles.abandonModalActions}>
              <TouchableOpacity onPress={cancelAbandon} style={styles.abandonCancelButton}>
                <Text style={styles.abandonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#F44336', '#D32F2F']}
                style={styles.abandonConfirmButton}
              >
                <TouchableOpacity onPress={confirmAbandon} style={styles.abandonConfirmTouch}>
                  <Text style={styles.abandonConfirmText}>Oui, abandonner</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4D9EFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerButton: {
    fontSize: 24,
    color: '#FFFFFF',
    width: 40,
    textAlign: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Contexte Section
  contextSection: {
    padding: 20,
    backgroundColor: '#0F172A',
  },
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  programIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  programName: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  skillName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  
  // Progression
  overallProgress: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  
  // Session Card
  sessionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  sessionHeader: {
    gap: 8,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  sessionProgressBar: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  sessionProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sessionProgressText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  
  // Exercise Card
  exerciseCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.2)',
  },
  exerciseCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 28,
  },
  
  // Tip Box
  tipBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    gap: 8,
  },
  tipLabel: {
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '500',
    lineHeight: 20,
  },
  
  exerciseDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 8,
  },
  expandButton: {
    fontSize: 14,
    color: '#4D9EFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  
  // Set Info
  setInfo: {
    marginBottom: 16,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  setDetails: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  setDetailItem: {
    backgroundColor: 'rgba(77, 158, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
  },
  setDetailText: {
    fontSize: 13,
    color: '#4D9EFF',
    fontWeight: '500',
  },
  
  // Instruction
  instruction: {
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4D9EFF',
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  
  // Input Card
  inputCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
  },
  inputLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  
  // Counter
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  counterButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(77, 158, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4D9EFF',
  },
  counterButtonText: {
    fontSize: 32,
    color: '#4D9EFF',
    fontWeight: '600',
  },
  counterValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 120,
    textAlign: 'center',
  },
  
  // Validate Button
  validateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  validateButtonTouch: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  validateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Rest Content
  restContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  restSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  nextExerciseInfo: {
    marginTop: 40,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },
  nextExerciseLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '600',
  },
  nextExerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  nextExerciseSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  nextExerciseTargetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextExerciseTargetLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  nextExerciseTarget: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContent: {
    maxHeight: 400,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 24,
  },
  modalTipsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalTips: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalRpeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  modalRpeTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalRpeChip: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalRpeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalCloseButtonGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalCloseButtonTouch: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseButtonLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Abandon Modal
  abandonModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  abandonModalContent: {
    borderRadius: 20,
    padding: 28,
    minWidth: 320,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  abandonModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  abandonModalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  abandonModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  abandonCancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#4D9EFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  abandonCancelText: {
    color: '#4D9EFF',
    fontWeight: '600',
    fontSize: 16,
  },
  abandonConfirmButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  abandonConfirmTouch: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  abandonConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WorkoutScreen;
