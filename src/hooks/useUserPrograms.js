import { useState, useEffect } from 'react';
import { getWithRetry } from '../utils/firestoreRetry';
import { loadPrograms } from '../data/programsLoader';
import { loadProgramTree } from '../utils/programLoader';
import { useAuth } from '../contexts/AuthContext';

// ✅ IMPORT UNIFIÉ - Firebase simple config
import { getFirestore } from '../config/firebase.simple';
const firestore = getFirestore();

/**
 * Hook pour gérer les données des programmes utilisateur
 * Combine les programmes disponibles avec la progression utilisateur
 * 
 * GUEST MODE: Retourne des données vides si l'utilisateur est en mode invité
 * 
 * @returns {Object} {
 *   userPrograms: Array des programmes avec progression,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: function
 * }
 */
export const useUserPrograms = () => {
  const [userPrograms, setUserPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isGuest } = useAuth();

  const fetchUserPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les programmes (métadonnées) - TOUJOURS, même en mode invité
      const programs = await loadPrograms();
      
      // Validation : vérifier que les programmes sont chargés
      if (!programs || !programs.categories || !Array.isArray(programs.categories)) {
        console.error('❌ Impossible de charger les métadonnées des programmes, structure invalide:', programs);
        throw new Error('Impossible de charger les métadonnées des programmes');
      }

      // GUEST MODE: Retourner les programmes sans progression Firebase
      if (isGuest || !user?.uid) {
        console.log('👤 Mode invité - programmes chargés sans progression Firebase');
        
        // Créer la liste des programmes sans progression
        const programsWithoutProgress = [];
        
        for (const category of programs.categories) {
          try {
            // Charger l'arbre de programmes pour cette catégorie
            const treeData = await loadProgramTree(category.id);
            
            if (!treeData || !treeData.tree || !Array.isArray(treeData.tree)) {
              console.warn(`⚠️ [GUEST] Category ${category.id} has no tree data`);
              continue;
            }
            
            treeData.tree.forEach(program => {
              programsWithoutProgress.push({
                ...program,
                categoryId: category.id,
                categoryName: category.name,
                userProgress: { xp: 0, level: 0, completedSkills: 0 },
                isStarted: false,
                hasSkills: true
              });
            });
          } catch (error) {
            console.error(`❌ [GUEST] Error loading tree for ${category.id}:`, error);
          }
        }
        
        setUserPrograms(programsWithoutProgress);
        setLoading(false);
        return;
      }

      // Récupérer les données utilisateur
      const fs = firestore;
      const userDoc = await fs.collection('users').doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const userProgramsData = userData.programs || {};

      // Créer la liste des programmes avec progression
      const programsWithProgress = [];

      // Parcourir toutes les catégories et programmes disponibles
      for (const category of programs.categories) {
        try {
          // Charger l'arbre de programmes pour cette catégorie
          const treeData = await loadProgramTree(category.id);
          
          if (!treeData || !treeData.tree || !Array.isArray(treeData.tree)) {
            console.warn(`⚠️ Category ${category.id} has no tree data`);
            continue;
          }
          
          // Parcourir les programmes de l'arbre
          treeData.tree.forEach(program => {
            // Récupérer la progression utilisateur pour ce programme
            const userProgress = userProgramsData[program.id] || {
              xp: 0,
              level: 0,
              completedSkills: 0
            };

            // Calculer le nombre total de compétences pour ce programme
            const totalSkills = program.skills ? program.skills.length : 0;

            // Créer l'objet programme complet
            const programWithProgress = {
              program: {
                id: program.id,
                name: program.name,
                icon: program.icon,
                color: program.color || category.color,
                description: program.description,
                category: category.name
              },
              progress: {
                ...userProgress,
                totalSkills
              },
              // Calculer des métriques utiles
              progressPercentage: totalSkills > 0 
                ? Math.round((userProgress.completedSkills / totalSkills) * 100) 
                : 0,
              isStarted: userProgress.completedSkills > 0,
              isCompleted: userProgress.completedSkills === totalSkills && totalSkills > 0,
              hasSkills: totalSkills > 0
            };

            programsWithProgress.push(programWithProgress);
          });
        } catch (error) {
          console.error(`❌ Error loading tree for ${category.id}:`, error);
        }
      }

      // Trier par progression décroissante (programmes actifs en premier)
      programsWithProgress.sort((a, b) => {
        // Programmes commencés en premier
        if (a.isStarted && !b.isStarted) return -1;
        if (!a.isStarted && b.isStarted) return 1;
        
        // Puis par XP décroissant
        if (a.progress.xp !== b.progress.xp) {
          return b.progress.xp - a.progress.xp;
        }
        
        // Puis par nom alphabétique
        return a.program.name.localeCompare(b.program.name);
      });

      setUserPrograms(programsWithProgress);
    } catch (err) {
      console.error('Erreur lors du chargement des programmes utilisateur:', err);
      setError(err.message);
      // En cas d'erreur, retourner un tableau vide plutôt que de planter
      setUserPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startTime = Date.now();
    
    // ═══ NOUVELLE ARCHITECTURE: Les invités ont un user.uid Firebase ═══
    if (!user?.uid) {
      console.log(`[useUserPrograms] ⏭️ Skip Firebase - no user (${Date.now() - startTime}ms)`);
      setLoading(false);
      setUserPrograms([]);
      return;
    }
    
    console.log(`[useUserPrograms] useEffect triggered - User: ${user.uid}`, isGuest ? '(guest)' : '(authenticated)');
    console.log(`[useUserPrograms] Starting fetchUserPrograms...`);
    
    fetchUserPrograms().then(() => {
      console.log(`[useUserPrograms] ✅ Completed in ${Date.now() - startTime}ms`);
    });
  }, [user, isGuest]); // ✅ Dépendances: user ET isGuest

  return {
    userPrograms,
    loading,
    error,
    refetch: fetchUserPrograms
  };
};

