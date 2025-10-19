/**
 * 🎨 Design System Configuration
 * 
 * Configuration centralisée pour toutes les valeurs de design
 * Facilite les futures modifications sans refactoriser le code entier
 */

import { rpgTheme } from './rpgTheme';

/**
 * Configuration des composants
 */
export const componentConfig = {
  // ════════════ WorkoutCard ════════════
  workoutCard: {
    container: {
      marginHorizontal: rpgTheme.spacing.md,
      marginBottom: rpgTheme.spacing.md,
    },
    card: {
      borderRadius: rpgTheme.borderRadius.lg,
      padding: rpgTheme.spacing.md,
      gap: rpgTheme.spacing.md,
      borderWidth: 2,
      minHeight: 240,
    },
    title: {
      fontSize: 18,
      fontWeight: rpgTheme.typography.weights.bold,
    },
    subTitle: {
      fontSize: 12,
      fontWeight: rpgTheme.typography.weights.medium,
    },
  },

  // ════════════ ProgramCard ════════════
  programCard: {
    container: {
      marginHorizontal: rpgTheme.spacing.md,
      marginBottom: rpgTheme.spacing.md,
    },
    card: {
      borderRadius: rpgTheme.borderRadius.lg,
      padding: rpgTheme.spacing.md,
      minHeight: 180,
      borderWidth: 1.5,
    },
    title: {
      fontSize: 18,
      fontWeight: rpgTheme.typography.weights.semibold,
    },
    progressBarHeight: 6,
  },

  // ════════════ ActionButton ════════════
  actionButton: {
    borderRadius: rpgTheme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowRadius: 8,
  },

  // ════════════ OutlineButton ════════════
  outlineButton: {
    borderRadius: rpgTheme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
  },

  // ════════════ Badges ════════════
  badges: {
    borderRadius: rpgTheme.borderRadius.md,
    defaultPadding: {
      vertical: 8,
      horizontal: 12,
    },
  },
};

/**
 * Configuration des états
 */
export const stateConfig = {
  disabled: {
    opacity: 0.6,
    backgroundColor: '#4A5568',
  },
  active: {
    opacity: 1,
  },
  pressed: {
    opacity: 0.85,
  },
};

/**
 * Configuration des animations
 */
export const animationConfig = {
  buttonPress: {
    duration: rpgTheme.animations.duration.fast,
    easing: rpgTheme.animations.easing.default,
  },
  cardHover: {
    duration: rpgTheme.animations.duration.normal,
  },
};

/**
 * Configuration des couleurs par statut
 */
export const statusColorConfig = {
  active: {
    bg: 'rgba(0, 255, 148, 0.15)',
    border: rpgTheme.colors.status.active,
    text: rpgTheme.colors.status.active,
  },
  completed: {
    bg: 'rgba(255, 215, 0, 0.15)',
    border: rpgTheme.colors.status.completed,
    text: rpgTheme.colors.status.completed,
  },
  locked: {
    bg: 'rgba(107, 122, 153, 0.15)',
    border: rpgTheme.colors.status.locked,
    text: rpgTheme.colors.status.locked,
  },
  inProgress: {
    bg: 'rgba(77, 158, 255, 0.15)',
    border: rpgTheme.colors.status.inProgress,
    text: rpgTheme.colors.status.inProgress,
  },
};

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

export default {
  componentConfig,
  stateConfig,
  animationConfig,
  statusColorConfig,
  breakpoints,
};
