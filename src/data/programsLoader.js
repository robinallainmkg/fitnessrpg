/**
 * Programme Loader avec Cache Intelligent
 * 
 * Stratégie d'optimisation:
 * 1. Charge UNIQUEMENT les métadonnées au démarrage (~21KB au lieu de ~190KB)
 * 2. Charge les détails complets à la demande (lazy loading)
 * 3. Met tout en cache pour réutilisation
 * 
 * Gain: 89% de réduction au chargement initial
 */

// Cache en mémoire
let cachedMetadata = null; // Métadonnées légères
let cachedDetails = {}; // Détails par catégorie: { streetworkout: {...}, run10k: {...} }
let isLoadingMeta = false;
let isLoadingDetails = {}; // Track par catégorie
let metaPromise = null;
let detailsPromises = {}; // Promesses par catégorie

/**
 * Mapping statique des imports de détails
 * React Native ne supporte pas les dynamic imports avec templates
 */
const CATEGORY_DETAILS_MAP = {
  street: () => require('./programDetails/streetworkout-details.json'),
  run: () => require('./programDetails/run10k-details.json'),
  running: () => require('./programDetails/run10k-details.json'), // Alias pour running
};


/**
 * Charge les métadonnées des programmes (léger, ~21KB)
 * @returns {Promise<Object>} Les métadonnées des programmes
 */
export const loadProgramsMeta = async () => {
  // Si déjà en cache, retourner immédiatement
  if (cachedMetadata) {
    return cachedMetadata;
  }

  // Si déjà en cours de chargement, attendre la promesse existante
  if (isLoadingMeta && metaPromise) {
    return metaPromise;
  }

  // Démarrer le chargement
  isLoadingMeta = true;
  metaPromise = (async () => {
    try {
      const startTime = Date.now();
      console.log('📦 Chargement métadonnées programmes (léger)...');
      
      // Import statique du fichier de métadonnées (21KB) - compatible React Native
      const metaData = require('./programs-meta.json');
      
      cachedMetadata = metaData;
      const loadTime = Date.now() - startTime;
      console.log(`✅ Métadonnées chargées (${loadTime}ms, ${(JSON.stringify(cachedMetadata).length / 1024).toFixed(1)}KB)`);
      
      return cachedMetadata;
    } catch (error) {
      console.error('❌ Erreur chargement métadonnées:', error);
      throw error;
    } finally {
      isLoadingMeta = false;
      metaPromise = null;
    }
  })();

  return metaPromise;
};

/**
 * Charge les détails complets d'une catégorie (lazy loaded)
 * @param {string} categoryId - ID de la catégorie (ex: 'streetworkout', 'run10k')
 * @returns {Promise<Object>} Les détails de tous les programmes de la catégorie
 */
export const loadCategoryDetails = async (categoryId) => {
  // Si déjà en cache, retourner immédiatement
  if (cachedDetails[categoryId]) {
    console.log(`💾 Détails ${categoryId} depuis cache`);
    return cachedDetails[categoryId];
  }

  // Si déjà en cours de chargement, attendre la promesse existante
  if (isLoadingDetails[categoryId] && detailsPromises[categoryId]) {
    return detailsPromises[categoryId];
  }

  // Démarrer le chargement
  isLoadingDetails[categoryId] = true;
  detailsPromises[categoryId] = (async () => {
    try {
      const startTime = Date.now();
      console.log(`📦 Chargement détails ${categoryId}...`);
      
      // Utiliser le mapping statique au lieu d'import dynamique avec template
      const importFn = CATEGORY_DETAILS_MAP[categoryId];
      if (!importFn) {
        throw new Error(`Catégorie inconnue: ${categoryId}`);
      }
      
      const rawDetails = importFn();
      
      // Si le format a une propriété "programs" (ancien format run10k), le transformer
      let details;
      if (rawDetails.programs && Array.isArray(rawDetails.programs)) {
        // Transformer en objet clé-valeur
        details = {};
        rawDetails.programs.forEach(program => {
          details[program.id] = program;
        });
        console.log(`🔄 Format transformé pour ${categoryId} (${rawDetails.programs.length} programmes)`);
      } else {
        // Format déjà correct (streetworkout)
        details = rawDetails;
      }
      
      cachedDetails[categoryId] = details;
      const loadTime = Date.now() - startTime;
      console.log(`✅ Détails ${categoryId} chargés (${loadTime}ms)`);
      
      return cachedDetails[categoryId];
    } catch (error) {
      console.error(`❌ Erreur chargement détails ${categoryId}:`, error);
      throw error;
    } finally {
      isLoadingDetails[categoryId] = false;
      delete detailsPromises[categoryId];
    }
  })();

  return detailsPromises[categoryId];
};

