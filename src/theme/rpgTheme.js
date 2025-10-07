// theme/rpgTheme.js
// Configuration centralisée du thème visuel RPG/Manga

export const rpgTheme = {
  // ========== COULEURS ==========
  colors: {
    // Backgrounds
    background: {
      primary: '#0A0E27',        // Noir spatial profond
      secondary: '#151B3B',      // Bleu nuit
      card: '#1A2244',           // Card background
      overlay: 'rgba(0, 0, 0, 0.6)', // Overlay dark sur images
    },
    
    // Neons & Glows
    neon: {
      blue: '#4D9EFF',           // Bleu électrique principal
      purple: '#7B61FF',         // Violet néon
      cyan: '#00E5FF',           // Cyan brillant
      green: '#00FF94',          // Vert énergie
      pink: '#FF2E97',           // Rose vif
    },
    
    // Gradients
    gradients: {
      primary: ['#4D9EFF', '#7B61FF'],        // Bleu → Violet
      xpBar: ['#4D9EFF', '#7B61FF', '#9D4EDD'], // XP bar
      cardBorder: ['#4D9EFF', '#7B61FF'],     // Bordures cartes
      cosmic: ['#0A0E27', '#1A2244', '#2D3561'], // Fond cosmique
      fire: ['#FF6B35', '#F7931E'],           // Badge "Actif"
      legendary: ['#FFD700', '#FFA500', '#FF6347'], // Légendaire
    },
    
    // Textes
    text: {
      primary: '#FFFFFF',        // Blanc pur
      secondary: '#B8C5D6',      // Gris clair
      muted: '#6B7A99',          // Gris moyen
      accent: '#4D9EFF',         // Accent bleu
    },
    
    // Stats colors
    stats: {
      strength: '#FF6B6B',       // Force = Rouge
      endurance: '#4ECDC4',      // Endurance = Cyan
      power: '#FFD93D',          // Puissance = Jaune
      speed: '#95E1D3',          // Vitesse = Vert clair
      flexibility: '#C77DFF',    // Souplesse = Violet
    },
    
    // Status
    status: {
      active: '#00FF94',         // Actif
      locked: '#6B7A99',         // Verrouillé
      completed: '#FFD700',      // Complété
      inProgress: '#4D9EFF',     // En cours
    },
    
    // Ranks (badges)
    ranks: {
      beginner: '#9E9E9E',       // Débutant = Gris
      warrior: '#4D9EFF',        // Guerrier = Bleu
      champion: '#7B61FF',       // Champion = Violet
      master: '#FF2E97',         // Maître = Rose
      legend: '#FFD700',         // Légende = Or
    }
  },
  
  // ========== TYPOGRAPHIE ==========
  typography: {
    fonts: {
      heading: 'System',         // À remplacer par font custom si besoin
      body: 'System',
      mono: 'Courier',           // Pour les stats/nombres
    },
    
    sizes: {
      title: 28,                 // Titres principaux
      heading: 22,               // H1
      subheading: 18,            // H2
      body: 16,                  // Texte normal
      caption: 14,               // Sous-textes
      small: 12,                 // Petits labels
    },
    
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800',
    }
  },
  
  // ========== SPACING ==========
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // ========== BORDER RADIUS ==========
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,                  // Pour avatars circulaires
  },
  
  // ========== SHADOWS & GLOWS ==========
  effects: {
    shadows: {
      card: {
        shadowColor: '#4D9EFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
      glow: {
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
      },
      heavy: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      }
    },
    
    // Overlays
    overlays: {
      dark: 'rgba(0, 0, 0, 0.6)',
      medium: 'rgba(0, 0, 0, 0.4)',
      light: 'rgba(0, 0, 0, 0.2)',
      cosmic: 'rgba(10, 14, 39, 0.8)',
    }
  },
  
  // ========== ANIMATIONS ==========
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    
    easing: {
      default: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },
  
  // ========== ICONS ==========
  icons: {
    stats: {
      strength: '💪',
      endurance: '🫀',
      power: '⚡',
      speed: '🚀',
      flexibility: '🤸',
    },
    
    ranks: {
      beginner: '🌱',
      warrior: '⚔️',
      champion: '🏆',
      master: '👑',
      legend: '⭐',
    },
    
    status: {
      active: '🔥',
      locked: '🔒',
      completed: '✅',
    }
  },
};

