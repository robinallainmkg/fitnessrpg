/**
 * HOOK POUR GESTION DES STATS UTILISATEUR
 * 
 * Ce hook fournit des utilitaires pour calculer et gérer les stats utilisateur
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useUserStats = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Stats par défaut
  const defaultStats = {
    strength: 0,
    endurance: 0,
    power: 0,
    speed: 0,
    flexibility: 0
  };

  // Stats actuelles de l'utilisateur
  const currentStats = useMemo(() => {
    if (!user) return defaultStats;
    
    return {
      strength: user.stats?.strength || 0,
      endurance: user.stats?.endurance || 0,
      power: user.stats?.power || 0,
      speed: user.stats?.speed || 0,
      flexibility: user.stats?.flexibility || 0
    };
  }, [user]);

  // Calcul du total des stats
  const totalStats = useMemo(() => {
    return Object.values(currentStats).reduce((sum, val) => sum + val, 0);
  }, [currentStats]);

  // Calcul de la moyenne
  const averageStats = useMemo(() => {
    return totalStats / 5;
  }, [totalStats]);

  // Stat la plus élevée
  const highestStat = useMemo(() => {
    const entries = Object.entries(currentStats);
    return entries.reduce((highest, [key, value]) => 
      value > highest.value ? { key, value } : highest
    , { key: 'strength', value: 0 });
  }, [currentStats]);

  // Stat la plus faible
  const lowestStat = useMemo(() => {
    const entries = Object.entries(currentStats);
    return entries.reduce((lowest, [key, value]) => 
      value < lowest.value ? { key, value } : lowest
    , { key: 'strength', value: 100 });
  }, [currentStats]);

  // Niveau global basé sur les stats
  const statsLevel = useMemo(() => {
    if (totalStats === 0) return 0;
    return Math.floor(totalStats / 25); // Niveau tous les 25 points
  }, [totalStats]);

  // Titre basé sur les stats
  const statsTitle = useMemo(() => {
    if (totalStats >= 400) return 'Légende';
    if (totalStats >= 300) return 'Maître';
    if (totalStats >= 200) return 'Expert';
    if (totalStats >= 100) return 'Avancé';
    if (totalStats >= 50) return 'Intermédiaire';
    return 'Débutant';
  }, [totalStats]);

  // Progression vers le prochain niveau
  const progressToNextLevel = useMemo(() => {
    const currentLevelMin = statsLevel * 25;
    const nextLevelMin = (statsLevel + 1) * 25;
    const progress = totalStats - currentLevelMin;
    const needed = nextLevelMin - currentLevelMin;
    
    return {
      current: progress,
      needed: needed,
      percentage: (progress / needed) * 100
    };
  }, [statsLevel, totalStats]);

  useEffect(() => {
    setIsLoading(false);
  }, [user]);

  return {
    // Stats de base
    stats: currentStats,
    isLoading,
    
    // Calculs
    totalStats,
    averageStats,
    highestStat,
    lowestStat,
    
    // Niveau et titre
    statsLevel,
    statsTitle,
    progressToNextLevel,
    
    // Helpers
    hasAnyStats: totalStats > 0,
    isMaxLevel: statsLevel >= 20, // Niveau max supposé à 20
    
    // Formatters
    getStatPercentage: (statValue) => Math.round((statValue / 100) * 100),
    getStatRank: (statKey) => {
      const value = currentStats[statKey];
      if (value >= 80) return 'Excellent';
      if (value >= 60) return 'Très Bon';
      if (value >= 40) return 'Bon';
      if (value >= 20) return 'Moyen';
      return 'Faible';
    }
  };
};

/**
 * HOOK POUR CALCULER LES STATS DEPUIS LES COMPÉTENCES
 */
export const useStatsFromSkills = (completedSkills = []) => {
  const [calculatedStats, setCalculatedStats] = useState({
    strength: 0,
    endurance: 0,
    power: 0,
    speed: 0,
    flexibility: 0
  });

  useEffect(() => {
    const stats = {
      strength: 0,
      endurance: 0,
      power: 0,
      speed: 0,
      flexibility: 0
    };

    completedSkills.forEach(skill => {
      if (skill.statBonuses) {
        stats.strength += skill.statBonuses.strength || 0;
        stats.endurance += skill.statBonuses.endurance || 0;
        stats.power += skill.statBonuses.power || 0;
        stats.speed += skill.statBonuses.speed || 0;
        stats.flexibility += skill.statBonuses.flexibility || 0;
      }
    });

    setCalculatedStats(stats);
  }, [completedSkills]);

  return {
    stats: calculatedStats,
    skillsCount: completedSkills.length,
    hasBonus: completedSkills.some(skill => skill.statBonuses)
  };
};

/**
 * HOOK POUR COMPARER DEUX SETS DE STATS
 */
export const useStatsComparison = (beforeStats, afterStats) => {
  const comparison = useMemo(() => {
    const result = {};
    const statKeys = ['strength', 'endurance', 'power', 'speed', 'flexibility'];
    
    statKeys.forEach(key => {
      const before = beforeStats?.[key] || 0;
      const after = afterStats?.[key] || 0;
      const difference = after - before;
      
      result[key] = {
        before,
        after,
        difference,
        percentageChange: before > 0 ? ((difference / before) * 100) : 0,
        improved: difference > 0,
        declined: difference < 0,
        unchanged: difference === 0
      };
    });
    
    return result;
  }, [beforeStats, afterStats]);

  const summary = useMemo(() => {
    const changes = Object.values(comparison);
    
    return {
      totalImproved: changes.filter(c => c.improved).length,
      totalDeclined: changes.filter(c => c.declined).length,
      totalUnchanged: changes.filter(c => c.unchanged).length,
      biggestImprovement: changes.reduce((max, curr) => 
        curr.difference > max.difference ? curr : max
      , { difference: 0 }),
      overallImproved: changes.reduce((sum, curr) => sum + curr.difference, 0) > 0
    };
  }, [comparison]);

  return {
    comparison,
    summary
  };
};

export default {
  useUserStats,
  useStatsFromSkills,
  useStatsComparison
};