/**
 * Charge les programmes complets (métadonnées + détails fusionnés)
 * Compatible avec l'ancienne API
 * @returns {Promise<Object>} Les programmes complets
 */
export const loadPrograms = async () => {
  try {
    // Charger d'abord les métadonnées
    const metadata = await loadProgramsMeta();
    
    // Validation
    if (!metadata || !metadata.categories) {
      console.error('❌ loadPrograms: métadonnées invalides', metadata);
      throw new Error('Métadonnées des programmes invalides');
    }
    
    // Pour compatibilité, on retourne juste les métadonnées
    // Les détails seront chargés à la demande via loadProgramDetails()
    return metadata;
  } catch (error) {
    console.error('❌ loadPrograms failed:', error);
    throw error;
  }
};

/**
 * Charge les détails d'un programme spécifique (lazy loaded)
 * @param {string} categoryId - ID de la catégorie
 * @param {string} programId - ID du programme
 * @returns {Promise<Object>} Les détails complets du programme (avec levels, exercises, etc.)
 */
export const loadProgramDetails = async (categoryId, programId) => {
  const details = await loadCategoryDetails(categoryId);
  return details[programId] || null;
};

/**
 * Fusionne les métadonnées d'un programme avec ses détails
 * @param {string} categoryId - ID de la catégorie
 * @param {string} programId - ID du programme
 * @returns {Promise<Object>} Programme complet (meta + détails)
 */
export const loadFullProgram = async (categoryId, programId) => {
  // Charger les métadonnées
  const metadata = await loadProgramsMeta();
  const category = metadata.categories.find(cat => cat.id === categoryId);
  if (!category) return null;
  
  const programMeta = category.programs.find(prog => prog.id === programId);
  if (!programMeta) return null;
  
  // Charger les détails
  const programDetails = await loadProgramDetails(categoryId, programId);
  if (!programDetails) return programMeta; // Retourner au moins les meta
  
  // Fusionner
  return {
    ...programMeta,
    ...programDetails
  };
};

/**
 * Obtient une catégorie spécifique (métadonnées uniquement)
 * @param {string} categoryId - ID de la catégorie
 * @returns {Promise<Object|null>} La catégorie ou null
 */
export const getCategoryById = async (categoryId) => {
  const metadata = await loadProgramsMeta();
  return metadata.categories.find(cat => cat.id === categoryId) || null;
};

/**
 * Obtient un programme spécifique (métadonnées uniquement)
 * @param {string} categoryId - ID de la catégorie  
 * @param {string} programId - ID du programme
 * @returns {Promise<Object|null>} Le programme (meta) ou null
 */
export const getProgramById = async (categoryId, programId) => {
  const category = await getCategoryById(categoryId);
  if (!category) return null;
  
  return category.programs.find(prog => prog.id === programId) || null;
};

/**
 * Précharge tous les détails (pour usage offline ou performance)
 * @returns {Promise<void>}
 */
export const preloadAllDetails = async () => {
  console.log('🔄 Préchargement de tous les détails...');
  const metadata = await loadProgramsMeta();
  
  const promises = metadata.categories.map(cat => 
    loadCategoryDetails(cat.id)
  );
  
  await Promise.all(promises);
  console.log('✅ Tous les détails préchargés');
};

/**
 * Vide le cache (utile pour les tests ou le rechargement)
 */
export const clearCache = () => {
  cachedMetadata = null;
  cachedDetails = {};
  isLoadingMeta = false;
  isLoadingDetails = {};
  metaPromise = null;
  detailsPromises = {};
  console.log('🗑️ Cache programmes vidé');
};

/**
 * Export synchrone pour compatibilité descendante
 * ATTENTION: Utilisez loadProgramsMeta() de préférence pour de meilleures performances
 */
export const getProgramsSync = () => {
  if (!cachedMetadata) {
    console.warn('⚠️ getProgramsSync() appelé avant chargement - chargement synchrone forcé');
    // Fallback: import synchrone des métadonnées (moins performant mais léger)
    const metaData = require('./programs-meta.json');
    return metaData;
  }
  return cachedMetadata;
};

export default {
  loadPrograms,
  loadProgramsMeta,
  loadCategoryDetails,
  loadProgramDetails,
  loadFullProgram,
  getCategoryById,
  getProgramById,
  preloadAllDetails,
  clearCache,
  getProgramsSync
};

