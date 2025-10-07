export const colors = {
  primary: '#6C63FF',
  secondary: '#03DAC6',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',
  text: '#FFFFFF',
  textPrimary: '#FFFFFF', // Alias pour compatibilité
  textSecondary: '#B0B0B0',
  border: '#3A3A3A',
  accent: '#6C63FF' // Alias pour primary
};

/**
 * Couleurs des tiers pour l'arbre de compétences
 * Progression de couleur basée sur la difficulté et l'avancement dans l'arbre
 */
export const TIER_COLORS = {
  0: '#4CAF50',   // Vert - Débutant (Fondations)
  1: '#2196F3',   // Bleu - Bases (Hanging, Strict Pull-ups)
  2: '#FF9800',   // Orange - Intermédiaire (L-sit, Negatives)
  3: '#F44336',   // Rouge - Intermédiaire+ (Chest-to-bar, Dips)
  4: '#9C27B0',   // Violet - Avancé (Muscle-up Strict, L-sit Pullups)
  5: '#FF5722',   // Rouge-orange - Avancé+ (Toes-to-bar, Front Lever)
  6: '#E91E63',   // Rose - Expert (Highbar Muscle-up, Back Lever)
  7: '#8E24AA',   // Violet foncé - Elite (Advanced variations)
  8: '#1976D2',   // Bleu profond - Légende (Typewriter, Hefesto)
  9: '#FFD700'    // Or - Master (One-arm, Master Street)
};

/**
 * Récupère la couleur d'un tier avec une couleur par défaut
 */
export const getTierColor = (tier, fallback = '#6C63FF') => {
  return TIER_COLORS[tier] || fallback;
};
