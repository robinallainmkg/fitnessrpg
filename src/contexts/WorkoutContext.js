import React, { createContext, useContext, useState } from 'react';

import firestore from '@react-native-firebase/firestore';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from '@react-native-firebase/firestore';

import { useAuth } from './AuthContext';
import { calculateWorkoutScore, calculateXPBonus } from '../utils/scoring';
// Note: Programme unlocking nécessite d'être adapté à la nouvelle architecture

const WorkoutContext = createContext({});

export const WorkoutProvider = ({ children }) => {
  // États de la séance
  const [workoutData, setWorkoutData] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setsData, setSetsData] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [restTimer, setRestTimer] = useState(null);

  const { user, isGuest } = useAuth();

  /**
   * Démarre une nouvelle séance d'entraînement
   */
  const startWorkout = (program, level) => {
    const workout = {
      program,
      level,
      exercises: level.exercises
    };

    // Initialiser les données des séries
    const initialSetsData = level.exercises.map(exercise => 
      Array(exercise.sets).fill(0)
    );

    setWorkoutData(workout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setSetsData(initialSetsData);
    setIsResting(false);
    setRestTimeRemaining(0);
    setWorkoutStartTime(new Date());
    
    // Clear any existing timer
    if (restTimer) {
      clearInterval(restTimer);
      setRestTimer(null);
    }
  };

  /**
   * Enregistre la valeur d'une série et passe à la suivante
   */
  const recordSet = (value) => {
    if (!workoutData) return;

    // Enregistrer la valeur
    const newSetsData = [...setsData];
    newSetsData[currentExerciseIndex][currentSetIndex] = parseInt(value) || 0;
    setSetsData(newSetsData);

    // Vérifier si c'est la dernière série de l'exercice
    const currentExercise = workoutData.exercises[currentExerciseIndex];
    const isLastSet = currentSetIndex === currentExercise.sets - 1;
    const isLastExercise = currentExerciseIndex === workoutData.exercises.length - 1;

    if (isLastSet && isLastExercise) {
      // Séance terminée - passer à un index supérieur pour déclencher la navigation
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      completeWorkout(newSetsData);
    } else if (isLastSet) {
      // Passer à l'exercice suivant
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    } else {
      // Passer à la série suivante et commencer le repos
      setCurrentSetIndex(currentSetIndex + 1);
      startRest(currentExercise.rest);
    }
  };

  /**
   * Démarre le timer de repos
   */
  const startRest = (duration) => {
    setIsResting(true);
    setRestTimeRemaining(duration);

    const timer = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResting(false);
          setRestTimer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setRestTimer(timer);
  };

  /**
   * Skip le repos
   */
  const skipRest = () => {
    if (restTimer) {
      clearInterval(restTimer);
      setRestTimer(null);
    }
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  /**
   * Termine la séance et sauvegarde les données
   */
  const completeWorkout = async (finalSetsData = setsData) => {
    if (!workoutData) return;

    if (!user?.uid) {
      console.log('⏭️ No user - skip completeWorkout');
      return;
    }

    console.log('💾 Début finalisation workout for user:', user.uid, isGuest ? '(guest)' : '(authenticated)');

    try {
      console.log('💾 Début finalisation workout...');
      console.log('📊 WorkoutData:', workoutData);
      console.log('👤 User:', user);
      console.log('⏱️ WorkoutStartTime:', workoutStartTime);

      // Calculer le score
      const exercisesCompleted = workoutData.exercises.map((exercise, index) => {
        const setsResults = finalSetsData[index] || [];
        const totalActual = setsResults.reduce((sum, val) => sum + val, 0);
        const totalTarget = exercise.sets * exercise.target;

        return {
          exerciseId: exercise.id || `exercise-${index}`, // ✅ Génère un ID si absent
          exerciseName: exercise.name || 'Unknown Exercise',
          type: exercise.type || 'reps',
          target: totalTarget,
          actual: totalActual,
          sets: setsResults
        };
      });

      const { score, percentage } = calculateWorkoutScore(exercisesCompleted);
      const xpReward = workoutData.level?.xpReward || 100; // ✅ Protection contre undefined
      const xpEarned = calculateXPBonus(score, xpReward);

      console.log('📈 Score calculé:', score, 'Percentage:', percentage, 'XP:', xpEarned);

      // Créer la session de workout
      const now = new Date();
      const workoutSession = {
        userId: user.uid,
        programId: workoutData.program?.id || 'unknown', // ✅ Protection
        levelId: workoutData.level?.id || 1, // ✅ Protection
        exercises: exercisesCompleted,
        score,
        percentage,
        xpEarned,
        startTime: Timestamp.fromDate(workoutStartTime || now), // ✅ Conversion en Timestamp Firestore
        endTime: Timestamp.fromDate(now), // ✅ Conversion en Timestamp Firestore
        createdAt: serverTimestamp()
      };

      console.log('💾 WorkoutSession à sauvegarder:', JSON.stringify(workoutSession, null, 2));

      // Sauvegarder la session
      const fs = firestore();
      const sessionsRef = fs.collection('workoutSessions');
      const newSessionRef = sessionsRef.doc();
      await newSessionRef.set(workoutSession);

      console.log('✅ Session workout sauvegardée:', newSessionRef.id);

      let levelCompleted = false;
      let programCompleted = false;
      let unlockedPrograms = [];

      // Vérifier si le niveau est validé
      if (score >= 800) {
        levelCompleted = true;
        console.log('✅ Niveau validé ! Score:', score);
        
        // Vérifier si c'est le dernier niveau du programme 
        if (workoutData.level.id === workoutData.program.levels?.length) {
          programCompleted = true;
          console.log('✅ Programme complété !', workoutData.program.name);
          
          // TODO: Adapter la logique de déblocage pour la nouvelle architecture
          // Actuellement désactivé car programsMeta n'est plus disponible
          /* 
          if (workoutData.program.unlocks && workoutData.program.unlocks.length > 0) {
            unlockedPrograms = workoutData.program.unlocks.map(programId => {
              const program = programsMeta.categories[0]?.programs?.find(p => p.id === programId);
              return program ? { id: programId, name: program.name } : null;
            }).filter(Boolean);
            console.log('🔓 Programmes débloqués:', unlockedPrograms);
          }
          */
        }
      }

      console.log('✅ Finalisation réussie !');

      return {
        sessionId: newSessionRef.id,
        score,
        percentage,
        levelCompleted,
        programCompleted,
        unlockedPrograms,
        exercises: exercisesCompleted,
        xpEarned,
        startTime: workoutStartTime || new Date(), // Date JS pour UI
        endTime: new Date(), // Date JS pour UI
        userProgress: {
          currentLevel: levelCompleted ? workoutData.level.id + 1 : workoutData.level.id,
          unlockedLevels: levelCompleted ? [1, 2, 3, workoutData.level.id + 1].slice(0, workoutData.level.id + 1) : [1, 2, 3].slice(0, workoutData.level.id)
        }
      };

    } catch (error) {
      console.error('❌ Erreur sauvegarde séance:', error);
      throw error;
    }
  };

  /**
   * Met à jour la progression utilisateur
   */
  const updateUserProgress = async (programId, completedLevelId) => {
    if (!user?.uid) {
      console.log('⏭️ No user - skip updateUserProgress');
      return;
    }
    
    console.log('📈 Updating progress for user:', user.uid, isGuest ? '(guest)' : '(authenticated)');

    try {
      const fs = firestore();
      const progressRef = fs.collection('userProgress').doc(`${user.uid}_${programId}`);
      
      // Charger la progression actuelle
      const progressDoc = await progressRef.get();
      const currentProgress = progressDoc.data();
      
      const newCompletedLevels = [...(currentProgress?.completedLevels || [])];
      if (!newCompletedLevels.includes(completedLevelId)) {
        newCompletedLevels.push(completedLevelId);
      }

      const newUnlockedLevels = [...(currentProgress?.unlockedLevels || [])];
      const nextLevel = completedLevelId + 1;
      if (nextLevel <= 6 && !newUnlockedLevels.includes(nextLevel)) {
        newUnlockedLevels.push(nextLevel);
      }

      const newCurrentLevel = Math.max(
        currentProgress?.currentLevel || 1,
        nextLevel <= 6 ? nextLevel : completedLevelId
      );

      await updateDoc(progressRef, {
        currentLevel: newCurrentLevel,
        unlockedLevels: newUnlockedLevels,
        completedLevels: newCompletedLevels,
        totalSessions: (currentProgress?.totalSessions || 0) + 1,
        lastSessionAt: serverTimestamp()
      });

    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
    }
  };

  /**
   * Met à jour les XP de l'utilisateur
   */
  const updateUserXP = async (xpToAdd) => {
    if (!user?.uid) {
      console.log('⏭️ No user - skip updateUserXP');
      return;
    }
    
    console.log('⭐ Adding XP for user:', user.uid, isGuest ? '(guest)' : '(authenticated)', `+${xpToAdd}XP`);

    try {
      const fs = firestore();
      const userRef = fs.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      const currentXP = userDoc.data()?.totalXP || 0;

      await userRef.update({
        totalXP: currentXP + xpToAdd,
        lastXPUpdate: firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour XP:', error);
    }
  };

  /**
   * Réinitialise la séance
   */
  const resetWorkout = () => {
    if (restTimer) {
      clearInterval(restTimer);
      setRestTimer(null);
    }
    
    setWorkoutData(null);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setSetsData([]);
    setIsResting(false);
    setRestTimeRemaining(0);
    setWorkoutStartTime(null);
  };

  /**
   * Obtient l'exercice actuel
   */
  const getCurrentExercise = () => {
    if (!workoutData || currentExerciseIndex >= workoutData.exercises.length) {
      return null;
    }
    return workoutData.exercises[currentExerciseIndex];
  };

  /**
   * Obtient le numéro de la série actuelle (1-indexed)
   */
  const getCurrentSetNumber = () => {
    return currentSetIndex + 1;
  };

  /**
   * Obtient le total des séries dans la séance
   */
  const getTotalSets = () => {
    if (!workoutData) return 0;
    return workoutData.exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  /**
   * Obtient le nombre de séries complétées
   */
  const getCompletedSets = () => {
    if (!workoutData) return 0;
    
    let completed = 0;
    for (let i = 0; i < currentExerciseIndex; i++) {
      completed += workoutData.exercises[i].sets;
    }
    completed += currentSetIndex;
    
    return completed;
  };

  /**
   * Calcule le pourcentage de progression
   */
  const getProgressPercentage = () => {
    const total = getTotalSets();
    const completed = getCompletedSets();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const value = {
    // États
    workoutData,
    currentExerciseIndex,
    currentSetIndex,
    setsData,
    isResting,
    restTimeRemaining,
    workoutStartTime,

    // Fonctions
    startWorkout,
    recordSet,
    startRest,
    skipRest,
    completeWorkout,
    resetWorkout,

    // Helpers
    getCurrentExercise,
    getCurrentSetNumber,
    getTotalSets,
    getCompletedSets,
    getProgressPercentage
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte de workout
 */
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};