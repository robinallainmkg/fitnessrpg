# 🔥 Plan de Nettoyage Firebase - Mobile First

## 🎯 Objectif
Simplifier Firebase pour **iOS/Android uniquement** en utilisant uniquement React Native Firebase.

## ✅ Actions à effectuer

### 1. Nettoyer les dépendances
```bash
# Supprimer Firebase Web SDK (inutile pour mobile)
npm uninstall firebase

# Garder uniquement React Native Firebase
# @react-native-firebase/app
# @react-native-firebase/auth  
# @react-native-firebase/firestore
```

### 2. Supprimer firebase.cross-platform.js
Ce fichier est trop complexe et source de bugs. On va utiliser directement React Native Firebase.

### 3. Simplifier AuthContext.js
Retour à l'import direct:
```javascript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
```

### 4. Fichiers à modifier

#### AuthContext.js
- Supprimer l'import de `firebase.cross-platform`
- Utiliser directement `auth()` et `firestore()`
- Supprimer les checks Platform.OS === 'web'
- Simplifier la logique

#### ProfileScreen.js
- Import direct React Native Firebase
- Pas de wrapper

#### Tous les autres screens
- Même principe: imports directs

### 5. Configuration à vérifier

#### Android (google-services.json)
✅ Déjà présent et configuré

#### iOS (GoogleService-Info.plist)
⚠️ À vérifier - doit être dans `ios/RpgHybrid/`

### 6. Build & Test

```bash
# Android
npx expo run:android

# iOS  
npx expo run:ios
```

## 🚫 Ce qu'on abandonne
- Support web (localhost:8081 ne marchera plus)
- Compatibilité cross-platform complexe
- firebase.cross-platform.js

## ✅ Ce qu'on gagne
- Code simple et lisible
- Moins de bugs
- Documentation officielle React Native Firebase applicable directement
- Pas de confusion entre 2 SDKs

## 📝 Prochaines étapes
1. Valider cette approche avec vous
2. Exécuter le nettoyage (30 min)
3. Tester sur Android (votre device A024)
4. Tester sur iOS (simulateur ou device)
5. Reset password pour robinallainmkg@gmail.com

## ⚠️ Note importante
Cette app sera **mobile-only**. Si besoin du web plus tard, on créera une app web séparée avec Firebase Web SDK.
