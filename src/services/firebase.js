import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase depuis .env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Défini' : '❌ Manquant',
  projectId: firebaseConfig.projectId ? '✅ Défini' : '❌ Manquant',
  authDomain: firebaseConfig.authDomain ? '✅ Défini' : '❌ Manquant',
});

// Initialiser l'app Firebase (singleton pattern)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialisé');
} else {
  app = getApp();
  console.log('ℹ️ Firebase App déjà initialisé, réutilisation');
}

// CRITIQUE : Initialiser Auth avec persistence AsyncStorage (singleton pattern)
let auth;
try {
  // Essayer d'initialiser avec persistence en premier
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialisé avec persistence AsyncStorage');
} catch (error) {
  // Si erreur (déjà initialisé), récupérer l'instance existante
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('ℹ️ Firebase Auth déjà initialisé, réutilisation de l\'instance existante');
  } else {
    console.error('❌ Erreur critique initialisation Firebase Auth:', error);
    // Dernier recours : essayer getAuth sans persistence
    try {
      auth = getAuth(app);
      console.warn('⚠️ Firebase Auth initialisé en mode fallback (sans persistence)');
    } catch (fallbackError) {
      console.error('❌ Impossible d\'initialiser Firebase Auth:', fallbackError);
      throw fallbackError;
    }
  }
}

// Initialiser Firestore
const db = getFirestore(app);

console.log('🔥 Firebase Services initialisés');

export { auth, db };
export default app;
