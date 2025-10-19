// ✅ ANCIENNE API FIREBASE (cohérente avec firebase.js)
import firestore from '@react-native-firebase/firestore';
import { getWithRetry } from '../utils/firestoreRetry';
import { getCategoryWithDetails } from '../utils/programLoader';

/**
 * Service de gestion de la queue de séances
 * Structure : Programme → Compétence → Niveau → Séance
 */

/**
 * Génère la queue initiale pour un programme (première compétence, niveau 1)
 * @param {string} programId - ID du programme (ex: 'street', 'calisthenics')
 * @returns {Promise<Array>} Liste des séances de départ
 */
export const generateInitialQueue = async (programId) => {
  // Charger la catégorie avec ses détails complets
  const category = await getCategoryWithDetails(programId);
  
  if (!category || !category.programs || category.programs.length === 0) {
    console.warn(`Programme ${programId} non trouvé ou vide`);
    return [];
  }

  const sessions = [];
  
  // Prendre la première compétence (skill) du programme
  const firstSkill = category.programs[0];
  
  if (!firstSkill || !firstSkill.levels || firstSkill.levels.length === 0) {
    console.warn(`Première compétence sans niveaux pour ${programId}`);
    return [];
  }

  // Prendre le premier niveau de cette compétence
  const firstLevel = firstSkill.levels[0];
  
  // Créer une séance pour ce niveau
  sessions.push({
    id: `${programId}-${firstSkill.id}-${firstLevel.id}`,
    programId,
    programName: category.name || programId,
    programIcon: category.icon || '🎯',
    programColor: category.color || '#4D9EFF',
    skillId: firstSkill.id,
    skillName: firstSkill.name,
    levelId: firstLevel.id,
    levelNumber: 1,
    name: firstLevel.name || `${firstSkill.name} - Niveau 1`,
    subtitle: firstLevel.subtitle || '',
    type: firstSkill.category || 'Force',
    status: 'available',
    exercises: firstLevel.exercises || [],
    xpReward: firstLevel.xpReward || 100,
    statsReward: firstSkill.statBonuses || {},
    dependencies: firstLevel.dependencies || [],
  });

  return sessions;
};

/**
 * Génère les séances disponibles pour un programme basé sur la progression
 * Logique : 
 * - Affiche seulement le prochain niveau non complété de chaque compétence active
 * - Une compétence est active si : elle n'a pas de prérequis OU tous ses prérequis sont complétés (100% des niveaux)
 * 
 * @param {string} programId - ID du programme
 * @param {Object} userProgress - Progression de l'utilisateur pour ce programme
 * @param {number} maxSessions - Nombre max de séances à retourner (défaut: 4)
 * @returns {Promise<Array>} Liste des séances débloquées et non complétées
 */
