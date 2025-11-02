import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkout } from '../contexts/WorkoutContext';

/**
 * Écran de révision avant validation finale du workout
 * Permet de vérifier et modifier toutes les valeurs saisies
 */
const ReviewWorkoutScreen = ({ route, navigation }) => {
  const { program, level } = route.params;
  const { workoutData, setsData, completeWorkout, updateSetValue } = useWorkout();
  
  const [editingSet, setEditingSet] = useState(null); // { exerciseIndex, setIndex }
  const [editValue, setEditValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Ouvrir le modal d'édition
  const handleEditSet = (exerciseIndex, setIndex, currentValue) => {
    setEditingSet({ exerciseIndex, setIndex });
    setEditValue(currentValue.toString());
    setShowEditModal(true);
  };

  // Sauvegarder la modification
  const handleSaveEdit = () => {
    const newValue = parseInt(editValue);
    
    if (isNaN(newValue) || newValue <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une valeur valide supérieure à 0');
      return;
    }

    updateSetValue(editingSet.exerciseIndex, editingSet.setIndex, newValue);
    setShowEditModal(false);
    setEditingSet(null);
    setEditValue('');
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingSet(null);
    setEditValue('');
  };

  // Confirmer et terminer le workout
  const handleConfirmWorkout = async () => {
    try {
      console.log('🔍 Review: Calling completeWorkout with setsData:', setsData);
      const result = await completeWorkout(setsData);
      console.log('✅ Review: completeWorkout result:', result);
      
      // Navigation vers WorkoutSummary avec les résultats
      navigation.replace('WorkoutSummary', { 
        program, 
        level, 
        workoutData,
        sessionResult: result
      });
    } catch (error) {
      console.error('❌ Review: Error completing workout:', error);
      Alert.alert('Erreur', `Impossible de sauvegarder le workout: ${error.message}`);
    }
  };

  // Retour pour refaire le dernier exercice
  const handleGoBack = () => {
    Alert.alert(
      'Retour en arrière',
      'Voulez-vous vraiment retourner à l\'exercice précédent ? Les modifications non sauvegardées seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (!workoutData || !workoutData.exercises) {
    return (
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 Révision de la séance</Text>
          <Text style={styles.headerSubtitle}>
            Vérifiez vos performances avant validation
          </Text>
        </View>

        {/* Résumé du programme */}
        <View style={styles.programCard}>
          <Text style={styles.programIcon}>{program.icon || '🏋️'}</Text>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.levelName}>{level.name}</Text>
        </View>

        {/* Liste des exercices avec valeurs */}
        {workoutData.exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseMetaBadge}>
                <Text style={styles.exerciseMetaText}>
                  {exercise.type === 'time' ? '⏱️ Temps' : '💪 Reps'}
                </Text>
              </View>
            </View>

            {/* Sets */}
            <View style={styles.setsContainer}>
              {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                const value = setsData[exerciseIndex]?.[setIndex] || 0;
                const target = exercise.target;
                const percentage = Math.round((value / target) * 100);
                const isGood = percentage >= 80;
                const isExcellent = percentage >= 100;

                return (
                  <View key={setIndex} style={styles.setRow}>
                    <Text style={styles.setLabel}>Série {setIndex + 1}</Text>
                    
                    <View style={styles.setValueContainer}>
                      <View style={styles.setValueBox}>
                        <Text style={styles.setValue}>{value}</Text>
                        <Text style={styles.setUnit}>
                          {exercise.type === 'time' ? 'sec' : 'reps'}
                        </Text>
                      </View>

                      <View style={styles.setComparison}>
                        <Text style={styles.targetText}>
                          / {target} {exercise.type === 'time' ? 'sec' : 'reps'}
                        </Text>
                        <View style={[
                          styles.percentageBadge,
                          isExcellent && styles.percentageBadgeExcellent,
                          isGood && !isExcellent && styles.percentageBadgeGood,
                        ]}>
                          <Text style={[
                            styles.percentageText,
                            (isGood || isExcellent) && styles.percentageTextSuccess
                          ]}>
                            {percentage}%
                          </Text>
                        </View>
                      </View>

                      {/* Bouton Modifier */}
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditSet(exerciseIndex, setIndex, value)}
                      >
                        <Text style={styles.editIcon}>✏️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.confirmButton}
          >
            <TouchableOpacity 
              onPress={handleConfirmWorkout}
              style={styles.confirmButtonTouch}
            >
              <Text style={styles.confirmButtonText}>✓ Confirmer et terminer</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal d'édition */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>✏️ Modifier la valeur</Text>
            
            {editingSet && (
              <Text style={styles.modalSubtitle}>
                {workoutData.exercises[editingSet.exerciseIndex]?.name} - Série {editingSet.setIndex + 1}
              </Text>
            )}

            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="Entrez la nouvelle valeur"
              placeholderTextColor="#94A3B8"
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={['#7B61FF', '#7B61FF']}
                style={styles.modalSaveButton}
              >
                <TouchableOpacity 
                  onPress={handleSaveEdit}
                  style={styles.modalSaveButtonTouch}
                >
                  <Text style={styles.modalSaveText}>Sauvegarder</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Program Card
  programCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  programIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  programName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelName: {
    fontSize: 16,
    color: '#7B61FF',
    fontWeight: '600',
  },

  // Exercise Card
  exerciseCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.2)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseMetaBadge: {
    backgroundColor: 'rgba(123, 97, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exerciseMetaText: {
    fontSize: 12,
    color: '#7B61FF',
    fontWeight: '600',
  },

  // Sets
  setsContainer: {
    gap: 12,
  },
  setRow: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  setLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  setValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  setValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  setUnit: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  setComparison: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  percentageBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageBadgeGood: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  percentageBadgeExcellent: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  percentageTextSuccess: {
    color: '#10B981',
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(123, 97, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  editIcon: {
    fontSize: 18,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonTouch: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveButtonTouch: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ReviewWorkoutScreen;
