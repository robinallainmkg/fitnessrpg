import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAokpSG0MrYQVWYWXDQCOtVjM10ilYZRBA",
  authDomain: "hybridrpg-53f62.firebaseapp.com",
  projectId: "hybridrpg-53f62",
  storageBucket: "hybridrpg-53f62.appspot.com",
  messagingSenderId: "195554523219",
  appId: "1:195554523219:web:04e0abb1ecbdd38c926ea6"
};

// Initialiser Firebase une seule fois
let app;
let auth;
let db;

if (getApps().length === 0) {
  // Première initialisation
  app = initializeApp(firebaseConfig);
  
  // Initialiser Auth avec persistance pour React Native
  if (Platform.OS !== 'web') {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } else {
    auth = getAuth(app);
  }
  
  // Initialiser Firestore
  db = getFirestore(app);
  
  console.log('🔥 Firebase initialisé avec succès');
  console.log('📱 Platform:', Platform.OS);
  console.log('🔐 Auth:', auth ? 'OK' : 'KO');
  console.log('🗄️ Firestore:', db ? 'OK' : 'KO');
} else {
  // Firebase déjà initialisé
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('🔥 Firebase déjà initialisé');
}

// Exporter les services
export { auth, db };
export default app;
