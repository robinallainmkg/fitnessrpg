/**
 * Firebase Configuration - Ancienne API (fonctionne)
 * On reste sur l'ancienne API car la nouvelle a des problèmes sur React Native
 */

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Configuration Firebase (depuis .env)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Cache
let _firebaseInitialized = false;
let _auth = null;
let _firestore = null;

/**
 * Initialise Firebase si pas déjà fait
 */
const initializeFirebaseIfNeeded = () => {
  if (_firebaseInitialized || firebase.apps.length > 0) {
    return true;
  }

  try {
    // Sur React Native Firebase, l'app s'initialise automatiquement via google-services.json
    // Mais on peut aussi initialiser manuellement si besoin
    if (firebase.apps.length === 0) {
      console.log('🔥 Initializing Firebase...');
      // Note: React Native Firebase s'initialise normalement automatiquement
      // Si ça échoue, vérifier que google-services.json est bien présent dans android/app/
    }
    
    _firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return false;
  }
};

/**
 * Vérifie si Firebase est initialisé
 */
export const isFirebaseInitialized = () => {
  return _firebaseInitialized || firebase.apps.length > 0;
};

/**
 * Récupère Firebase Auth
 * Utilise l'ancienne API qui fonctionne
 */
export const getFirebaseAuth = () => {
  if (_auth) {
    return _auth;
  }

  try {
    // S'assurer que Firebase est initialisé
    initializeFirebaseIfNeeded();
    
    // Vérifier que Firebase est initialisé
    if (firebase.apps.length === 0) {
      throw new Error('Firebase not initialized. Check google-services.json in android/app/');
    }
    
    _auth = auth();
    console.log('✅ Firebase Auth initialized');
    return _auth;
  } catch (error) {
    console.error('❌ Firebase Auth initialization error:', error);
    throw new Error(`Firebase Auth initialization failed: ${error.message}`);
  }
};

/**
 * Récupère Firestore
 * Utilise l'ancienne API qui fonctionne
 */
export const getFirebaseFirestore = () => {
  if (_firestore) {
    return _firestore;
  }

  try {
    // S'assurer que Firebase est initialisé
    initializeFirebaseIfNeeded();
    
    // Vérifier que Firebase est initialisé
    if (firebase.apps.length === 0) {
      throw new Error('Firebase not initialized. Check google-services.json in android/app/');
    }

    _firestore = firestore();
    
    // 🔥 FORCER LE NETTOYAGE DU CACHE CORROMPU (Nothing Phone)
    // Le cache offline peut bloquer les writes sur certains devices
    try {
      // Désactiver la persistence (ne marche que AVANT première utilisation)
      _firestore.settings({
        persistence: false,
        cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
      });
      console.log('✅ Firestore initialized (persistence: disabled)');
    } catch (settingsError) {
      // Si settings() échoue, continuer quand même
      console.warn('⚠️  Could not configure Firestore:', settingsError.message);
      console.log('✅ Firestore initialized (default config)');
    }
    
    return _firestore;
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
    throw new Error(`Firestore initialization failed: ${error.message}`);
  }
};

/**
 * Récupère Firebase de manière sûre
 */
export const getFirebaseSafe = (isGuest) => {
  if (isGuest) {
    console.log('👤 Mode invité - Firebase non requis');
    return null;
  }

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
 * Reset cache
 */
export const resetFirebaseCache = () => {
  console.log('🔄 Reset cache Firebase');
  _auth = null;
  _firestore = null;
};

console.log('📦 Firebase Config chargé');

export default {
  getAuth: getFirebaseAuth,
  getFirestore: getFirebaseFirestore,
  isInitialized: isFirebaseInitialized,
  getSafe: getFirebaseSafe,
  resetCache: resetFirebaseCache
};