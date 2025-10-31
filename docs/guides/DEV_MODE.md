# Mode Développement - Bypass Authentication

## 📋 Vue d'ensemble

Le mode développement permet de bypasser complètement le flux d'authentification Firebase pour accélérer le développement et tester les fonctionnalités admin sans dépendre de la disponibilité des services Firebase.

**⚠️ IMPORTANT : Ce mode doit être DÉSACTIVÉ en production !**

---

## 🔧 Configuration

### Activation du mode dev

**Fichier:** `src/contexts/AuthContext.js`

```javascript
// Ligne 30
const DEV_AUTO_LOGIN = true; // ✅ Mode dev ACTIVÉ
```

### Désactivation (production)

```javascript
// Ligne 30
const DEV_AUTO_LOGIN = false; // ❌ Mode dev DÉSACTIVÉ
```

---

## 🚀 Fonctionnement

Quand `DEV_AUTO_LOGIN = true` :

1. **Au démarrage de l'app** :
   - AsyncStorage est configuré pour skip l'onboarding
   - Un utilisateur admin fictif est créé immédiatement
   - Le document Firestore admin est créé/mis à jour en arrière-plan (non-bloquant)
   - L'utilisateur est connecté instantanément

2. **L'authentification Firebase est désactivée** :
   - `onAuthStateChanged` est ignoré (early return)
   - Pas de vérification de session Firebase
   - Pas d'envoi de code SMS

3. **Navigation** :
   - Onboarding skippé automatiquement
   - Sélection de programme skippée
   - Écran d'accueil (HomeScreen) chargé directement

---

## 👤 Utilisateur Admin Créé

```javascript
{
  uid: 'dev-user-admin-123',
  phoneNumber: '+33679430759',
  email: null,
  isAdmin: true,        // 🔥 Droits admin
  totalXP: 999999,
  level: 100,
  activePrograms: ['street'],
  selectedPrograms: ['street']
}
```

### Accès admin disponibles :
- ✅ Panel Admin dans HomeScreen
- ✅ Validation des challenges soumis
- ✅ Accès à toutes les fonctionnalités

---

## 📂 Code Impacté

### 1. `src/contexts/AuthContext.js`

**Fonction clé : `autoLoginDevAdmin()`** (lignes 34-90)

```javascript
const autoLoginDevAdmin = async () => {
  if (!DEV_AUTO_LOGIN) return false;
  
  // Configure AsyncStorage (skip onboarding)
  await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
  await AsyncStorage.removeItem('@fitnessrpg:guest_mode');
  await AsyncStorage.removeItem('@fitnessrpg:guest_data');
  
  // Crée l'utilisateur admin
  const devUser = { uid: 'dev-user-admin-123', ... };
  
  // Connecte immédiatement (pas d'attente Firestore)
  setUser(devUser);
  setIsGuest(false);
  setLoading(false);
  
  // Crée le doc Firestore EN ARRIÈRE-PLAN (non-bloquant)
  firestore().collection('users').doc(devUser.uid).set({...});
  
  return true;
}
```

**Bypass Firebase Auth** (lignes 119-122)

```javascript
const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
  if (DEV_AUTO_LOGIN) {
    log('⚠️ DEV MODE: onAuthStateChanged ignoré');
    return; // 🚨 Empêche Firebase de reset le user
  }
  // ... code normal
});
```

### 2. Bypass manuel (optionnel)

Si l'utilisateur arrive sur l'écran de login manuellement :

**Constante:** `DEV_BYPASS = true` (ligne 285)

```javascript
// Dans sendVerificationCode()
if (DEV_BYPASS && formattedPhone === '+33679430759') {
  // Retourne un code de confirmation fictif
  return {
    success: true,
    confirmation: { 
      confirm: async (code) => {
        if (code === '123456') return { user: devUser };
        throw new Error('Code incorrect');
      }
    }
  };
}
```

**Code SMS fictif :** `123456`

---

## 🔄 Retour au Mode Normal

### Étape 1 : Désactiver le mode dev

```javascript
// src/contexts/AuthContext.js - Ligne 30
const DEV_AUTO_LOGIN = false;
```

### Étape 2 : (Optionnel) Désactiver le bypass manuel

```javascript
// src/contexts/AuthContext.js - Ligne 285
const DEV_BYPASS = false;
```

### Étape 3 : Nettoyer AsyncStorage (si nécessaire)

Sur l'appareil de test :
```javascript
// Dans la console React Native Debugger ou un script
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

### Étape 4 : Relancer l'app

Le flux normal reprend :
1. Onboarding affiché
2. Sélection de programme
3. Login/Signup classique (Firebase Auth)

---

## 🛡️ Sécurité Production

### Option 1 : Variable d'environnement (recommandé)

```javascript
// .env.development
ENABLE_DEV_LOGIN=true

