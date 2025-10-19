/**
 * Firebase Configuration - Modern API (v22+)
 * 
 * LAZY INITIALIZATION:
 * - Firebase s'initialise UNIQUEMENT quand nécessaire
 * - Pas d'initialisation au démarrage en guest mode
 * - Utilise l'API modulaire moderne (getApp, getAuth, getFirestore)
 */

import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// Cache pour éviter les réinitialisations multiples
let _firebaseApp = null;
let _auth = null;
let _firestore = null;

/**
 * Récupère l'instance Firebase App de manière lazy
 * S'initialise automatiquement via google-services.json (Android) ou GoogleService-Info.plist (iOS)
 * @returns {FirebaseApp} Instance Firebase
 * @throws {Error} Si l'initialisation échoue
 */
export const getFirebaseApp = () => {
  if (_firebaseApp) {
    return _firebaseApp;
  }

  try {
    const apps = getApps();
    
    if (apps.length === 0) {
      // Premier appel - Firebase s'initialise via config natifs
      console.log('🔥 Initialisation Firebase App...');
      
      // ⚠️ IMPORTANT: React Native Firebase s'initialise automatiquement
      // Il lit google-services.json (Android) ou GoogleService-Info.plist (iOS)
      _firebaseApp = initializeApp();
      
      console.log('✅ Firebase App initialized');
    } else {
      // App déjà initialisée
      _firebaseApp = getApp();
      console.log('✅ Firebase App déjà initialisée');
    }
    
    return _firebaseApp;
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase App:', error);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
};

/**
 * Récupère l'instance Firebase Auth de manière lazy
 * À utiliser UNIQUEMENT en mode authentifié (pas en guest mode)
 * @returns {Auth} Instance Firebase Auth
 * @throws {Error} Si l'initialisation échoue
 */
export const getFirebaseAuth = () => {
  if (_auth) {
    return _auth;
  }

  try {
    // S'assurer que l'app est initialisée d'abord
    const app = getFirebaseApp();
    
    // Obtenir Auth à partir de l'app
    _auth = getAuth(app);
    console.log('✅ Firebase Auth initialisé');
    return _auth;
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase Auth:', error);
    throw new Error(`Firebase Auth initialization failed: ${error.message}`);
  }
};

/**
 * Récupère l'instance Firestore de manière lazy
 * À utiliser UNIQUEMENT en mode authentifié (pas en guest mode)
 * 
 * Note: La persistence offline est AUTOMATIQUE dans React Native Firebase
 * Pas besoin de configuration supplémentaire
 * 
 * @returns {Firestore} Instance Firestore
 * @throws {Error} Si l'initialisation échoue
 */
export const getFirebaseFirestore = () => {
  if (_firestore) {
    return _firestore;
  }

  try {
    // S'assurer que l'app est initialisée d'abord
    const app = getFirebaseApp();
    
    // Obtenir Firestore à partir de l'app
    _firestore = getFirestore(app);
    
    console.log('✅ Firestore initialisé (offline persistence auto)');
    return _firestore;
  } catch (error) {
    console.error('❌ Erreur initialisation Firestore:', error);
    throw new Error(`Firestore initialization failed: ${error.message}`);
  }
};

/**
 * Vérifie si Firebase est disponible (sans l'initialiser)
 * Utile pour les guards conditionnels
 * @returns {boolean} True si Firebase est déjà initialisé
 */
export const isFirebaseInitialized = () => {
  return getApps().length > 0;
};

/**
 * Récupère Firebase de manière sûre (avec gestion d'erreur)
 * Retourne null en guest mode ou si Firebase n'est pas disponible
 * 
 * NOTE: Ce n'est PAS un hook React, juste une fonction helper
 * À utiliser dans vos composants avec un vrai hook si nécessaire
 * 
 * @param {boolean} isGuest - Si l'utilisateur est en mode invité
 * @returns {Object|null} { auth, firestore } ou null
 */
export const getFirebaseSafe = (isGuest) => {
  // En mode guest, pas de Firebase
  if (isGuest) {
    console.log('👤 Mode invité - Firebase non requis');
    return null;
  }

  // Tentative de récupération Firebase
  try {
    return {
      auth: getFirebaseAuth(),
      firestore: getFirebaseFirestore()
    };
  } catch (error) {
    console.warn('⚠️ Firebase non disponible:', error.message);
    return null;
  }
};

/**
 * Réinitialise le cache Firebase (pour tests ou logout complet)
 * ⚠️ À utiliser avec précaution
 */
export const resetFirebaseCache = () => {
  console.log('🔄 Reset cache Firebase');
  _firebaseApp = null;
  _auth = null;
  _firestore = null;
};

console.log('📦 Firebase Config chargé (lazy init ready)');

// Export par défaut pour compatibilité
export default {
  getApp: getFirebaseApp,
  getAuth: getFirebaseAuth,
  getFirestore: getFirebaseFirestore,
  isInitialized: isFirebaseInitialized,
  getSafe: getFirebaseSafe,
  resetCache: resetFirebaseCache
};