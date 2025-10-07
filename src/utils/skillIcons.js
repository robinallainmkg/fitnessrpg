import * as LucideIcons from 'lucide-react-native';

/**
 * Mapping complet des programmes vers leurs icônes Lucide
 * 
 * Chaque programme Street Workout a une icône spécifique qui représente
 * son essence et sa difficulté dans la progression.
 */
export const ICON_MAP = {
  // Tier 0-1: Fondations débutant
  'beginner-foundation': 'Sprout',        // 🌱 Germination/début
  'hanging-hollow': 'Target',             // 🎯 Précision/contrôle
  'strict-pullups': 'Dumbbell',           // 🏋️ Force basique
  
  // Tier 2-3: Bases intermédiaires
  'lsit-hold': 'Triangle',                // △ Géométrie du L-sit
  'pullup-negatives': 'ArrowDown',        // ⬇️ Descente contrôlée
  'chest-to-bar': 'Crosshair',            // ⊕ Précision haute
  'straight-bar-dips': 'Flame',           // 🔥 Intensité/puissance
  'hanging-leg-raises': 'MoveVertical',   // ⬍ Mouvement vertical
  
  // Tier 4-5: Avancé
  'muscleup-strict': 'Zap',               // ⚡ Puissance explosive
  'lsit-pullups': 'Layers',               // ≡ Combinaison de skills
  'toes-to-bar': 'Activity',              // 📊 Mouvement dynamique
  'front-lever-beginner': 'Shield',       // 🛡️ Force statique
  'explosive-pullups': 'Sparkles',        // ✨ Explosivité brillante
  
  // Tier 6-7: Expert
  'highbar-muscleup': 'Rocket',           // 🚀 Élévation technique
  'muscleup-advanced': 'Zap',             // ⚡ Double puissance
  'front-lever-advanced': 'ShieldAlert',  // 🛡️⚠️ Force ultime
  'back-lever': 'RotateCcw',              // ↻ Rotation/inversion
  'archer-pullups': 'Target',             // 🎯 Précision unilatérale
  
  // Tier 8-9: Légende/Master
  'typewriter-pullups': 'Wind',           // 🌬️ Fluidité latérale
  'hefesto': 'Crown',                     // 👑 Royauté mythique
  'one-arm-pullup': 'Gem',                // 💎 Rareté absolue
  'master-street': 'Trophy',              // 🏆 Victoire finale
};

/**
 * Icônes spéciales pour les états
 */
export const STATE_ICONS = {
  locked: 'Lock',        // 🔒 Verrouillé
  completed: 'Star',     // ⭐ Complété (optionnel)
  available: 'Unlock',   // 🔓 Disponible (optionnel)
};

/**
 * Récupère le composant d'icône Lucide pour un programme donné
 * 
 * @param {string} programId - L'ID du programme
 * @param {string} fallback - Icône par défaut si le mapping n'existe pas
 * @returns {React.Component} Le composant d'icône Lucide
 * 
 * @example
 * const IconComponent = getSkillIcon('beginner-foundation');
 * <IconComponent size={32} color="#FFFFFF" strokeWidth={2.5} />
 */
export const getSkillIcon = (programId, fallback = 'Lock') => {
  const iconName = ICON_MAP[programId] || fallback;
  const IconComponent = LucideIcons[iconName];
  
  if (!IconComponent) {
    console.warn(`⚠️ Icône "${iconName}" non trouvée pour "${programId}". Utilisation de l'icône de secours.`);
    return LucideIcons[fallback] || LucideIcons.Lock;
  }
  
  return IconComponent;
};

/**
 * Récupère une icône d'état (locked, completed, available)
 * 
 * @param {string} state - L'état souhaité
 * @returns {React.Component} Le composant d'icône Lucide
 */
export const getStateIcon = (state) => {
  const iconName = STATE_ICONS[state] || STATE_ICONS.locked;
  return LucideIcons[iconName] || LucideIcons.Lock;
};
