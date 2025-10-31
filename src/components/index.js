/**
 * 🎮 Components Index - Point d'entrée centralisé pour tous les composants
 * 
 * Importer depuis:
 * import { WorkoutCard, ProgramCard, ActionButton, StatBadge } from '../components';
 */

// 🎴 Cards
export { default as WorkoutCard } from './cards/WorkoutCard';
export { default as ProgramCard } from './cards/ProgramCard';

// 🎯 Buttons
export { default as ActionButton } from './buttons/ActionButton';
export { default as OutlineButton } from './buttons/OutlineButton';

// 🏷️ Badges
export { default as StatBadge } from './badges/StatBadge';
export { default as StatusBadge } from './badges/StatusBadge';

// 🔐 Auth
export { default as AuthModal } from './AuthModal';

// � Sub-export all organized exports for granular imports if needed
export * from './cards';
export * from './buttons';
export * from './badges';
