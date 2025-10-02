import { useState, useEffect } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import programs from '../data/programs.json';

/**
 * Hook pour gérer les données des programmes utilisateur
 * Combine les programmes disponibles avec la progression utilisateur
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

  const fetchUserPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setUserPrograms([]);
        setLoading(false);
        return;
      }

      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const userProgramsData = userData.programs || {};

      // Créer la liste des programmes avec progression
      const programsWithProgress = [];

      // Parcourir toutes les catégories et programmes disponibles
      programs.categories.forEach(category => {
        category.programs.forEach(program => {
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
              color: program.color,
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
      });

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPrograms();
  }, []);

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
