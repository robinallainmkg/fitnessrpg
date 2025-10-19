/**
 * Firebase Configuration - Multi-plateforme
 * Gère automatiquement React Native (iOS/Android) et Web
 */

import { Platform } from 'react-native';

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
let _isWeb = Platform.OS === 'web';

console.log(`🔥 Firebase config loading for platform: ${Platform.OS}`);

/**
 * Initialise Firebase selon la plateforme
 */
const initializeFirebaseIfNeeded = async () => {
  if (_firebaseInitialized) {
    return true;
  }

  try {
    if (_isWeb) {
      // WEB: Utiliser Firebase Web SDK
      console.log('🌐 Initializing Firebase for Web...');
      const { initializeApp, getApps } = await import('firebase/app');
      
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
      
      _firebaseInitialized = true;
      console.log('✅ Firebase Web initialized');
      return true;
    } else {
      // NATIVE (iOS/Android): Utiliser React Native Firebase
      console.log('📱 Firebase Native auto-initializes via google-services.json');
      const firebase = await import('@react-native-firebase/app');
      
      if (firebase.default.apps.length === 0) {
        console.warn('⚠️ Firebase not auto-initialized. Check google-services.json');
        return false;
      }
      
      _firebaseInitialized = true;
      console.log('✅ Firebase Native initialized');
      return true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return false;
  }
};

/**
 * Vérifie si Firebase est initialisé
 */
export const isFirebaseInitialized = () => {
  return _firebaseInitialized;
};

/**
 * Récupère Firebase Auth (avec API harmonisée)
 * Retourne un objet normalisé avec les méthodes auth() compatibles
 */
export const getFirebaseAuth = async () => {
  if (_auth) {
    return _auth;
  }

  try {
    await initializeFirebaseIfNeeded();

    if (_isWeb) {
      // WEB: Firebase Web SDK (modular API)
      const { getAuth } = await import('firebase/auth');
      const authInstance = getAuth();
      
      // Wrapper pour harmoniser l'API web avec l'API native
      _auth = {
        _isWeb: true,
        _authInstance: authInstance,
        // Méthodes de l'API web avec wrapper
        createUserWithEmailAndPassword: (email, password) => 
          import('firebase/auth').then(({ createUserWithEmailAndPassword }) => 
            createUserWithEmailAndPassword(authInstance, email, password)
          ),
        signInWithEmailAndPassword: (email, password) => 
          import('firebase/auth').then(({ signInWithEmailAndPassword }) => 
            signInWithEmailAndPassword(authInstance, email, password)
          ),
        signOut: () => 
          import('firebase/auth').then(({ signOut }) => 
            signOut(authInstance)
          ),
        onAuthStateChanged: (callback) => authInstance.onAuthStateChanged(callback),
        currentUser: authInstance.currentUser,
      };
      
      console.log('✅ Firebase Auth (Web) initialized');
    } else {
      // NATIVE: React Native Firebase (namespaced API)
      const auth = await import('@react-native-firebase/auth');
      const authInstance = auth.default();
      
      // Wrapper pour harmoniser l'API native avec elle-même (pas de changement nécessaire)
      _auth = {
        _isWeb: false,
        _authInstance: authInstance,
        // Méthodes directes du namespaced API
        createUserWithEmailAndPassword: (email, password) => 
          authInstance.createUserWithEmailAndPassword(email, password),
        signInWithEmailAndPassword: (email, password) => 
          authInstance.signInWithEmailAndPassword(email, password),
        signOut: () => authInstance.signOut(),
        onAuthStateChanged: (callback) => authInstance.onAuthStateChanged(callback),
        get currentUser() {
          return authInstance.currentUser;
        },
      };
      
      console.log('✅ Firebase Auth (Native) initialized');
    }

    return _auth;
  } catch (error) {
    console.error('❌ Firebase Auth initialization error:', error);
    throw new Error(`Firebase Auth initialization failed: ${error.message}`);
  }
};

/**
 * Récupère Firestore (avec API harmonisée)
 * Retourne un objet normalisé compatible avec les deux plateformes
 */
export const getFirebaseFirestore = async () => {
  if (_firestore) {
    return _firestore;
  }

  try {
    await initializeFirebaseIfNeeded();

    if (_isWeb) {
      // WEB: Firebase Web SDK - créer un wrapper pour API compatible
      const { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } = await import('firebase/firestore');
      const firestoreInstance = getFirestore();
      
      // Wrapper pour rendre l'API compatible avec React Native Firebase
      _firestore = {
        _isWeb: true,
        _instance: firestoreInstance,
        
        // Méthode collection() compatible
        collection: (collectionPath) => {
          const colRef = collection(firestoreInstance, collectionPath);
          return {
            doc: (docId) => {
              const docRef = doc(firestoreInstance, collectionPath, docId);
              return {
                get: () => getDoc(docRef).then(snap => ({
                  exists: snap.exists(),
                  id: snap.id,
                  data: () => snap.data(),
                  ref: docRef
                })),
                set: (data) => setDoc(docRef, data),
                update: (data) => updateDoc(docRef, data),
                delete: () => deleteDoc(docRef)
              };
            },
            get: () => getDocs(colRef).then(snap => ({
              docs: snap.docs.map(d => ({
                id: d.id,
                data: () => d.data(),
                exists: d.exists(),
                ref: d.ref
              })),
              empty: snap.empty,
              size: snap.size
            })),
            where: (...args) => query(colRef, where(...args)),
            orderBy: (...args) => query(colRef, orderBy(...args)),
            limit: (limitNum) => query(colRef, limit(limitNum))
          };
        }
      };
      
      console.log('✅ Firestore (Web) initialized');
    } else {
      // NATIVE: React Native Firebase
      const firestore = await import('@react-native-firebase/firestore');
      _firestore = firestore.default();
      
      // Désactiver persistence offline sur native
      try {
        _firestore.settings({
          persistence: false,
          cacheSizeBytes: firestore.default.CACHE_SIZE_UNLIMITED
        });
        console.log('✅ Firestore (Native) initialized (persistence: disabled)');
      } catch (settingsError) {
        console.warn('⚠️ Could not configure Firestore:', settingsError.message);
        console.log('✅ Firestore (Native) initialized (default config)');
      }
    }

    return _firestore;
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
    throw new Error(`Firestore initialization failed: ${error.message}`);
  }
};

/**
 * Récupère Firebase de manière sûre (pour mode invité)
 */
export const getFirebaseSafe = async (isGuest) => {
  if (isGuest) {
    console.log('👤 Guest mode - Firebase not required');
    return null;
  }

  try {
    return {
      auth: await getFirebaseAuth(),
      firestore: await getFirebaseFirestore()
    };
  } catch (error) {
    console.warn('⚠️ Firebase unavailable:', error.message);
    return null;
  }
};

/**
 * Reset cache
 */
export const resetFirebaseCache = () => {
  console.log('🔄 Reset Firebase cache');
  _auth = null;
  _firestore = null;
  _firebaseInitialized = false;
};

console.log(`📦 Firebase Config loaded (platform: ${Platform.OS})`);

export default {
  getAuth: getFirebaseAuth,
  getFirestore: getFirebaseFirestore,
  isInitialized: isFirebaseInitialized,
  getSafe: getFirebaseSafe,
  resetCache: resetFirebaseCache,
  isWeb: _isWeb
};
