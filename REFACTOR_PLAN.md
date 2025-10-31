# 🔧 PLAN DE REFACTORISATION FIREBASE - FitnessRPG

## 📊 DIAGNOSTIC

### Problèmes identifiés :
1. **Multiple fichiers Firebase** créant de la confusion :
   - `src/config/firebase.js` (wrapper complexe)
   - `src/services/firebase.js` (bridge)
   - `src/config/firebase.config.js` 
   - `src/config/firebase.cross-platform.js`
   
2. **Imports incohérents** :
   - AuthContext importe directement `@react-native-firebase/auth`
   - ProgramSelectionScreen importe `@react-native-firebase/firestore`
   - HomeScreen importe depuis différentes sources
   
3. **Persistence cache** :
   - Configurée trop tard ou pas du tout
   - Nothing Phone corrompt le cache → timeouts systématiques
   
4. **Boucles d'initialisation dans App.js** :
   - Trop de useEffect interdépendants
   - Risque de boucles infinies

## ✅ SOLUTION : UN SEUL POINT D'ENTRÉE

### 1. Fichier unique : `firebase.simple.js`
```javascript
// UN SEUL fichier pour TOUTE l'app
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

let firestoreInstance = null;

const initFirestore = () => {
  if (firestoreInstance) return firestoreInstance;
  
  firestoreInstance = firestore();
  
  // CRITIQUE: Désactiver persistence AVANT toute utilisation
  firestoreInstance.settings({
    persistence: false, // Nothing Phone fix
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
  });
  
  return firestoreInstance;
};

export const getAuth = () => auth();
export const getFirestore = () => initFirestore();
```

### 2. Imports uniformes PARTOUT :
```javascript
// ✅ BON
import { getAuth, getFirestore } from '../config/firebase.simple';
const auth = getAuth();
const firestore = getFirestore();

// Puis utiliser :
auth.signInAnonymously()
firestore.collection('users').doc(uid).get()

// ❌ MAUVAIS (ancien)
import auth from '@react-native-firebase/auth';
auth().signInAnonymously() // ← auth() crée nouvelle instance!
```

### 3. Fichiers à modifier :

#### AuthContext.js ✅ FAIT
- Import unifié depuis firebase.simple.js
- Remplacement auth() → auth (sans parenthèses)
- Remplacement firestore() → firestore

#### ProgramSelectionScreen.js ⏳ EN COURS
- Import unifié depuis firebase.simple.js
- Remplacer tous les firestore().collection → firestore.collection
- Garder firestore.FieldValue.serverTimestamp()

#### HomeScreen.js ⏳ À FAIRE
- Import unifié depuis firebase.simple.js
- Remplacer tous les appels

#### Autres screens à vérifier :
- WorkoutSummaryScreen.js
- ProgressScreen.js
- ProfileScreen.js
- ChallengeScreen.js
- Tous les hooks custom

## 🎯 RÉSULTAT ATTENDU

### Performance :
- ✅ Pas de timeouts (cache désactivé dès le départ)
- ✅ Chargement rapide (une seule instance Firestore)
- ✅ Pas de corruption cache sur Nothing Phone

### Simplicité :
- ✅ Un seul fichier Firebase
- ✅ Imports identiques partout
- ✅ Facile à débugger

### Compatibilité :
- ✅ Fonctionne sur tous les devices
- ✅ Nothing Phone inclus

## 📝 ÉTAPES SUIVANTES

1. [✅] Créer firebase.simple.js
2. [✅] Migrer AuthContext.js
3. [⏳] Migrer ProgramSelectionScreen.js
4. [ ] Migrer HomeScreen.js
5. [ ] Migrer tous les autres screens
6. [ ] Supprimer les anciens fichiers firebase
7. [ ] Test complet avec `adb shell pm clear`
8. [ ] Vérifier que tout fonctionne

## 🔥 COMMANDES DE TEST

```bash
# Clear cache avant test
adb shell pm clear com.fitnessrpg.app

# Relancer app
adb shell am start -n com.fitnessrpg.app/.MainActivity

# Surveiller logs
adb logcat | grep -E "Firebase|Firestore|Auth"
```

## 📌 NOTES IMPORTANTES

- **JAMAIS** appeler `auth()` ou `firestore()` avec parenthèses après import
- **TOUJOURS** importer depuis `firebase.simple.js`
- **PERSISTENCE: FALSE** est OBLIGATOIRE pour Nothing Phone
- Settings Firestore doit être appelé AVANT première utilisation
