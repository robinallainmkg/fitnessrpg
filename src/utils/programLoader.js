/**
 * Utilitaires pour charger les programmes avec optimisation
 * Permet de charger les métadonnées (léger) ou les détails complets selon le besoin
 */

import { loadProgramsMeta, loadCategoryDetails, loadFullProgram } from '../data/programsLoader';
import streetworkoutTree from '../data/programDetails/streetworkout-tree.json';
import run10kTree from '../data/programDetails/run10k-tree.json';

// Mapping statique des trees (Metro ne supporte pas les imports dynamiques)
const PROGRAM_TREES = {
  'street': streetworkoutTree,
  'running': run10kTree
};

// Cache en mémoire pour les détails fusionnés
const programCache = {};

/**
 * Charge uniquement la structure de l'arbre (léger)
 * Utilisé par SkillTreeScreen pour afficher l'arbre sans charger tous les exercices
 * 
 * @param {string} categoryId - ID de la catégorie (ex: 'street', 'running')
 * @returns {Promise<Object|null>} Structure de l'arbre ou null
 */
export const loadProgramTree = async (categoryId) => {
  const cacheKey = `tree/${categoryId}`;
  
  console.log(`🌳 [loadProgramTree] Chargement arbre pour ${categoryId}`);
  
  if (programCache[cacheKey]) {
    console.log(`💾 [loadProgramTree] ${categoryId} trouvé en cache`);
    return programCache[cacheKey];
  }
  
  try {
    // Récupérer depuis le mapping statique
    const treeData = PROGRAM_TREES[categoryId];
    
    if (!treeData) {
      console.error(`❌ [loadProgramTree] Arbre ${categoryId} non trouvé dans le mapping`);
      return null;
    }
    
    console.log(`✅ [loadProgramTree] Arbre ${categoryId} chargé (${treeData.tree.length} programmes)`);
    
    programCache[cacheKey] = treeData;
    return treeData;
  } catch (error) {
    console.error(`❌ [loadProgramTree] Erreur chargement arbre ${categoryId}:`, error);
    return null;
  }
};

/**
 * Obtient un programme avec ses détails complets (fusionnés)
 * Utilise le cache pour éviter les rechargements
 * 
 * @param {string} categoryId - ID de la catégorie (ex: 'street', 'run')
 * @param {string} programId - ID du programme
 * @returns {Promise<Object|null>} Programme complet ou null
 */
export const getProgramWithDetails = async (categoryId, programId) => {
  const cacheKey = `${categoryId}/${programId}`;
  
  if (programCache[cacheKey]) {
    return programCache[cacheKey];
  }
  
  const program = await loadFullProgram(categoryId, programId);
  if (program) {
    programCache[cacheKey] = program;
  }
  
  return program;
};

/**
 * Obtient une catégorie complète avec tous les détails de ses programmes
 * 
 * @param {string} categoryId - ID de la catégorie
 * @returns {Promise<Object|null>} Catégorie avec programmes complets
 */
export const getCategoryWithDetails = async (categoryId) => {
  const cacheKey = `category/${categoryId}`;
  
  console.log(`📦 [getCategoryWithDetails] Demande pour ${categoryId}`);
  
  if (programCache[cacheKey]) {
    console.log(`💾 [getCategoryWithDetails] ${categoryId} trouvé en cache`);
    return programCache[cacheKey];
  }
  
  try {
    console.log(`🔍 [getCategoryWithDetails] Chargement métadonnées pour ${categoryId}...`);
    
    // Charger les métadonnées de la catégorie
    const metadata = await loadProgramsMeta();
    const categoryMeta = metadata.categories.find(cat => cat.id === categoryId);
    
    if (!categoryMeta) {
      console.warn(`⚠️ [getCategoryWithDetails] Catégorie ${categoryId} non trouvée`);
      return null;
    }
    
    console.log(`✅ [getCategoryWithDetails] Métadonnées ${categoryId} chargées`);
    console.log(`📥 [getCategoryWithDetails] Chargement tree et détails pour ${categoryId}...`);
    
    // Charger l'arbre (structure légère)
    const treeData = await loadProgramTree(categoryId);
    if (!treeData || !treeData.tree) {
      console.error(`❌ [getCategoryWithDetails] Arbre ${categoryId} non trouvé`);
      return null;
    }
    
    // Charger tous les détails de cette catégorie
    const details = await loadCategoryDetails(categoryId);
    
    console.log(`✅ [getCategoryWithDetails] Détails ${categoryId} chargés`);
    console.log(`📊 [getCategoryWithDetails] Détails contient ${Object.keys(details).length} programmes`);
    console.log(`🔧 [getCategoryWithDetails] Fusion tree + details...`);
    
    // Fusionner tree + details pour tous les programmes
    const programsWithDetails = treeData.tree.map(programMeta => {
      const programDetails = details[programMeta.id];
      return {
        ...programMeta,
        ...programDetails
      };
    });
    
    console.log(`✅ [getCategoryWithDetails] ${programsWithDetails.length} programmes fusionnés`);
    
    const fullCategory = {
      ...categoryMeta,
      programs: programsWithDetails
    };
    
    programCache[cacheKey] = fullCategory;
    console.log(`✅ [getCategoryWithDetails] ${categoryId} mis en cache et retourné`);
    return fullCategory;
  } catch (error) {
    console.error(`❌ [getCategoryWithDetails] Erreur pour ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Précharge les détails d'une catégorie en arrière-plan
 * Utile après le chargement initial pour préparer les données
 * 
 * @param {string} categoryId - ID de la catégorie à précharger
 */
export const preloadCategoryDetails = async (categoryId) => {
  try {
    await getCategoryWithDetails(categoryId);
    console.log(`✅ Détails préchargés pour ${categoryId}`);
  } catch (error) {
    console.warn(`⚠️ Échec préchargement ${categoryId}:`, error);
  }
};

/**
 * Vide le cache (utile pour les tests ou le rechargement forcé)
 */
export const clearProgramCache = () => {
  Object.keys(programCache).forEach(key => delete programCache[key]);
  console.log('🗑️ Cache programmes vidé');
};

export default {
  loadProgramTree,
  getProgramWithDetails,
  getCategoryWithDetails,
  preloadCategoryDetails,
  clearProgramCache
};
