/**
 * Logger de développement avec emojis et couleurs
 * Usage: import { logger } from './debugHelper';
 */

const isDev = __DEV__;

// Couleurs et emojis par catégorie
const categories = {
  auth: { emoji: '🔐', color: '#4CAF50', name: 'AUTH' },
  firestore: { emoji: '🔥', color: '#FF9800', name: 'FIRESTORE' },
  workout: { emoji: '💪', color: '#2196F3', name: 'WORKOUT' },
  navigation: { emoji: '🧭', color: '#9C27B0', name: 'NAV' },
  api: { emoji: '🌐', color: '#00BCD4', name: 'API' },
  cache: { emoji: '💾', color: '#607D8B', name: 'CACHE' },
  perf: { emoji: '⚡', color: '#FFC107', name: 'PERF' },
  ui: { emoji: '🎨', color: '#E91E63', name: 'UI' },
  error: { emoji: '🔴', color: '#F44336', name: 'ERROR' },
  warning: { emoji: '🟡', color: '#FF9800', name: 'WARNING' },
  success: { emoji: '🟢', color: '#4CAF50', name: 'SUCCESS' },
  debug: { emoji: '🔵', color: '#2196F3', name: 'DEBUG' },
};

class Logger {
  constructor() {
    this.timers = new Map();
    this.counters = new Map();
  }

  /**
   * Log général
   */
  log(category, message, data = null) {
    if (!isDev) return;
    
    const cat = categories[category] || categories.debug;
    const prefix = `${cat.emoji} [${cat.name}]`;
    
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Log d'authentification
   */
  auth(message, data) {
    this.log('auth', message, data);
  }

  /**
   * Log Firestore
   */
  firestore(message, data) {
    this.log('firestore', message, data);
  }

  /**
   * Log workout
   */
  workout(message, data) {
    this.log('workout', message, data);
  }

  /**
   * Log navigation
   */
  nav(message, data) {
    this.log('navigation', message, data);
  }

  /**
   * Log API
   */
  api(message, data) {
    this.log('api', message, data);
  }

  /**
   * Log erreur
   */
  error(message, error) {
    if (!isDev) {
      // En production, on pourrait envoyer à Crashlytics ici
      return;
    }
    
    const cat = categories.error;
    console.error(`${cat.emoji} [${cat.name}]`, message);
    
    if (error) {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
    }
  }

  /**
   * Log warning
   */
  warn(message, data) {
    if (!isDev) return;
    
    const cat = categories.warning;
    console.warn(`${cat.emoji} [${cat.name}]`, message, data || '');
  }

  /**
   * Log succès
   */
  success(message, data) {
    this.log('success', message, data);
  }

  /**
   * Mesurer la performance d'une opération
   */
  startTimer(label) {
    if (!isDev) return;
    
    this.timers.set(label, Date.now());
    console.log(`⏱️ [TIMER] Started: ${label}`);
  }

  /**
   * Arrêter le timer et afficher le temps
   */
  endTimer(label) {
    if (!isDev) return;
    
    const startTime = this.timers.get(label);
    if (!startTime) {
      this.warn(`Timer "${label}" not found`);
      return;
    }
    
    const duration = Date.now() - startTime;
    const cat = categories.perf;
    console.log(`${cat.emoji} [${cat.name}] ${label}: ${duration}ms`);
    
    this.timers.delete(label);
    return duration;
  }

  /**
   * Compter les occurrences
   */
  count(label) {
    if (!isDev) return;
    
    const current = this.counters.get(label) || 0;
    const newCount = current + 1;
    this.counters.set(label, newCount);
    
    console.log(`🔢 [COUNT] ${label}: ${newCount}`);
    return newCount;
  }

  /**
   * Reset un compteur
   */
  resetCount(label) {
    this.counters.delete(label);
  }

  /**
   * Afficher un objet de manière lisible
   */
  inspect(label, obj) {
    if (!isDev) return;
    
    console.log(`🔍 [INSPECT] ${label}:`);
    console.log(JSON.stringify(obj, null, 2));
  }

  /**
   * Logger une section (début)
   */
  section(title) {
    if (!isDev) return;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📦 ${title}`);
    console.log('='.repeat(50));
  }

  /**
   * Divider visuel
   */
  divider() {
    if (!isDev) return;
    console.log('-'.repeat(50));
  }

  /**
   * Table pour afficher des données structurées
   */
  table(data) {
    if (!isDev) return;
    console.table(data);
  }

  /**
   * Group logs
   */
  group(label) {
    if (!isDev) return;
    console.group(`📁 ${label}`);
  }

  groupEnd() {
    if (!isDev) return;
    console.groupEnd();
  }
}

// Instance singleton
export const logger = new Logger();

/**
 * Wrapper pour logger les appels de fonction
 * Usage: 
 * 
 * const myFunction = logFunction('myFunction', async (param) => {
 *   // code
 * });
 */
export const logFunction = (name, fn) => {
  return async (...args) => {
    logger.debug(`Calling ${name}`, { args });
    
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      logger.success(`${name} completed in ${duration}ms`, { result });
      return result;
    } catch (error) {
      logger.error(`${name} failed`, error);
      throw error;
    }
  };
};

/**
 * HOC pour logger le cycle de vie d'un composant
 */
export const withLogger = (Component, componentName) => {
  return (props) => {
    React.useEffect(() => {
      logger.ui(`${componentName} mounted`);
      return () => {
        logger.ui(`${componentName} unmounted`);
      };
    }, []);

    logger.ui(`${componentName} rendered`);
    return <Component {...props} />;
  };
};

/**
 * Hook pour logger les changements de state
 */
export const useLogState = (stateName, stateValue) => {
  React.useEffect(() => {
    logger.debug(`State "${stateName}" changed:`, stateValue);
  }, [stateName, stateValue]);
};

/**
 * Debugger Firestore
 */
export const logFirestoreOperation = (operation, collection, docId = null) => {
  const id = docId ? `${collection}/${docId}` : collection;
  logger.firestore(`${operation}: ${id}`);
};

/**
 * Debugger Navigation
 */
export const logNavigation = (from, to, params = null) => {
  logger.nav(`${from} → ${to}`, params);
};

export default logger;
