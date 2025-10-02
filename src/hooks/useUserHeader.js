/**
 * HOOK POUR GESTION DES DONNÉES HEADER UTILISATEUR
 * 
 * Ce hook centralise le calcul et la formatage des données
 * nécessaires pour l'affichage du header utilisateur
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useUserHeader = () => {
  const { user } = useAuth();

  const headerData = useMemo(() => {
    if (!user) {
      return {
        username: 'Utilisateur',
        globalLevel: 0,
        globalXP: 0,
        title: 'Débutant',
        streak: 0,
        nextLevelXP: 100,
        progressToNext: 0,
        isLoading: true
      };
    }

    // Extraction des données utilisateur
    const globalXP = user.globalXP || user.totalXP || 0;
    const globalLevel = user.globalLevel || Math.floor(Math.sqrt(globalXP / 100));
    
    // Calcul du titre
    const getTitle = (level) => {
      if (level >= 20) return "Légende";
      if (level >= 12) return "Maître";
      if (level >= 7) return "Champion";
      if (level >= 3) return "Guerrier";
      return "Débutant";
    };

    const title = user.title || getTitle(globalLevel);

    // Calcul de la progression vers le prochain niveau
    const nextLevelXP = Math.pow(globalLevel + 1, 2) * 100;
    const currentLevelXP = Math.pow(globalLevel, 2) * 100;
    const progressXP = globalXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    const progressToNext = Math.min(Math.max(progressXP / neededXP, 0), 1);

    // Formatage du nom d'utilisateur
    const getDisplayName = () => {
      if (user.displayName) return user.displayName;
      if (user.email) return user.email.split('@')[0];
      return 'Utilisateur';
    };

    return {
      username: getDisplayName(),
      globalLevel,
      globalXP,
      title,
      streak: user.streak || 0,
      nextLevelXP,
      progressToNext,
      progressXP,
      neededXP,
      isLoading: false,
      
      // Données supplémentaires pour affichage avancé
      currentLevelXP,
      totalPrograms: user.programs ? Object.keys(user.programs).length : 1,
      joinedDate: user.metadata?.creationTime,
      
      // États calculés
      isMaxLevel: globalLevel >= 50, // Niveau max supposé
      isNewUser: globalXP === 0,
      hasStreak: (user.streak || 0) > 0,
      
      // Formatters
      xpFormatted: globalXP.toLocaleString(),
      progressFormatted: `${progressXP.toLocaleString()} / ${neededXP.toLocaleString()}`,
      levelProgress: Math.round(progressToNext * 100)
    };
  }, [user]);

  return headerData;
};

/**
 * HOOK POUR STATISTIQUES UTILISATEUR AVANCÉES
 */
export const useUserStats = () => {
  const { user } = useAuth();

  const stats = useMemo(() => {
    if (!user) {
      return {
        totalWorkouts: 0,
        totalTime: 0,
        averageScore: 0,
        completedSkills: 0,
        currentStreak: 0,
        longestStreak: 0,
        ranking: 'Débutant'
      };
    }

    // Extraction des statistiques depuis les données utilisateur
    const completedPrograms = user.completedPrograms || [];
    const workoutSessions = user.workoutSessions || [];
    
    return {
      totalWorkouts: workoutSessions.length,
      totalTime: workoutSessions.reduce((sum, session) => sum + (session.duration || 0), 0),
      averageScore: workoutSessions.length > 0 
        ? workoutSessions.reduce((sum, session) => sum + (session.score || 0), 0) / workoutSessions.length
        : 0,
      completedSkills: completedPrograms.length,
      currentStreak: user.streak || 0,
      longestStreak: user.longestStreak || user.streak || 0,
      ranking: user.title || 'Débutant',
      
      // Calculs dérivés
      averageWorkoutTime: workoutSessions.length > 0 
        ? Math.round((workoutSessions.reduce((sum, session) => sum + (session.duration || 0), 0)) / workoutSessions.length)
        : 0,
      
      // Formatters
      totalTimeFormatted: formatDuration(workoutSessions.reduce((sum, session) => sum + (session.duration || 0), 0)),
      averageScoreFormatted: workoutSessions.length > 0 
        ? Math.round(workoutSessions.reduce((sum, session) => sum + (session.score || 0), 0) / workoutSessions.length)
        : 0
    };
  }, [user]);

  return stats;
};

/**
 * Formate une durée en secondes vers un format lisible
 */
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

/**
 * HOOK POUR NOTIFICATIONS ET ACHIEVEMENTS
 */
export const useUserAchievements = () => {
  const headerData = useUserHeader();
  const stats = useUserStats();

  const achievements = useMemo(() => {
    const unlocked = [];
    
    // Achievements basés sur le niveau
    if (headerData.globalLevel >= 5) unlocked.push('first_warrior');
    if (headerData.globalLevel >= 10) unlocked.push('champion_rising');
    if (headerData.globalLevel >= 20) unlocked.push('legendary_master');
    
    // Achievements basés sur les stats
    if (stats.totalWorkouts >= 10) unlocked.push('workout_veteran');
    if (stats.totalWorkouts >= 50) unlocked.push('fitness_addict');
    if (stats.currentStreak >= 7) unlocked.push('week_warrior');
    if (stats.currentStreak >= 30) unlocked.push('month_master');
    
    // Achievements basés sur les compétences
    if (stats.completedSkills >= 5) unlocked.push('skill_collector');
    if (stats.completedSkills >= 15) unlocked.push('skill_master');
    
    return {
      unlocked,
      total: 8, // Total d'achievements disponibles
      percentage: Math.round((unlocked.length / 8) * 100),
      
      // Prochains achievements à débloquer
      nextToUnlock: getNextAchievements(headerData, stats, unlocked)
    };
  }, [headerData, stats]);

  return achievements;
};

/**
 * Calcule les prochains achievements à débloquer
 */
const getNextAchievements = (headerData, stats, unlocked) => {
  const next = [];
  
  if (!unlocked.includes('first_warrior') && headerData.globalLevel < 5) {
    next.push({
      id: 'first_warrior',
      name: 'Premier Guerrier',
      description: 'Atteindre le niveau 5',
      progress: headerData.globalLevel,
      target: 5,
      percentage: Math.round((headerData.globalLevel / 5) * 100)
    });
  }
  
  if (!unlocked.includes('week_warrior') && stats.currentStreak < 7) {
    next.push({
      id: 'week_warrior',
      name: 'Guerrier de la Semaine',
      description: 'Maintenir une série de 7 jours',
      progress: stats.currentStreak,
      target: 7,
      percentage: Math.round((stats.currentStreak / 7) * 100)
    });
  }
  
  if (!unlocked.includes('skill_collector') && stats.completedSkills < 5) {
    next.push({
      id: 'skill_collector',
      name: 'Collectionneur de Compétences',
      description: 'Compléter 5 compétences',
      progress: stats.completedSkills,
      target: 5,
      percentage: Math.round((stats.completedSkills / 5) * 100)
    });
  }
  
  return next.slice(0, 3); // Limite à 3 achievements suivants
};

export default {
  useUserHeader,
  useUserStats,
  useUserAchievements
};