// .env.production
ENABLE_DEV_LOGIN=false
```

```javascript
// AuthContext.js
const DEV_AUTO_LOGIN = __DEV__ && process.env.ENABLE_DEV_LOGIN === 'true';
```

### Option 2 : Build-time check

```javascript
// AuthContext.js
const DEV_AUTO_LOGIN = __DEV__ ? true : false;
```

### Option 3 : Script de validation pre-build

```javascript
// scripts/checkDevMode.js
const fs = require('fs');
const authContext = fs.readFileSync('src/contexts/AuthContext.js', 'utf8');

if (authContext.includes('DEV_AUTO_LOGIN = true')) {
  console.error('❌ DEV_AUTO_LOGIN est activé ! Build annulé.');
  process.exit(1);
}
```

Dans `package.json` :
```json
{
  "scripts": {
    "build:android": "node scripts/checkDevMode.js && cd android && ./gradlew assembleRelease"
  }
}
```

---

## 🐛 Debugging

### Logs à vérifier

Séquence normale au démarrage :

```
🔄 Initialisation Firebase Auth
⚠️ DEV MODE: Auto-login admin...
✅ DEV MODE: AsyncStorage configuré
✅ DEV MODE: Admin auto-connecté ! UID: dev-user-admin-123
✅ DEV MODE: Document Firestore créé (en arrière-plan)
⚠️ DEV MODE: onAuthStateChanged ignoré (auto-login actif)
```

### Problèmes courants

**1. App bloquée en "Chargement"**
- ✅ **Solution:** Vérifier que `setLoading(false)` est bien appelé dans `autoLoginDevAdmin()`

**2. Onboarding s'affiche quand même**
- ✅ **Solution:** Vérifier AsyncStorage : `@fitnessrpg:onboarding_completed` doit être `'true'`

**3. "Mode invité" au lieu d'admin**
- ✅ **Solution:** Vérifier que `onAuthStateChanged` a bien le `if (DEV_AUTO_LOGIN) return;`

**4. Données Firestore pas créées**
- ℹ️ **Normal :** La création est non-bloquante, peut prendre quelques secondes
- ✅ **Vérifier :** Console Firebase → Firestore → `users/dev-user-admin-123`

---

## 📊 Comparaison Modes

| Fonctionnalité | Mode Dev | Mode Production |
|---|---|---|
| Onboarding | ❌ Skip | ✅ Affiché |
| Sélection programme | ❌ Skip | ✅ Affiché |
| Firebase Auth | ❌ Bypass | ✅ Actif |
| Temps chargement | ⚡ ~100ms | 🐌 2-5s |
| Données utilisateur | 🔥 Admin fictif | 👤 User réel |
| Droits admin | ✅ Automatique | ⚠️ Manuel (Firestore) |

---

## 📝 Checklist Avant Production

- [ ] `DEV_AUTO_LOGIN = false` dans `AuthContext.js`
- [ ] `DEV_BYPASS = false` dans `sendVerificationCode()`
- [ ] Tester le flux complet : onboarding → signup → login
- [ ] Vérifier Firebase Auth fonctionne (SMS)
- [ ] Supprimer l'utilisateur `dev-user-admin-123` de Firestore production
- [ ] Ajouter un script de validation pre-build
- [ ] Mettre à jour .gitignore pour exclure les configs dev

---

## 🔗 Fichiers Liés

- `src/contexts/AuthContext.js` - Configuration principale
- `src/screens/OnboardingScreen.js` - Skip si AsyncStorage configuré
- `src/screens/HomeScreen.js` - Chargement des données admin
- `src/contexts/ChallengeContext.tsx` - Gestion challenges (normal en mode dev)

---

## 📅 Historique

| Date | Modification | Raison |
|---|---|---|
| 2025-10-29 | Création mode dev | Service Firebase instable, besoin de continuer le dev |
| 2025-10-29 | Optimisation chargement | Firestore non-bloquant pour démarrage rapide |
| - | Retrait court-circuits | Besoin de tester avec vraies données Firestore |

---

## ⚠️ Notes Importantes

1. **NE JAMAIS commit avec `DEV_AUTO_LOGIN = true`** sur la branche `main` ou `production`
2. Le document Firestore `dev-user-admin-123` peut exister en production mais sera inutilisé
3. Le numéro `+33679430759` est réservé pour le dev, ne pas l'utiliser en prod
4. En cas de problème Firebase, ce mode permet de continuer à développer sans bloquer

---

**Dernière mise à jour :** 29 octobre 2025
**Auteur :** GitHub Copilot
**Statut :** ✅ Actif en développement