// ========== COMPONENTS STYLES ==========
// Note: Ces styles utilisent les valeurs du thème ci-dessus
export const componentStyles = {
  // Card standard
  card: {
    backgroundColor: rpgTheme.colors.background.card,
    borderRadius: rpgTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue,
    padding: rpgTheme.spacing.md,
    ...rpgTheme.effects.shadows.card,
  },
  
  // Button primary
  buttonPrimary: {
    backgroundColor: rpgTheme.colors.neon.blue,
    borderRadius: rpgTheme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...rpgTheme.effects.shadows.glow,
  },
  
  // XP Bar
  xpBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: rpgTheme.colors.background.card,
    overflow: 'hidden',
  },
  
  // Avatar border
  avatarBorder: {
    borderWidth: 3,
    borderRadius: rpgTheme.borderRadius.full,
    borderColor: rpgTheme.colors.neon.blue,
    padding: 4,
  },
  
  // Badge
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: rpgTheme.borderRadius.md,
    backgroundColor: 'rgba(77, 158, 255, 0.2)',
  }
};

// ========== HELPERS ==========

/**
 * Créer une configuration pour gradient linéaire
 * Compatible avec react-native-linear-gradient
 */
export const createLinearGradient = (colors, direction = 'horizontal') => {
  const directions = {
    horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
    vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
    diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  };
  
  return {
    colors: colors,
    ...directions[direction],
  };
};

/**
 * Obtenir la couleur d'une stat
 */
export const getStatColor = (statName) => {
  const statMap = {
    strength: rpgTheme.colors.stats.strength,
    endurance: rpgTheme.colors.stats.endurance,
    power: rpgTheme.colors.stats.power,
    speed: rpgTheme.colors.stats.speed,
    flexibility: rpgTheme.colors.stats.flexibility,
  };
  
  return statMap[statName.toLowerCase()] || rpgTheme.colors.text.secondary;
};

/**
 * Obtenir la couleur du rank
 */
export const getRankColor = (rank) => {
  const rankMap = {
    beginner: rpgTheme.colors.ranks.beginner,
    débutant: rpgTheme.colors.ranks.beginner,
    warrior: rpgTheme.colors.ranks.warrior,
    guerrier: rpgTheme.colors.ranks.warrior,
    champion: rpgTheme.colors.ranks.champion,
    master: rpgTheme.colors.ranks.master,
    maître: rpgTheme.colors.ranks.master,
    legend: rpgTheme.colors.ranks.legend,
    légende: rpgTheme.colors.ranks.legend,
  };
  
  return rankMap[rank.toLowerCase()] || rpgTheme.colors.ranks.beginner;
};

/**
 * Obtenir l'icône d'une stat
 */
export const getStatIcon = (statName) => {
  const iconMap = {
    strength: rpgTheme.icons.stats.strength,
    force: rpgTheme.icons.stats.strength,
    endurance: rpgTheme.icons.stats.endurance,
    power: rpgTheme.icons.stats.power,
    puissance: rpgTheme.icons.stats.power,
    speed: rpgTheme.icons.stats.speed,
    vitesse: rpgTheme.icons.stats.speed,
    flexibility: rpgTheme.icons.stats.flexibility,
    souplesse: rpgTheme.icons.stats.flexibility,
  };
  
  return iconMap[statName.toLowerCase()] || '📊';
};

/**
 * Obtenir l'icône du rank
 */
export const getRankIcon = (rank) => {
  const iconMap = {
    beginner: rpgTheme.icons.ranks.beginner,
    débutant: rpgTheme.icons.ranks.beginner,
    warrior: rpgTheme.icons.ranks.warrior,
    guerrier: rpgTheme.icons.ranks.warrior,
    champion: rpgTheme.icons.ranks.champion,
    master: rpgTheme.icons.ranks.master,
    maître: rpgTheme.icons.ranks.master,
    legend: rpgTheme.icons.ranks.legend,
    légende: rpgTheme.icons.ranks.legend,
  };
  
  return iconMap[rank.toLowerCase()] || rpgTheme.icons.ranks.beginner;
};

/**
 * Ajouter de la transparence à une couleur hex
 */
export const addAlpha = (hexColor, opacity) => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hexColor}${alpha}`;
};

export default rpgTheme;
