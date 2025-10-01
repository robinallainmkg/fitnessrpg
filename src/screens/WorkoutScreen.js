import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  ScrollView,
  Modal,
  Platform
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  ProgressBar,
  Text,
  Chip,
  IconButton
} from 'react-native-paper';
import { useWorkout } from '../contexts/WorkoutContext';
import Timer from '../components/Timer';
import { colors } from '../theme/colors';

const WorkoutScreen = ({ route, navigation }) => {
  const { program, level } = route.params;
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  
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

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Démarrer la séance
    startWorkout(program, level);

    // Gérer le bouton retour (seulement sur Android)
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
    Alert.alert(
      'Quitter la séance ?',
      'Votre progression sera perdue si vous quittez maintenant.',
      [
        { text: 'Continuer', style: 'cancel' },
        { 
          text: 'Quitter', 
          style: 'destructive',
          onPress: () => {
            resetWorkout();
            navigation.goBack();
          }
        }
      ]
    );
    return true;
  };

  const handleValidateSet = () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value < 0) {
      Alert.alert('Erreur', 'Veuillez entrer une valeur valide');
      return;
    }

    recordSet(value);
    setInputValue('');
  };

  const handleSkipRest = () => {
    skipRest();
  };

  const handleTimerComplete = () => {
    // Le timer se charge automatiquement de passer à l'état suivant
  };

  // État pour la modal d'abandon
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);

  // Fonction pour afficher l'alerte d'abandon
  const showAbandonAlert = () => {
    console.log('🚨 showAbandonAlert appelé');
    setShowAbandonDialog(true);
  };

  // Fonction pour confirmer l'abandon
  const confirmAbandon = () => {
    console.log('✅ Abandon confirmé');
    setShowAbandonDialog(false);
    handleAbandon();
  };

  // Fonction pour annuler l'abandon
  const cancelAbandon = () => {
    console.log('❌ Abandon annulé');
    setShowAbandonDialog(false);
  };

  // Fonction pour gérer l'abandon de la séance
  const handleAbandon = () => {
    console.log('🔥 handleAbandon appelé - Début de l\'abandon');
    
    // Reset du contexte workout
    console.log('🔄 Appel de resetWorkout()');
    resetWorkout();
    
    // Navigation vers l'écran d'accueil
    console.log('🏠 Navigation vers Home');
    navigation.navigate('Home');
    
    console.log('✅ handleAbandon terminé');
    
    // TODO: Optionnel - sauvegarder une "incomplete session" dans Firestore
    // avec flag abandoned: true pour les statistiques futures
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

  // Configuration du bouton "Abandonner" dans le header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="close-circle-outline"
          iconColor="#F44336"
          size={24}
          style={{ opacity: 0.7 }}
          onPress={showAbandonAlert}
        />
      ),
    });
  }, [navigation]);

  if (!workoutData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Préparation de votre séance...</Text>
      </View>
    );
  }

  const currentExercise = getCurrentExercise();
  const progress = getProgressPercentage();

  // Vérification de sécurité : si pas d'exercice actuel, retourner à l'écran précédent
  if (!currentExercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Aucun exercice trouvé...</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          Retour
        </Button>
      </View>
    );
  }

  if (isResting) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Temps de repos</Text>
          <ProgressBar 
            progress={progress / 100}
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {Math.round(progress)}% complété
          </Text>
        </View>

        <View style={styles.restContent}>
          <Text style={styles.restTitle}>💤 Récupération</Text>
          <Text style={styles.restSubtitle}>
            Repos : {Math.floor(getCurrentExercise()?.rest / 60)}:{(getCurrentExercise()?.rest % 60).toString().padStart(2, '0')}
          </Text>
          
          <Timer 
            duration={restTimeRemaining}
            onComplete={handleTimerComplete}
            onSkip={handleSkipRest}
          />

          <View style={styles.nextExerciseInfo}>
            <Text style={styles.nextExerciseLabel}>Prochaine série :</Text>
            <Text style={styles.nextExerciseName}>
              {currentExercise?.name} - Série {getCurrentSetNumber()}
            </Text>
            <Text style={styles.nextExerciseTarget}>
              Objectif : {currentExercise?.target} {currentExercise?.type === 'time' ? 'secondes' : 'répétitions'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec progression */}
      <View style={styles.header}>
        <Text style={styles.title}>{level.name}</Text>
        <ProgressBar 
          progress={progress / 100}
          color={colors.primary}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {Math.round(progress)}% complété
        </Text>
      </View>

      {/* Exercice actuel */}
      <Card style={styles.exerciseCard}>
        <Card.Content style={styles.exerciseContent}>
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseTitleContainer}>
              <Text style={styles.exerciseName}>
                {currentExercise?.name}
              </Text>
              <Text style={styles.exerciseDescription}>
                {currentExercise?.description}
              </Text>
            </View>
            <Chip 
              mode="flat"
              style={styles.rpeChip}
              textStyle={styles.rpeChipText}
            >
              RPE {currentExercise?.rpe || '7/10'}
            </Chip>
          </View>

          {/* Tips */}
          {currentExercise?.tips && (
            <Card style={styles.tipsCard}>
              <Card.Content style={styles.tipsContent}>
                <Text style={styles.tipsText}>
                  {currentExercise.tips}
                </Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.seriesInfo}>
            <Text style={styles.seriesLabel}>
              Série {getCurrentSetNumber()}/{currentExercise?.sets}
            </Text>
            <Text style={styles.targetValue}>
              Objectif : {currentExercise?.target} {currentExercise?.type === 'time' ? 'sec' : 'reps'}
            </Text>
          </View>

          {/* Bouton voir description */}
          <Button
            mode="outlined"
            onPress={() => setShowDescriptionModal(true)}
            style={styles.descriptionButton}
            contentStyle={styles.descriptionButtonContent}
          >
            Voir la description complète
          </Button>

          {/* Instructions spécifiques selon le type */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {currentExercise?.type === 'time' 
                ? '⏱️ Maintenez la position pendant le temps indiqué'
                : '🔥 Effectuez le maximum de répétitions possible'
              }
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Saisie */}
      <Card style={styles.inputCard}>
        <Card.Content style={styles.inputContent}>
          <Text style={styles.inputLabel}>
            {currentExercise?.type === 'time' 
              ? 'Combien de secondes avez-vous tenu ?'
              : 'Combien de répétitions avez-vous réalisées ?'
            }
          </Text>
          
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            mode="outlined"
            keyboardType="numeric"
            placeholder="0"
            style={styles.input}
            contentStyle={styles.inputText}
            theme={{
              colors: {
                primary: colors.primary,
                outline: colors.border,
                background: colors.surface
              }
            }}
          />

          <Button
            mode="contained"
            onPress={handleValidateSet}
            disabled={!inputValue}
            style={[
              styles.validateButton,
              { backgroundColor: inputValue ? colors.primary : colors.textSecondary }
            ]}
            contentStyle={styles.validateButtonContent}
          >
            Valider la série
          </Button>
        </Card.Content>
      </Card>

      {/* Info exercices restants */}
      <View style={styles.remainingInfo}>
        <Text style={styles.remainingText}>
          Exercice {currentExerciseIndex + 1}/{workoutData.exercises.length}
        </Text>
      </View>

      {/* Modal de description */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {currentExercise && (
              <>
                <Text style={styles.modalTitle}>
                  {currentExercise.name}
                </Text>
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.modalDescription}>
                    {currentExercise.description}
                  </Text>
                  
                  {currentExercise.tips && (
                    <View style={styles.modalTipsContainer}>
                      <Text style={styles.modalTipsTitle}>💡 Conseils</Text>
                      <Text style={styles.modalTips}>
                        {currentExercise.tips.replace('💡 ', '')}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.modalRpeContainer}>
                    <Text style={styles.modalRpeTitle}>Intensité recommandée</Text>
                    <Chip 
                      mode="flat"
                      style={styles.modalRpeChip}
                      textStyle={styles.modalRpeText}
                    >
                      {currentExercise.rpe || 'RPE 7/10'}
                    </Chip>
                  </View>
                </ScrollView>
                <Button 
                  mode="contained"
                  onPress={() => setShowDescriptionModal(false)}
                  style={styles.modalCloseButton}
                >
                  Fermer
                </Button>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bouton abandonner en bas (alternative au header) */}
      <View style={styles.abandonButtonContainer}>
        <Button
          mode="text"
          textColor="#F44336"
          onPress={showAbandonAlert}
          style={styles.abandonButton}
        >
          Abandonner la séance
        </Button>
      </View>

      {/* Modal d'abandon (compatible web) */}
      <Modal
        visible={showAbandonDialog}
        transparent
        animationType="fade"
        onRequestClose={cancelAbandon}
      >
        <View style={styles.abandonModalOverlay}>
          <View style={styles.abandonModalContent}>
            <Text style={styles.abandonModalTitle}>
              ⚠️ Abandonner la séance ?
            </Text>
            <Text style={styles.abandonModalText}>
              Tu vas perdre toute ta progression actuelle. Cette action est irréversible.
            </Text>
            <View style={styles.abandonModalActions}>
              <Button 
                mode="outlined" 
                onPress={cancelAbandon}
                style={styles.abandonModalButton}
              >
                Annuler
              </Button>
              <Button 
                mode="contained"
                onPress={confirmAbandon}
                buttonColor="#F44336"
                style={styles.abandonModalButton}
              >
                Oui, abandonner
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    marginBottom: 20,
    elevation: 4,
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  setChip: {
    backgroundColor: colors.primary + '20',
  },
  setChipText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  exerciseDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  targetLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  targetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.warning,
  },
  instructionContainer: {
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  inputCard: {
    backgroundColor: colors.surface,
    marginBottom: 20,
    elevation: 4,
  },
  inputContent: {
    padding: 20,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  input: {
    width: 150,
    marginBottom: 20,
    backgroundColor: colors.surface,
  },
  inputText: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  validateButton: {
    minWidth: 200,
    borderRadius: 8,
  },
  validateButtonContent: {
    paddingVertical: 12,
  },
  remainingInfo: {
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  restContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  restSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  nextExerciseInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 250,
  },
  nextExerciseLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  nextExerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  nextExerciseTarget: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
  },
  // Nouveaux styles
  exerciseTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  rpeChip: {
    backgroundColor: colors.primary,
  },
  rpeChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: colors.warning,
    marginVertical: 12,
  },
  tipsContent: {
    padding: 12,
  },
  tipsText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '500',
  },
  seriesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  seriesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionButton: {
    marginVertical: 8,
    borderColor: colors.primary,
  },
  descriptionButtonContent: {
    height: 40,
  },
  // Styles du modal
  descriptionModal: {
    backgroundColor: colors.surface,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 24,
  },
  modalTipsContainer: {
    backgroundColor: colors.warning,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 8,
  },
  modalTips: {
    fontSize: 14,
    color: colors.background,
    lineHeight: 20,
  },
  modalRpeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  modalRpeTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalRpeChip: {
    backgroundColor: colors.primary,
  },
  modalRpeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
  },
  modalCloseButton: {
    marginTop: 16,
  },
  // Styles pour le bouton "Abandonner"
  abandonButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  abandonButton: {
    opacity: 0.7,
  },
  // Styles pour la modal d'abandon
  abandonModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  abandonModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    maxWidth: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  abandonModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  abandonModalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  abandonModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  abandonModalButton: {
    flex: 1,
  },
});

export default WorkoutScreen;
