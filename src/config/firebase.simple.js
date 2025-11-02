/**
 * ═══════════════════════════════════════════════════════════
 * FIREBASE CONFIGURATION - VERSION SIMPLIFIÉE
 * ═══════════════════════════════════════════════════════════
 * 
 * UN SEUL POINT D'ENTRÉE pour Firebase dans toute l'app.
 * Pas de wrappers, pas de cache custom, juste la config essentielle.
 * 
 * RÈGLE D'OR: Tous les fichiers doivent importer depuis ICI.
 */

import authModule from '@react-native-firebase/auth';
import firestoreModule from '@react-native-firebase/firestore';

// ═══ INSTANCES GLOBALES (créées une seule fois) ═══
let authInstance = null;
let firestoreInstance = null;

/**
 * Initialise Auth (singleton)
 */
const initAuth = () => {
  if (authInstance) {
    return authInstance;
  }
  
  console.log('🔐 Initialisation Firebase Auth...');
  authInstance = authModule();
  
  console.log('✅ Firebase Auth ready');
  
  return authInstance;
};

/**
 * Initialise Firestore avec la config optimale
 */
const initFirestore = () => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  console.log('🔥 Initialisation Firestore...');
  
  firestoreInstance = firestoreModule();
  
  // ⚠️ CRITIQUE: Désactiver la persistence AVANT toute utilisation
  // Sans ça, le Nothing Phone corrompt le cache et TOUT timeout
  try {
    firestoreInstance.settings({
      persistence: false, // ← FIX pour Nothing Phone
      cacheSizeBytes: firestoreModule.CACHE_SIZE_UNLIMITED
    });
    console.log('✅ Firestore configured: persistence=false (Nothing Phone fix)');
  } catch (error) {
    // Si déjà utilisé, on ne peut plus changer les settings
    console.warn('⚠️ Firestore settings already applied:', error.message);
  }
  
  return firestoreInstance;
};

/**
 * Exports publics - Retournent les instances singleton
 */
export const getAuth = () => initAuth();
export const getFirestore = () => initFirestore();

// Pour les FieldValue, Timestamp et autres classes statiques Firebase
export const FieldValue = firestoreModule.FieldValue;
export const Timestamp = firestoreModule.Timestamp;

// PhoneAuthProvider depuis le module auth (pas l'instance)
export const PhoneAuthProvider = authModule.PhoneAuthProvider;

console.log('📦 Firebase simple config loaded');