export const generateAvailableSessions = async (programId, userProgress = {}, maxSessions = 4) => {
  try {
    const category = await getCategoryWithDetails(programId);
    
    if (!category || !category.programs) {
      console.log(`❌ Programme ${programId} non trouvé`);
      return [];
    }

    const completedSkills = userProgress.completedSkills || []; // Liste des IDs de compétences 100% complétées
    const skillProgress = userProgress.skillProgress || {}; // { skillId: { completedLevels: [1, 2, 3], currentLevel: 4 } }
    const sessions = [];

    console.log(`🔍 Génération séances pour ${programId}:`, { completedSkills, skillProgress });

    // Parcourir toutes les compétences (skills) du programme
    for (const skill of category.programs) {
      if (!skill.levels || skill.levels.length === 0) continue;

      const skillId = skill.id;
      const skillData = skillProgress[skillId] || { completedLevels: [], currentLevel: 1 };
      
      // Vérifier si cette compétence est déjà 100% complétée
      if (completedSkills.includes(skillId)) {
        console.log(`✅ ${skillId} déjà complétée, skip`);
        continue;
      }

      // Vérifier si les prérequis (prerequisites) sont remplis
      const prerequisites = skill.prerequisites || [];
      const prerequisitesMet = prerequisites.every(prereqId => 
        completedSkills.includes(prereqId)
      );

      // Si les prérequis ne sont pas remplis, skip cette compétence
      if (prerequisites.length > 0 && !prerequisitesMet) {
        console.log(`🔒 ${skillId} verrouillée, prérequis manquants:`, prerequisites);
        continue;
      }

      // Cette compétence est accessible ! Trouver le prochain niveau non complété
      const completedLevels = skillData.completedLevels || [];
      
      // Chercher le premier niveau non complété (séquentiel)
      let nextLevelIndex = -1;
      for (let i = 0; i < skill.levels.length; i++) {
        const levelNumber = i + 1;
        if (!completedLevels.includes(levelNumber)) {
          nextLevelIndex = i;
          break;
        }
      }

      // Si tous les niveaux sont complétés mais pas marqué comme completedSkills, c'est une incohérence
      if (nextLevelIndex === -1) {
        console.log(`⚠️ ${skillId} tous niveaux complétés mais pas dans completedSkills`);
        continue;
      }

      const level = skill.levels[nextLevelIndex];
      const levelNumber = nextLevelIndex + 1;
      const sessionId = `${programId}-${skillId}-${levelNumber}`;

      console.log(`🎯 Séance disponible: ${skillId} niveau ${levelNumber}`);

      sessions.push({
        id: sessionId,
        programId,
        programName: category.name || programId,
        programIcon: category.icon || '🎯',
        programColor: category.color || '#4D9EFF',
        skillId: skill.id,
        skillName: skill.name,
        levelId: level.id,
        levelNumber: levelNumber,
        totalLevels: skill.levels.length,
        name: level.name || `${skill.name} - Niveau ${levelNumber}`,
        subtitle: level.subtitle || '',
        type: skill.category || 'Force',
        status: 'available',
        exercises: level.exercises || [],
        xpReward: level.xpReward || 100,
        statsReward: skill.statBonuses || {},
        prerequisites,
      });

      // Limiter le nombre de séances retournées
      if (sessions.length >= maxSessions) {
        return sessions;
      }
    }

    console.log(`📋 ${sessions.length} séances disponibles pour ${programId}`);
    return sessions;
  } catch (error) {
    console.error(`❌ Erreur génération séances pour ${programId}:`, error.message);
    return [];
  }
};

/**
 * Récupère la queue de séances pour un utilisateur (toutes les séances disponibles de tous ses programmes actifs)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Queue de séances recommandées
 */
export const getUserSessionQueue = async (userId) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.warn('Utilisateur non trouvé');
      return [];
    }

    const userData = userDoc.data();
    const activePrograms = userData.activePrograms || [];
    
    if (activePrograms.length === 0) {
      console.log('Aucun programme actif');
      return [];
    }

    console.log('🔍 Active programs:', activePrograms);

    let allSessions = [];

    // Générer les séances pour chaque programme actif
    for (const activeProgramId of activePrograms) {
      try {
        // Récupérer la progression du programme
        const programProgress = userData.programs?.[activeProgramId] || {
          completedSkills: [], // Liste des compétences 100% complétées
          skillProgress: {}, // { skillId: { completedLevels: [1,2,3], currentLevel: 4 } }
          xp: 0,
          level: 1
        };

        console.log(`📊 Progression pour ${activeProgramId}:`, programProgress);

        // Générer les séances disponibles (max 3-4 par programme)
        const programSessions = await generateAvailableSessions(activeProgramId, programProgress, 3);
        allSessions = [...allSessions, ...programSessions];
      } catch (programError) {
        // Si le chargement d'un programme échoue, on continue avec les autres
        console.warn(`⚠️ Impossible de charger les séances pour ${activeProgramId}:`, programError.message);
        continue;
      }
    }

    console.log(`📋 Total: ${allSessions.length} séances disponibles`);


    // Limiter à 4 séances au total pour l'affichage
    return allSessions.slice(0, 4);
    
  } catch (error) {
    console.error('Erreur récupération queue séances:', error);
    return [];
  }
};

/**
 * Récupère les dernières séances complétées
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre de séances à récupérer (défaut: 3)
 * @returns {Promise<Array>} Liste des dernières séances complétées
 */
export const getCompletedSessions = async (userId, limit = 3) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data();
    const sessionHistory = userData.sessionHistory || [];
    
    // Trier par date (plus récent d'abord) et limiter
    return sessionHistory
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit);
    
  } catch (error) {
    console.error('Erreur récupération séances complétées:', error);
    return [];
  }
};

