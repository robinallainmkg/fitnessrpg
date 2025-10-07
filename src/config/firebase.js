import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Enable offline persistence
try {
  firestore().settings({
    persistence: true,
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  });
  console.log('✅ Firestore offline persistence enabled');
} catch (error) {
  console.warn('⚠️ Could not enable Firestore persistence:', error);
}

console.log('🔥 React Native Firebase initialisé');

export { auth, firestore };