/**
 * Hook pour obtenir un programme spécifique avec sa progression
 * 
 * @param {string} programId - ID du programme
 * @returns {Object} { program, progress, loading, error }
 */
export const useUserProgram = (programId) => {
  const { userPrograms, loading, error } = useUserPrograms();
  
  const userProgram = userPrograms.find(up => up.program.id === programId);
  
  return {
    program: userProgram?.program || null,
    progress: userProgram?.progress || null,
    progressPercentage: userProgram?.progressPercentage || 0,
    isStarted: userProgram?.isStarted || false,
    isCompleted: userProgram?.isCompleted || false,
    loading,
    error
  };
};

/**
 * Hook pour obtenir les statistiques globales des programmes
 * 
 * @returns {Object} Statistiques agrégées
 */
export const useUserProgramsStats = () => {
  const { userPrograms, loading, error } = useUserPrograms();

  const stats = {
    totalPrograms: userPrograms.length,
    startedPrograms: userPrograms.filter(up => up.isStarted).length,
    completedPrograms: userPrograms.filter(up => up.isCompleted).length,
    totalXP: userPrograms.reduce((sum, up) => sum + up.progress.xp, 0),
    totalSkillsCompleted: userPrograms.reduce((sum, up) => sum + up.progress.completedSkills, 0),
    totalSkillsAvailable: userPrograms.reduce((sum, up) => sum + up.progress.totalSkills, 0),
    averageProgress: 0,
    favoriteProgram: null,
    loading,
    error
  };

  // Calculer la progression moyenne
  if (stats.totalSkillsAvailable > 0) {
    stats.averageProgress = Math.round(
      (stats.totalSkillsCompleted / stats.totalSkillsAvailable) * 100
    );
  }

  // Trouver le programme favori (plus d'XP)
  if (userPrograms.length > 0) {
    stats.favoriteProgram = userPrograms.reduce((fav, current) => 
      current.progress.xp > fav.progress.xp ? current : fav
    );
  }

  return stats;
};

/**
 * Hook pour obtenir les programmes par catégorie avec progression
 * 
 * @returns {Object} Programmes groupés par catégorie
 */
export const useUserProgramsByCategory = () => {
  const { userPrograms, loading, error } = useUserPrograms();

  const programsByCategory = {};

  userPrograms.forEach(userProgram => {
    const category = userProgram.program.category;
    if (!programsByCategory[category]) {
      programsByCategory[category] = [];
    }
    programsByCategory[category].push(userProgram);
  });

  return {
    programsByCategory,
    categories: Object.keys(programsByCategory),
    loading,
    error
  };
};

/**
 * Hook pour obtenir les catégories complètes avec progression agrégée
 * Retourne les catégories (ex: "Street Workout") avec leur progression totale
 * 
 * @returns {Object} { categories: Array, loading: boolean, error: string|null }
 */
