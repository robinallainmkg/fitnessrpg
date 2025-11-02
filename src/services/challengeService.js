import { getFirestore } from '../config/firebase.simple';
import { loadProgramsMeta, loadProgramDetails } from '../data/programsLoader';

const firestore = getFirestore();

/**
 * Récupère tous les challenges disponibles pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des challenges avec leur statut
 */
export const getAvailableChallenges = async (userId) => {
  try {
    // Charger les métadonnées de tous les programmes
    const meta = await loadProgramsMeta();
    const allChallenges = [];

    // Charger le profil utilisateur pour voir les programmes débloqués
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userProgress = userData?.progress?.programs || {};

    // Parcourir toutes les catégories
    for (const category of meta.categories) {
      const programDetails = await loadProgramDetails(category.id);
      
      if (!programDetails || !programDetails.programs) continue;

      // Parcourir tous les programmes de la catégorie
      for (const program of programDetails.programs) {
        if (!program.levels) continue;

        // Parcourir tous les niveaux
        for (const level of program.levels) {
          // Si le niveau a un challenge
          if (level.challenge) {
            const programProgress = userProgress[program.id] || {};
            const levelProgress = programProgress.levels?.[level.id] || {};

            // Vérifier si le challenge est déjà complété
            const isCompleted = levelProgress.challengeCompleted === true;
            const isSkipped = levelProgress.status === 'skipped';

            // Récupérer les tentatives du jour depuis Firestore
            const challengeId = `${userId}_${program.id}_${level.id}`;
            const today = new Date().toISOString().split('T')[0];
            
            let attemptsToday = 0;
            let challengeStatus = 'available';
            let adminFeedback = null;

            try {
              const challengeDoc = await firestore
                .collection('skillChallenges')
                .doc(challengeId)
                .get();

              if (challengeDoc.exists) {
                const challengeData = challengeDoc.data();
                challengeStatus = challengeData.status || 'available';
                adminFeedback = challengeData.adminFeedback;

                // Compter les tentatives du jour
                if (challengeData.attempts && Array.isArray(challengeData.attempts)) {
                  attemptsToday = challengeData.attempts.filter(attempt => {
                    const attemptDate = attempt.date?.toDate?.() || new Date(attempt.date);
                    return attemptDate.toISOString().split('T')[0] === today;
                  }).length;
                }
              }
            } catch (error) {
              console.error('Erreur lors de la récupération du challenge:', error);
            }

            // Déterminer le statut final
            let finalStatus = 'available';
            if (isCompleted && challengeStatus === 'approved') {
              finalStatus = 'approved';
            } else if (isSkipped) {
              finalStatus = 'skipped';
            } else if (challengeStatus === 'pending') {
              finalStatus = 'pending';
            } else if (challengeStatus === 'rejected') {
              finalStatus = 'rejected';
            } else if (attemptsToday >= (level.challenge.maxAttemptsPerDay || 3)) {
              finalStatus = 'exhausted';
            }

            // Ajouter le challenge à la liste
            allChallenges.push({
              programId: program.id,
              programName: program.name,
              programIcon: program.icon,
              programColor: program.color,
              categoryId: category.id,
              levelId: level.id,
              levelName: level.name,
              title: level.challenge.title,
              description: level.challenge.description,
              requirements: level.challenge.requirements,
              xpReward: level.xpReward,
              maxAttempts: level.challenge.maxAttemptsPerDay || 3,
              attemptsTaken: attemptsToday,
              status: finalStatus,
              adminFeedback,
              videoMinDuration: level.challenge.videoMinDuration,
              videoMaxDuration: level.challenge.videoMaxDuration,
            });
          }
        }
      }
    }

    return allChallenges;
  } catch (error) {
    console.error('Erreur getAvailableChallenges:', error);
    return [];
  }
};

/**
 * Recommande un challenge pour "Challenge du Jour"
 * @param {Array} challenges - Liste de tous les challenges
 * @param {Object} userStats - Statistiques de l'utilisateur
 * @returns {Object|null} - Challenge recommandé
 */
export const recommendTodayChallenge = (challenges, userStats) => {
  if (!challenges || challenges.length === 0) return null;

  // Filtrer les challenges disponibles uniquement
  const available = challenges.filter(c => 
    c.status === 'available' && 
    c.attemptsTaken < c.maxAttempts
  );

  if (available.length === 0) return null;

  // Priorité 1: Challenges rejetés (pour retry)
  const rejected = available.filter(c => c.status === 'rejected');
  if (rejected.length > 0) {
    return rejected[0];
  }

  // Priorité 2: Challenge basé sur la date (seed déterministe)
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const index = seed % available.length;
  
  return available[index];
};
