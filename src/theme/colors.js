import { rpgTheme } from './rpgTheme';

/**
 * Système de couleurs unifié - Source: rpgTheme
 * 🎨 Backward compatibility layer
 * ⚠️ Tous les nouveaux codes doivent importer directement rpgTheme
 */
export const colors = {
  // Primaires
  primary: rpgTheme.colors.neon.blue,        // #4D9EFF - Bleu électrique
  secondary: rpgTheme.colors.neon.purple,    // #7B61FF - Violet néon
  accent: rpgTheme.colors.neon.blue,         // #4D9EFF - Alias
  
  // Status
  success: rpgTheme.colors.status.active,    // #00FF94 - Vert énergie
  warning: rpgTheme.colors.neon.pink,        // #FF2E97 - Rose vif
  error: '#FF6B6B',                          // Rouge d'erreur
  
  // Backgrounds
  background: rpgTheme.colors.background.primary,   // #0A0E27
  surface: rpgTheme.colors.background.secondary,    // #151B3B
  card: rpgTheme.colors.background.card,            // #1A2244
  
  // Texte
  text: rpgTheme.colors.text.primary,        // #FFFFFF
  textPrimary: rpgTheme.colors.text.primary, // #FFFFFF
  textSecondary: rpgTheme.colors.text.secondary, // #B8C5D6
  border: '#3A3A3A',
  
  // Legacy aliases (à supprimer progressivement)
  cyan: rpgTheme.colors.neon.cyan,           // #00E5FF
  green: rpgTheme.colors.status.active,      // #00FF94
};

/**
 * 🎨 COULEURS PAR PROGRAMME
 * Couleur prédominante unique pour chaque programme
 * Utilisée pour: bordures, badges, highlight dans les cards
 * 
 * Palette:
 * - Street Workout: Bleu électrique (#4D9EFF)
 * - Running: Vert énergie (#00FF94)
 * - (Extensible pour futurs programmes)
 */
export const PROGRAM_COLORS = {
  'streetworkout': {
    id: 'streetworkout',
    name: 'Street Workout',
    color: '#4D9EFF',           // Bleu électrique
    hex: '#4D9EFF',
    rgb: { r: 77, g: 158, b: 255 },
    description: 'Dominance bleue - Pouvoir & électricité',
  },
  'run10k': {
    id: 'run10k',
    name: 'Run 10K',
    color: '#00FF94',           // Vert énergie
    hex: '#00FF94',
    rgb: { r: 0, g: 255, b: 148 },
    description: 'Dominance verte - Énergie & vitalité',
  },
};

/**
 * Couleurs des tiers pour l'arbre de compétences
 * Progression de couleur basée sur la difficulté et l'avancement dans l'arbre
 * 🎮 RPG progression: Débutant → Légende
 */
export const TIER_COLORS = {
  0: rpgTheme.colors.status.active,           // #00FF94 - Vert - Débutant (Fondations)
  1: rpgTheme.colors.neon.blue,               // #4D9EFF - Bleu - Bases (Hanging, Strict Pull-ups)
  2: '#FF9800',                               // Orange - Intermédiaire (L-sit, Negatives)
  3: '#F44336',                               // Rouge - Intermédiaire+ (Chest-to-bar, Dips)
  4: rpgTheme.colors.neon.purple,             // #7B61FF - Violet - Avancé (Muscle-up Strict)
  5: '#FF5722',                               // Rouge-orange - Avancé+ (Toes-to-bar)
  6: rpgTheme.colors.neon.pink,               // #FF2E97 - Rose - Expert (Highbar Muscle-up)
  7: '#8E24AA',                               // Violet foncé - Elite (Advanced variations)
  8: '#1976D2',                               // Bleu profond - Légende (Typewriter)
  9: rpgTheme.colors.ranks.legend,            // #FFD700 - Or - Master (One-arm)
};

/**
 * Récupère la couleur d'un tier avec une couleur par défaut
 * @param {number} tier - Index du tier (0-9)
 * @param {string} fallback - Couleur par défaut si tier non trouvé
 * @returns {string} Couleur hex du tier
 */
export const getTierColor = (tier, fallback = rpgTheme.colors.neon.blue) => {
  return TIER_COLORS[tier] || fallback;
};

/**
 * Récupère la couleur prédominante d'un programme
 * @param {string} programId - ID du programme (ex: 'streetworkout', 'run10k')
 * @param {string} fallback - Couleur par défaut si programme non trouvé
 * @returns {string} Couleur hex du programme
 */
export const getProgramColor = (programId, fallback = rpgTheme.colors.neon.blue) => {
  const programData = PROGRAM_COLORS[programId?.toLowerCase?.()];
  return programData?.color || fallback;
};

/**
 * Récupère les données complètes d'un programme (couleur + infos)
 * @param {string} programId - ID du programme
 * @returns {Object|null} Objet programme ou null
 */
export const getProgramData = (programId) => {
  return PROGRAM_COLORS[programId?.toLowerCase?.()] || null;
};
