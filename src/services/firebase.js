// COMPATIBILITÉ TEMPORAIRE - Réexporte React Native Firebase
// TODO: Migrer progressivement tous les imports vers @react-native-firebase directement

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Export pour compatibilité avec l'ancien code
export const db = firestore();

// Exports nommés compatibles
export { auth, firestore };

console.log('🔥 Firebase bridge: React Native Firebase actif');