/**
 * Active un programme pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} programId - ID du programme à activer
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const activateProgram = async (userId, programId) => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }

    const userData = userDoc.data();
    const activePrograms = userData.activePrograms || [];
    
    // Vérifier la limite de 2 programmes actifs
    if (activePrograms.length >= 2 && !activePrograms.includes(programId)) {
      throw new Error('Limite de 2 programmes actifs atteinte. Désactive un programme d\'abord.');
    }

    // Vérifier si déjà actif
    if (activePrograms.includes(programId)) {
      console.log('Programme déjà actif');
      return true;
    }

    // Ajouter le programme aux programmes actifs - ANCIENNE API
    await userRef.update({
      activePrograms: firestore.FieldValue.arrayUnion(programId),
      // Initialiser la progression si elle n'existe pas
      [`programs.${programId}`]: userData.programs?.[programId] || {
        xp: 0,
        level: 1,
        completedSkills: 0,
        currentSkill: null
      }
    });

    console.log(`✅ Programme ${programId} activé`);
    return true;

  } catch (error) {
    console.error('Erreur lors de l\'activation du programme:', error);
    throw error;
  }
};

/**
 * Désactive un programme pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} programId - ID du programme à désactiver
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const deactivateProgram = async (userId, programId) => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }

    const userData = userDoc.data();
    const activePrograms = userData.activePrograms || [];
    
    // Retirer le programme des programmes actifs
    const updatedActivePrograms = activePrograms.filter(id => id !== programId);
    
    await userRef.update({
      activePrograms: updatedActivePrograms
    });

    console.log(`✅ Programme ${programId} désactivé`);
    return true;

  } catch (error) {
    console.error('Erreur lors de la désactivation du programme:', error);
    throw error;
  }
};

/**
 * Marque une séance comme complétée et met à jour la progression
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} session - Objet séance complet avec programId, skillId, levelNumber, etc.
 * @param {Object} sessionData - Données de la séance (score, XP, exercises, etc.)
 * @returns {Promise<boolean>} Succès de l'opération
 */
export const completeSession = async (userId, session, sessionData) => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }

    const { programId, skillId, levelNumber, totalLevels, xpReward } = session;
    const userData = userDoc.data();
    const programData = userData.programs?.[programId] || {
      xp: 0,
      level: 1,
      completedSkills: [],
      skillProgress: {}
    };

    // Récupérer la progression de cette compétence
    const skillData = programData.skillProgress[skillId] || {
      completedLevels: [],
      currentLevel: 1
    };

    // Ajouter le niveau complété (si pas déjà présent)
    if (!skillData.completedLevels.includes(levelNumber)) {
      skillData.completedLevels.push(levelNumber);
      skillData.completedLevels.sort((a, b) => a - b); // Trier par ordre croissant
    }

    // Mettre à jour le niveau actuel (prochain non complété)
    const nextLevel = levelNumber + 1;
    if (nextLevel <= totalLevels) {
      skillData.currentLevel = nextLevel;
    }

    // Vérifier si la compétence est 100% complétée
    const isSkillComplete = skillData.completedLevels.length === totalLevels;
    
    if (isSkillComplete && !programData.completedSkills.includes(skillId)) {
      programData.completedSkills.push(skillId);
      console.log(`🎉 Compétence ${skillId} complétée à 100% !`);
    }

    // Mettre à jour la progression du skill
    programData.skillProgress[skillId] = skillData;

    // Ajouter l'XP
    programData.xp = (programData.xp || 0) + (xpReward || 0);
    programData.level = Math.floor(Math.sqrt(programData.xp / 100)) + 1;
    programData.lastSession = new Date().toISOString();

    // Sauvegarder dans Firestore - ANCIENNE API
    await userRef.update({
      [`programs.${programId}`]: programData,
      lastSessionDate: new Date(),
      lastActivity: new Date(),
      globalXP: (userData.globalXP || 0) + (xpReward || 0)
    });

    console.log(`✅ Séance complétée: ${skillId} niveau ${levelNumber}`);
    console.log(`📊 Progression: ${skillData.completedLevels.length}/${totalLevels} niveaux`);
    
    return true;

  } catch (error) {
    console.error('Erreur lors de la complétion de la séance:', error);
    throw error;
  }
};


