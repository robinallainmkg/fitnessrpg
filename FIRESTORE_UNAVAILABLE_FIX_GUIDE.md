# Guide de Résolution Firestore Unavailable

## Symptôme
Console flooded with:
```
⚠️ Firestore unavailable, retrying 2 times...
❌ Firestore still unavailable after retries - check internet connection and Firebase config
```

## Causes Possibles

### 1. Firestore Pas Activé dans Firebase Console ⚠️ (PLUS PROBABLE)

**Vérification :**
1. Ouvrir [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet
3. Menu **Build** → **Firestore Database**

**Symptômes :**
- Page affiche "Get started" ou "Create database"
- Pas de collections visibles

**Solution :**
```
1. Click "Create Database"
2. Choose location (e.g., eur3 Europe)
3. Start in TEST MODE for development:
   - Rules: allow read, write: if true;
   - ⚠️ Change to production rules before launch!
4. Wait 30-60 seconds for provisioning
5. Restart app
```

---

### 2. Firestore Rules Bloquent l'Accès

**Vérification :**
```
Firebase Console → Firestore → Rules
```

**Rules de Test (Development Only):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Rules de Production (Recommandées):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // User can only read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /workouts/{workoutId} {
      // User can only read/write their own workouts
      allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    match /programs/{programId} {
      // Everyone can read programs (public data)
      allow read: if true;
      // Only admins can write
      allow write: if false;
    }
  }
}
```

---

### 3. Pas de Connexion Internet

**Vérification :**
- Ouvrir navigateur sur l'appareil
- Tester connexion WiFi/Data

**Solutions :**
- Activer WiFi ou données mobiles
- Vérifier firewall/proxy
- Essayer autre réseau

---

### 4. Configuration Firebase Manquante/Incorrecte

**Android - google-services.json :**

**Vérification :**
```bash
ls android/app/google-services.json
```

**Si manquant :**
```
1. Firebase Console → Project Settings → Your apps
2. Android app → Download google-services.json
3. Place in: android/app/google-services.json
4. Rebuild:
   npx expo run:android
```

**iOS - GoogleService-Info.plist :**

**Vérification :**
```bash
ls ios/GoogleService-Info.plist
```

**Si manquant :**
```
1. Firebase Console → Project Settings → Your apps
2. iOS app → Download GoogleService-Info.plist
3. Place in: ios/GoogleService-Info.plist
4. Rebuild:
   npx expo run:ios
```

---

### 5. Projet Firebase Supprimé/Suspendu

**Vérification :**
- Firebase Console affiche le projet ?
- Status du projet = Active ?

**Symptômes :**
- Erreur 403 ou 404
- "Project not found"

**Solution :**
- Créer nouveau projet Firebase
- Télécharger nouvelles config files
- Rebuild app

---

## Changements Code pour Mode Dégradé

### ✅ Optimisations Appliquées

**1. Réduction des Retries (firestoreRetry.js):**
```javascript
// Avant: 5 retries × (1s + 2s + 4s + 8s + 16s) = 31 seconds
// Après: 2 retries × (500ms + 1s) = 1.5 seconds
export const retryFirestoreOperation = async (operation, maxRetries = 2, baseDelay = 500)
```

**2. Logs Moins Verbeux:**
```javascript
// Log seulement le premier retry
if (attempt === 0) {
  console.log(`⚠️ Firestore unavailable, retrying ${maxRetries} times...`);
}
```

**3. Mode Dégradé (HomeScreen.js & ProfileScreen.js):**
```javascript
catch (error) {
  if (error.code === 'firestore/unavailable') {
    console.warn('⚠️ Mode dégradé activé');
    // Continue avec données par défaut au lieu de crasher
    setUserStats({ globalXP: 0, globalLevel: 0, ... });
  }
}
```

**4. Diagnostic au Démarrage (App.js):**
```javascript
// Test Firestore à l'init avec timeout 3s
try {
  await Promise.race([
    firestore().collection('_test').limit(1).get(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3000))
  ]);
  console.log('✅ Firestore OK');
} catch (error) {
  console.warn('⚠️ Firestore unavailable - degraded mode');
}
```

---

## Workflow de Résolution

### Étape 1: Vérifier Console Logs
```bash
# Chercher ce pattern:
✅ Firestore OK - connected successfully
# OU
⚠️ Firestore unavailable - app will use degraded mode
```

### Étape 2: Si Unavailable
1. **Vérifier Firestore activé** (Firebase Console)
2. **Vérifier rules** (test mode = allow all)
3. **Vérifier internet** (browser test)
4. **Vérifier google-services.json** (existe + rebuild)

### Étape 3: Tester avec Code Simple
Ajouter dans `HomeScreen.js` useEffect:
```javascript
useEffect(() => {
  if (__DEV__) {
    firestore().collection('test').add({ test: true })
      .then(() => console.log('✅ Manual Firestore test OK'))
      .catch(err => console.error('❌ Manual test failed:', err.code, err.message));
  }
}, []);
```

### Étape 4: Rebuild si Config Change
```bash
# Si google-services.json modifié:
cd android
./gradlew clean
cd ..
npx expo run:android

# Si GoogleService-Info.plist modifié:
cd ios
pod install
cd ..
npx expo run:ios
```

---

## Commandes de Debug

### Vérifier Firebase Config
```bash
# Android
cat android/app/google-services.json | grep project_id
cat android/app/google-services.json | grep mobilesdk_app_id

# iOS
cat ios/GoogleService-Info.plist | grep GOOGLE_APP_ID
```

### Logs Firestore Natifs
```bash
# Android
adb logcat | grep Firestore

# iOS
xcrun simctl spawn booted log stream --predicate 'subsystem contains "Firestore"'
```

### Test Internet Connexion
```bash
# Ping Google DNS
ping 8.8.8.8

# Test HTTPS
curl https://firestore.googleapis.com
```

---

## Résumé des Modifications

| Fichier | Changement | Impact |
|---------|-----------|--------|
| `src/utils/firestoreRetry.js` | maxRetries: 5→2, baseDelay: 1000→500ms | Retry: 31s → 1.5s |
| `src/utils/firestoreRetry.js` | Log only first retry | Moins de spam console |
| `src/screens/HomeScreen.js` | Mode dégradé si unavailable | Pas de crash |
| `src/screens/ProfileScreen.js` | Mode dégradé si unavailable | Pas de crash |
| `App.js` | Diagnostic 3s timeout au startup | Early warning |

---

## Next Steps

### Si Firestore Marche:
- ✅ Retries rapides (1.5s total)
- ✅ Logs propres
- ✅ App fonctionne normalement

### Si Firestore Down:
- ⚠️ Mode dégradé activé
- ⚠️ Données par défaut affichées
- ⚠️ Une seule alerte (pas de spam)
- ⚠️ App reste utilisable en local

### Pour Production:
1. Activer Firestore
2. Configurer security rules
3. Tester avec vraies données
4. Retirer test mode rules
5. Activer offline persistence (déjà fait)

---

## Contact Firebase Support

Si problème persiste après ces étapes:
1. Firebase Console → Support
2. Stack Overflow: `[react-native-firebase] [firestore]`
3. GitHub Issues: `invertase/react-native-firebase`

Inclure dans le rapport:
- Log complet du diagnostic
- `google-services.json` project_id
- Version `@react-native-firebase/*`
- OS et version (iOS/Android)
