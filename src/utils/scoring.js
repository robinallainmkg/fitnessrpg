/**
 * Calcule le score d'une séance d'entraînement
 * @param {Array} exercisesCompleted - Array d'objets {target, actual, type}
 * @returns {Object} - {score: number, percentage: number}
 */
export const calculateWorkoutScore = (exercisesCompleted) => {
  if (!exercisesCompleted || exercisesCompleted.length === 0) {
    return { score: 0, percentage: 0 };
  }

  let totalTarget = 0;
  let totalActual = 0;

  exercisesCompleted.forEach(exercise => {
    if (exercise.type === 'reps') {
      totalTarget += exercise.target;
      totalActual += Math.min(exercise.actual, exercise.target); // Limite à l'objectif
    } else if (exercise.type === 'time') {
      // Pour le temps, on considère que atteindre l'objectif = 100%
      totalTarget += exercise.target;
      totalActual += Math.min(exercise.actual, exercise.target);
    }
  });

  const percentage = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
  const score = Math.round((percentage / 100) * 1000); // Score sur 1000

  return {
    score: Math.max(0, Math.min(1000, score)), // Entre 0 et 1000
    percentage: Math.round(percentage)
  };
};

/**
 * Détermine si un niveau est complété
 * @param {number} score - Score obtenu
 * @returns {boolean} - true si le niveau est validé
 */
export const isLevelCompleted = (score) => {
  return score >= 800;
};

/**
 * Calcule le bonus XP basé sur le score
 * @param {number} score - Score obtenu
 * @param {number} baseXP - XP de base du niveau
 * @returns {number} - XP total avec bonus
 */
export const calculateXPBonus = (score, baseXP) => {
  let bonus = 0;
  
  if (score >= 950) {
    bonus = 0.5; // 50% de bonus
  } else if (score >= 900) {
    bonus = 0.25; // 25% de bonus
  }
  
  return Math.round(baseXP * (1 + bonus));
};
