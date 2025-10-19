/**
 * Firebase Configuration - Mobile Only (React Native Firebase)
 * 
 * ⚠️ Cette configuration utilise uniquement React Native Firebase
 * Compatible: iOS et Android uniquement
 * Non compatible: Web
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Configuration automatique via google-services.json (Android) et GoogleService-Info.plist (iOS)
console.log('🔥 Firebase Native initialized via google-services.json');

/**
 * Récupère l'instance Firebase Auth
 */
export const getAuth = () => {
  return auth();
};

/**
 * Récupère l'instance Firestore
 */
export const getFirestore = () => {
  return firestore();
};

/**
 * Helper pour serverTimestamp
 */
export const serverTimestamp = () => {
  return firestore.FieldValue.serverTimestamp();
};

// Export direct des modules pour usage classique
export { auth, firestore };

// Export par défaut
export default {
  getAuth,
  getFirestore,
  serverTimestamp,
  auth,
  firestore
};
