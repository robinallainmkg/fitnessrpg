import { initializeApp } from 'firebase/app';
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

// Initialiser l'app Firebase
const app = initializeApp(firebaseConfig);

// CRITIQUE : Initialiser Auth avec persistence AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialisé avec persistence AsyncStorage');
} catch (error) {
  console.warn('⚠️ Auth déjà initialisé, utilisation de getAuth()');
  // Fallback si déjà initialisé (lors de hot reload)
  auth = getAuth(app);
}

// Initialiser Firestore
const db = getFirestore(app);

console.log('🔥 Firebase Services initialisés');

export { auth, db };
export default app;
