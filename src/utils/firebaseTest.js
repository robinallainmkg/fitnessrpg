// Utilitaire de test Firebase
import { auth, db } from '../services/firebase';

export const testFirebaseConnection = () => {
  console.log('=== Test Firebase ===');
  console.log('Auth instance:', auth ? '✅ OK' : '❌ Non disponible');
  console.log('Firestore instance:', db ? '✅ OK' : '❌ Non disponible');
  console.log('Current user:', auth?.currentUser ? auth.currentUser.email : 'Pas connecté');
  console.log('====================');
};