export const useUserCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isGuest } = useAuth();

  const fetchUserCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les programmes (métadonnées) - TOUJOURS
      const programs = await loadPrograms();

      // GUEST MODE: Retourner les catégories sans progression Firebase
      if (isGuest || !user?.uid) {
        console.log('👤 Mode invité - catégories chargées sans progression Firebase');
        
        const categoriesWithoutProgress = programs.categories.map(category => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          totalPrograms: category.programs?.length || 0,
          completedPrograms: 0,
          totalXP: 0,
          totalLevels: category.programs?.reduce((sum, prog) => sum + (prog.totalLevels || 0), 0) || 0,
          completedLevels: 0,
          progressPercentage: 0,
          isStarted: false
        }));
        
        setCategories(categoriesWithoutProgress);
        setLoading(false);
        return;
      }

      // Récupérer les données utilisateur
      const fs = firestore;
      const userDoc = await fs.collection('users').doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const userProgramsData = userData.programs || {};

      // Créer la liste des catégories avec progression
      const categoriesWithProgress = programs.categories.map(category => {
        // Calculer la progression agrégée pour tous les skills de cette catégorie
        let totalXP = 0;
        let totalCompletedSkills = 0;
        let totalSkills = category.programs?.length || 0;
        let maxLevel = 0;

        category.programs.forEach(program => {
          const userProgress = userProgramsData[program.id];
          if (userProgress) {
            totalXP += userProgress.xp || 0;
            totalCompletedSkills += userProgress.completedSkills || 0;
            maxLevel = Math.max(maxLevel, userProgress.level || 0);
          }
        });

        const progressPercentage = totalSkills > 0 
          ? Math.round((totalCompletedSkills / totalSkills) * 100) 
          : 0;

        return {
          program: category, // La catégorie complète avec tous ses programmes
          progress: {
            xp: totalXP,
            level: maxLevel,
            completedSkills: totalCompletedSkills,
            totalSkills
          },
          progressPercentage,
          isStarted: totalCompletedSkills > 0,
          isCompleted: totalCompletedSkills === totalSkills && totalSkills > 0,
        };
      });

      // Trier par progression décroissante
      categoriesWithProgress.sort((a, b) => {
        // Catégories commencées en premier
        if (a.isStarted && !b.isStarted) return -1;
        if (!a.isStarted && b.isStarted) return 1;
        
        // Puis par XP décroissant
        if (a.progress.xp !== b.progress.xp) {
          return b.progress.xp - a.progress.xp;
        }
        
        // Puis par nom alphabétique
        return a.program.name.localeCompare(b.program.name);
      });

      setCategories(categoriesWithProgress);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories utilisateur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startTime = Date.now();
    
    // ═══ NOUVELLE ARCHITECTURE: Les invités ont un user.uid Firebase ═══
    if (!user?.uid) {
      console.log(`[useUserCategories] ⏭️ Skip Firebase - no user (${Date.now() - startTime}ms)`);
      setLoading(false);
      setCategories([]);
      return;
    }
    
    console.log(`[useUserCategories] useEffect triggered - User: ${user.uid}`, isGuest ? '(guest)' : '(authenticated)');
    console.log(`[useUserCategories] Starting fetchUserCategories...`);
    
    fetchUserCategories().then(() => {
      console.log(`[useUserCategories] ✅ Completed in ${Date.now() - startTime}ms`);
    });
  }, [user, isGuest]); // ✅ Dépendances: user ET isGuest

  return {
    categories,
    loading,
    error,
    refetch: fetchUserCategories
  };
};

/**
 * Hook pour les programmes recommandés (non commencés avec potentiel)
 * 
 * @param {number} limit - Nombre de recommandations (défaut: 3)
 * @returns {Array} Programmes recommandés
 */
export const useRecommendedPrograms = (limit = 3) => {
  const { userPrograms, loading, error } = useUserPrograms();

  const recommended = userPrograms
    .filter(up => !up.isStarted && up.hasSkills) // Non commencés avec compétences
    .slice(0, limit);

  return {
    recommendedPrograms: recommended,
    loading,
    error
  };
};

/**
 * Hook pour les catégories recommandées (non commencées)
 * 
 * @param {number} limit - Nombre de catégories recommandées à retourner
 * @returns {Object} { recommendedCategories, loading, error }
 */
export const useRecommendedCategories = (limit = 3) => {
  const { categories, loading, error } = useUserCategories();

  const recommended = categories
    .filter(cat => !cat.isStarted) // Non commencées
    .slice(0, limit);

  return {
    recommendedCategories: recommended,
    loading,
    error
  };
};
