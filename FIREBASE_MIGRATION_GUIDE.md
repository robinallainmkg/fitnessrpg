# 🔥 Migration React Native Firebase → Firebase JS SDK

## 🚨 Problème Identifié

**React Native Firebase (`@react-native-firebase/*`) n'est PAS compatible avec Expo Prebuild.**

L'erreur EAS Build:
```
Directory import '@react-native-firebase/app/lib/common' is not supported
```

## ✅ SOLUTION: Firebase JS SDK

Utiliser le **Firebase JavaScript SDK** qui est 100% compatible avec Expo.

---

## 📦 Étape 1: Désinstaller React Native Firebase

```powershell
npm uninstall @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

## 📦 Étape 2: Installer Firebase JS SDK

```powershell
npm install firebase@^10.7.1
```

## 📝 Étape 3: Créer firebase.config.js

Créer un nouveau fichier `src/config/firebase.config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
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

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Auth avec persistence AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialiser Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
```

## 🔄 Étape 4: Mettre à jour AuthContext.js

Remplacer les imports React Native Firebase par Firebase JS SDK:

**AVANT:**
```javascript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
```

**APRÈS:**
```javascript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
```

### Exemples de conversion:

**Login:**
```javascript
// AVANT
await auth().signInWithEmailAndPassword(email, password);

// APRÈS
await signInWithEmailAndPassword(auth, email, password);
```

**Signup:**
```javascript
// AVANT
await auth().createUserWithEmailAndPassword(email, password);

// APRÈS
await createUserWithEmailAndPassword(auth, email, password);
```

**Firestore Set:**
```javascript
// AVANT
await firestore().collection('users').doc(userId).set(data);

// APRÈS
await setDoc(doc(db, 'users', userId), data);
```

**Firestore Get:**
```javascript
// AVANT
const userDoc = await firestore().collection('users').doc(userId).get();
const data = userDoc.data();

// APRÈS
const userDoc = await getDoc(doc(db, 'users', userId));
const data = userDoc.data();
```

**Auth State:**
```javascript
// AVANT
auth().onAuthStateChanged((user) => { ... });

// APRÈS
onAuthStateChanged(auth, (user) => { ... });
```

## 📱 Étape 5: Mettre à jour app.json

**Retirer les plugins React Native Firebase:**

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 36,
            "targetSdkVersion": 36,
            "buildToolsVersion": "36.0.0"
          }
        }
      ]
    ]
  }
}
```

**Note:** Plus besoin de `googleServicesFile` avec le JS SDK !

## 🚀 Étape 6: Rebuild

```powershell
eas build --platform android --profile preview --clear-cache
```

---

## ⚡ OU: Option Rapide - Build Local

Si vous voulez garder React Native Firebase:

```powershell
# Restaurer android/
git checkout android/

# Build local
eas build --platform android --profile preview --local
```

**Inconvénient:** Build local plus lent (~20-30 min) et consomme des ressources locales.

---

## 🎯 RECOMMANDATION

**Migrer vers Firebase JS SDK** car:
- ✅ Compatible Expo Prebuild
- ✅ Build EAS rapide (~10 min)
- ✅ Updates OTA possibles
- ✅ API moderne et bien documentée
- ✅ Pas de google-services.json nécessaire

**Temps estimé migration:** ~30 minutes pour mettre à jour tous les fichiers.

---

## 📚 Fichiers à Mettre à Jour

1. `src/config/firebase.config.js` (CRÉER)
2. `src/contexts/AuthContext.js` (MODIFIER imports + méthodes)
3. `src/hooks/useUserPrograms.js` (MODIFIER imports Firestore)
4. `src/screens/ProfileScreen.js` (MODIFIER imports Firestore)
5. `src/screens/ProgressScreen.js` (MODIFIER imports Firestore)
6. `src/screens/HomeScreen.js` (MODIFIER imports Firestore)
7. `app.json` (RETIRER plugins Firebase)

---

**Voulez-vous que je fasse la migration automatiquement ?** 🤖

Répondez:
- **A** = Oui, migre vers Firebase JS SDK (30 min)
- **B** = Non, je préfère build local avec React Native Firebase
