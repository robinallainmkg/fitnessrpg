/**
 * Utilitaires pour calculer les statistiques cumulées des programmes
 */

/**
 * Calcule les stat bonuses cumulés de tous les programmes d'une catégorie
 * @param {Object} category - La catégorie de programmes
 * @returns {Array} - Les 3 stats les plus forts en ordre décroissant [{ stat, value, label, icon }]
 */
export const getTopCumulativeStats = (category) => {
  if (!category || !category.programs || category.programs.length === 0) {
    return [];
  }

  // Mapping des noms de stats vers leurs labels et icônes
  const statLabels = {
    strength: { label: 'Force', icon: '💪' },
    power: { label: 'Puissance', icon: '⚡' },
    endurance: { label: 'Endurance', icon: '🏃' },
    speed: { label: 'Vitesse', icon: '🚀' },
    flexibility: { label: 'Souplesse', icon: '🤸' },
  };

  // Initialiser les totaux pour chaque stat
  const cumulativeStats = {
    strength: 0,
    power: 0,
    endurance: 0,
    speed: 0,
    flexibility: 0,
  };

  // Cumuler les stats de tous les programmes
  category.programs.forEach(program => {
    if (program.statBonuses) {
      Object.keys(program.statBonuses).forEach(stat => {
        if (cumulativeStats.hasOwnProperty(stat)) {
          cumulativeStats[stat] += program.statBonuses[stat];
        }
      });
    }
  });

  // Convertir en tableau et trier par valeur décroissante
  const statsArray = Object.keys(cumulativeStats).map(stat => ({
    stat,
    value: cumulativeStats[stat],
    label: statLabels[stat]?.label || stat,
    icon: statLabels[stat]?.icon || '📊',
  }));

  // Trier par valeur décroissante et prendre les 3 premiers
  const topStats = statsArray
    .filter(s => s.value > 0) // Exclure les stats à 0
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return topStats;
};

/**
 * Calcule les stat bonuses cumulés d'un programme individuel (skill tree node)
 * @param {Object} program - Le programme individuel
 * @returns {Array} - Les 3 stats les plus forts en ordre décroissant
 */
export const getTopProgramStats = (program) => {
  if (!program || !program.statBonuses) {
    return [];
  }

  const statLabels = {
    strength: { label: 'Force', icon: '💪' },
    power: { label: 'Puissance', icon: '⚡' },
    endurance: { label: 'Endurance', icon: '🏃' },
    speed: { label: 'Vitesse', icon: '🚀' },
    flexibility: { label: 'Souplesse', icon: '🤸' },
  };

  const statsArray = Object.keys(program.statBonuses).map(stat => ({
    stat,
    value: program.statBonuses[stat],
    label: statLabels[stat]?.label || stat,
    icon: statLabels[stat]?.icon || '📊',
  }));

  const topStats = statsArray
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return topStats;
};
