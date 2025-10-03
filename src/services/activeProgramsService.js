import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Service de gestion des programmes actifs
 * Gère l'activation/désactivation avec limite de 2 programmes max
 */

const MAX_ACTIVE_PROGRAMS = 2;

/**
 * Récupère les programmes actifs d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des IDs de programmes actifs
 */
export const getActivePrograms = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    return userDoc.data().activePrograms || [];
  } catch (error) {
    console.error('Erreur récupération programmes actifs:', error);
    return [];
  }
};

/**
 * Active un programme pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} programId - ID du programme à activer
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const activateProgram = async (userId, programId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { 
        success: false, 
        error: 'Utilisateur non trouvé' 
      };
    }
    
    const activePrograms = userDoc.data().activePrograms || [];
    
    // Vérifier si déjà actif
    if (activePrograms.includes(programId)) {
      return { 
        success: false, 
        error: 'Programme déjà actif' 
      };
    }
    
    // Vérifier la limite
    if (activePrograms.length >= MAX_ACTIVE_PROGRAMS) {
      return { 
        success: false, 
        error: `Maximum ${MAX_ACTIVE_PROGRAMS} programmes actifs`,
        needsDeactivation: true,
        currentActive: activePrograms
      };
    }
    
    // Activer le programme
    await updateDoc(userDocRef, {
      activePrograms: arrayUnion(programId)
    });
    
    console.log(`✅ Programme ${programId} activé pour ${userId}`);
    
    return { 
      success: true,
      programId,
      activePrograms: [...activePrograms, programId]
    };
    
  } catch (error) {
    console.error('Erreur activation programme:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Désactive un programme pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} programId - ID du programme à désactiver
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const deactivateProgram = async (userId, programId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { 
        success: false, 
        error: 'Utilisateur non trouvé' 
      };
    }
    
    const activePrograms = userDoc.data().activePrograms || [];
    
    // Vérifier si le programme est bien actif
    if (!activePrograms.includes(programId)) {
      return { 
        success: false, 
        error: 'Programme non actif' 
      };
    }
    
    // Désactiver le programme
    await updateDoc(userDocRef, {
      activePrograms: arrayRemove(programId)
    });
    
    console.log(`✅ Programme ${programId} désactivé pour ${userId}`);
    
    return { 
      success: true,
      programId,
      activePrograms: activePrograms.filter(id => id !== programId)
    };
    
  } catch (error) {
    console.error('Erreur désactivation programme:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Active un programme en remplaçant un autre (swap)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} programIdToActivate - ID du programme à activer
 * @param {string} programIdToDeactivate - ID du programme à désactiver
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const swapActiveProgram = async (userId, programIdToActivate, programIdToDeactivate) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { 
        success: false, 
        error: 'Utilisateur non trouvé' 
      };
    }
    
    const activePrograms = userDoc.data().activePrograms || [];
    
    // Vérifier que le programme à désactiver est bien actif
    if (!activePrograms.includes(programIdToDeactivate)) {
      return { 
        success: false, 
        error: 'Le programme à désactiver n\'est pas actif' 
      };
    }
    
    // Faire le swap atomiquement
    const newActivePrograms = activePrograms
      .filter(id => id !== programIdToDeactivate)
      .concat(programIdToActivate);
    
    await updateDoc(userDocRef, {
      activePrograms: newActivePrograms
    });
    
    console.log(`✅ Swap: ${programIdToDeactivate} → ${programIdToActivate}`);
    
    return { 
      success: true,
      activated: programIdToActivate,
      deactivated: programIdToDeactivate,
      activePrograms: newActivePrograms
    };
    
  } catch (error) {
    console.error('Erreur swap programmes:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Récupère tous les programmes disponibles (actifs + inactifs)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Programmes actifs et inactifs
 */
export const getAllUserPrograms = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { active: [], inactive: [] };
    }
    
    const userData = userDoc.data();
    const activePrograms = userData.activePrograms || [];
    const selectedPrograms = userData.selectedPrograms || [];
    
    // Les programmes inactifs sont ceux sélectionnés mais non actifs
    const inactivePrograms = selectedPrograms.filter(
      id => !activePrograms.includes(id)
    );
    
    return {
      active: activePrograms,
      inactive: inactivePrograms,
      maxReached: activePrograms.length >= MAX_ACTIVE_PROGRAMS
    };
    
  } catch (error) {
    console.error('Erreur récupération programmes utilisateur:', error);
    return { active: [], inactive: [] };
  }
};

export const MAX_PROGRAMS = MAX_ACTIVE_PROGRAMS;
