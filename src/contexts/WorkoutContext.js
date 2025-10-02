import React, { createContext, useContext, useState } from 'react';
import { doc, addDoc, collection, updateDoc, getDoc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { calculateWorkoutScore, calculateXPBonus } from '../utils/scoring';
import programsData from '../data/programs.json';

const WorkoutContext = createContext({});

export const WorkoutProvider = ({ children }) => {
  // États de la séance
  const [workoutData, setWorkoutData] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setsData, setSetsData] = useState([]); // Stocke les valeurs saisies
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [restTimer, setRestTimer] = useState(null);

  const { user } = useAuth();

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
      // Pas de repos entre les exercices, on passe directement
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
    if (!workoutData || !user?.uid) return;

    try {
      console.log('📱 MOCK: Début finalisation workout...');

      // Calculer le score
      const exercisesCompleted = workoutData.exercises.map((exercise, index) => {
        const setsResults = finalSetsData[index] || [];
        const totalActual = setsResults.reduce((sum, val) => sum + val, 0);
        const totalTarget = exercise.sets * exercise.target;

        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: exercise.type,
          target: totalTarget,
          actual: totalActual,
          sets: setsResults
        };
      });

      const { score, percentage } = calculateWorkoutScore(exercisesCompleted);
      const xpEarned = calculateXPBonus(score, workoutData.level.xpReward);

      // Créer la session de workout
      const workoutSession = {
        userId: user.uid,
        programId: workoutData.program.id,
        levelId: workoutData.level.id,
        exercises: exercisesCompleted,
        score,
        percentage,
        xpEarned,
        startTime: workoutStartTime,
        endTime: new Date(),
        createdAt: new Date() // Mock timestamp
      };

      // MOCK: Simuler la sauvegarde en Firestore
      console.log('📱 MOCK: Sauvegarde session workout...', workoutSession);
      const sessionRef = { id: `session_${Date.now()}` };

      let levelCompleted = false;
      let programCompleted = false;
      let unlockedPrograms = [];

      // MOCK: Simuler la mise à jour de la progression
      if (score >= 800) {
        levelCompleted = true;
        console.log('📱 MOCK: Niveau validé ! Score:', score);
        
        // Vérifier si c'est le dernier niveau du programme 
        if (workoutData.level.id === workoutData.program.levels?.length) {
          programCompleted = true;
          console.log('📱 MOCK: Programme complété !', workoutData.program.name);
          
          // Simuler le déblocage des programmes suivants
          if (workoutData.program.unlocks && workoutData.program.unlocks.length > 0) {
            unlockedPrograms = workoutData.program.unlocks.map(programId => {
              const program = programsData.categories[0]?.programs?.find(p => p.id === programId);
              return program ? { id: programId, name: program.name } : null;
            }).filter(Boolean);
            console.log('📱 MOCK: Programmes débloqués:', unlockedPrograms);
          }
        }
      }

      console.log('📱 MOCK: Finalisation réussie !');

      return {
        sessionId: sessionRef.id,
        score,
        percentage,
        levelCompleted,
        programCompleted,
        unlockedPrograms,
        exercises: exercisesCompleted,
        xpEarned,
        startTime: workoutStartTime,
        endTime: new Date(),
        userProgress: {
          currentLevel: levelCompleted ? workoutData.level.id + 1 : workoutData.level.id,
          unlockedLevels: levelCompleted ? [1, 2, 3, workoutData.level.id + 1].slice(0, workoutData.level.id + 1) : [1, 2, 3].slice(0, workoutData.level.id)
        }
      };

    } catch (error) {
      console.error('Erreur sauvegarde séance:', error);
      throw error;
    }
  };

  /**
   * Met à jour la progression utilisateur
   */
  const updateUserProgress = async (programId, completedLevelId) => {
    try {
      const progressRef = doc(db, 'userProgress', `${user.uid}_${programId}`);
      
      // Charger la progression actuelle
      const progressDoc = await getDoc(progressRef);
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
      console.error('Erreur mise à jour progression:', error);
    }
  };

  /**
   * Met à jour les XP de l'utilisateur
   */
  const updateUserXP = async (xpToAdd) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentXP = userDoc.data()?.totalXP || 0;

      await updateDoc(userRef, {
        totalXP: currentXP + xpToAdd,
        lastXPUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour XP:', error);
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
