# 🔍 Diagnostic Firestore Unavailable - Guide Complet

## ❌ Erreur Actuelle

```
[firestore/unavailable] The service is currently unavailable. 
This is a most likely a transient condition and may be corrected by retrying with a backoff.
```

**Temps de réponse** : 8519ms (8.5 secondes) - Indique plusieurs retries avant échec

---

## 🎯 Causes Possibles

### 1. **Firestore NON ACTIVÉ dans Firebase Console** ⚠️ (Cause la plus probable)

Firebase propose deux types de bases de données :
- **Realtime Database** (ancien système)
- **Cloud Firestore** (nouveau système)

Si vous avez créé un nouveau projet Firebase et que vous n'avez **jamais activé Cloud Firestore**, il n'est pas disponible par défaut.

### 2. **Security Rules trop restrictives**

Même si Firestore est activé, les rules peuvent bloquer toutes les requêtes.

### 3. **Problème de configuration google-services.json**

Le fichier peut être mal configuré ou pointer vers le mauvais projet.

### 4. **Problème réseau/émulateur**

L'émulateur Android peut ne pas avoir accès à internet.

---

## ✅ ÉTAPE 1 : Vérifier si Firestore est Activé

### A. Ouvrir Firebase Console

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet : **hybridrpg-53f62**

### B. Vérifier Firestore Database

**Navigation** : Menu latéral → **Build** → **Firestore Database**

#### ✅ SI FIRESTORE EST ACTIVÉ :
- Vous verrez une interface avec des collections
- Vous verrez "Cloud Firestore" avec des onglets Data / Rules / Indexes / Usage

#### ❌ SI FIRESTORE N'EST PAS ACTIVÉ :
- Vous verrez un bouton **"Create database"** ou **"Get started"**
- Message : "Cloud Firestore is not enabled for this project"

---

## ✅ ÉTAPE 2 : Activer Firestore (SI PAS ENCORE FAIT)

### A. Créer la Database

1. Cliquez sur **"Create database"**
2. Choisissez **"Production mode"** ou **"Test mode"**

#### Mode Test (Recommandé pour développement) :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

#### Mode Production (Pour production finale) :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Sélectionnez une **localisation** (ex: europe-west1 pour Europe)
   ⚠️ **IMPORTANT** : Une fois choisie, vous ne pouvez pas changer la localisation !

4. Cliquez sur **"Enable"**

### B. Attendre l'activation

- Peut prendre 1-2 minutes
- Vous verrez "Setting up Cloud Firestore..."

---

## ✅ ÉTAPE 3 : Configurer les Security Rules

Une fois Firestore activé, configurez les rules :

### A. Aller dans Rules Tab

Firebase Console → Firestore Database → **Rules**

### B. Pour Développement (Test Mode)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre tout pour les utilisateurs authentifiés
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Collections de test (toujours accessibles)
    match /_test/{document=**} {
      allow read: if request.auth != null;
    }
    
    match /_status_check/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### C. Pour Production (Sécurisé)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Lecture : tout utilisateur authentifié
      allow read: if request.auth != null;
      
      // Écriture : uniquement son propre document
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Progress collection
    match /progress/{userId}/{document=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tout le reste : interdit
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### D. Publier les Rules

Cliquez sur **"Publish"** après modification

---

## ✅ ÉTAPE 4 : Vérifier la Configuration Android

### A. Vérifier google-services.json

Fichier : `android/app/google-services.json`

**Vérifications** :

1. **project_id** doit correspondre :
   ```json
   "project_id": "hybridrpg-53f62"
   ```

2. **package_name** doit correspondre à app.json :
   ```json
   "package_name": "com.fitnessrpg.app"
   ```

3. **api_key** doit être présent :
   ```json
   "current_key": "AIzaSy..."
   ```

### B. Rebuild l'App Après Changement

Si vous avez modifié `google-services.json` :

```powershell
# 1. Nettoyer le build
cd android
./gradlew clean

# 2. Rebuild l'app
cd ..
npx expo run:android
```

---

## ✅ ÉTAPE 5 : Test de Connectivité

### A. Test Internet Émulateur

```powershell
# Test si l'émulateur a accès à internet
adb shell ping -c 4 8.8.8.8
```

**Résultat attendu** : Réponses de 8.8.8.8

**Si échec** : L'émulateur n'a pas accès à internet
- Vérifier les paramètres réseau de l'émulateur
- Essayer de redémarrer l'émulateur

### B. Test Firestore Directement

Créez un document de test dans Firebase Console :

1. Firestore Database → **Data** tab
2. Cliquez **"+ Start collection"**
3. **Collection ID** : `_test`
4. **Document ID** : `test1`
5. Ajoutez un champ :
   - **Field** : `message`
   - **Type** : string
   - **Value** : `Hello Firestore`
6. Cliquez **Save**

### C. Vérifier dans l'App

App.js contient déjà un test de connexion qui devrait afficher :

```
✅ Firestore CONNECTED - app will work normally
```

Si vous voyez toujours l'erreur, le problème vient de la configuration.

---

## ✅ ÉTAPE 6 : Créer les Collections Initiales

Une fois Firestore activé et les rules configurées, créez ces collections :

### 1. Collection `users`

Structure :
```
users/
  └── {userId}/
      ├── email: string
      ├── totalXP: number (0)
      ├── level: number (1)
      ├── createdAt: timestamp
      ├── completedPrograms: array
      ├── userProgress: object
      ├── streak: number (0)
      └── lastWorkoutDate: timestamp | null
```

### 2. Collection `progress`

Structure :
```
progress/
  └── {userId}/
      └── {programId}/
          ├── programId: string
          ├── currentLevel: number
          ├── completedLevels: array
          ├── xpEarned: number
          ├── startedAt: timestamp
          └── updatedAt: timestamp
```

---

## 🚨 Actions Immédiates

### 1. Vérifier Firestore Activé ⚠️ URGENT

```
1. Allez sur https://console.firebase.google.com/project/hybridrpg-53f62/firestore
2. Est-ce que vous voyez une base de données ou un bouton "Create database" ?
3. Si vous voyez "Create database", CLIQUEZ DESSUS
4. Sélectionnez "Test mode" pour le développement
5. Choisissez europe-west1 comme localisation
6. Cliquez "Enable"
```

### 2. Configurer Rules

```
1. Une fois Firestore activé, allez dans l'onglet "Rules"
2. Copiez-collez les rules "Test Mode" ci-dessus
3. Cliquez "Publish"
```

### 3. Rebuilder l'App

```powershell
cd android
./gradlew clean
cd ..
npx expo run:android
```

### 4. Tester

Reconnectez-vous et vérifiez les logs :

**Attendu** :
```
✅ Firestore CONNECTED - app will work normally
[useUserCategories] ✅ Completed in 300ms
```

**Si toujours en erreur** :
```
⚠️ FIRESTORE UNAVAILABLE
```
→ Firestore n'est pas activé ou mal configuré

---

## 📊 Checklist Complète

- [ ] Firebase Console → Firestore Database → Database créée ?
- [ ] Rules configurées (Test mode ou Production mode) ?
- [ ] Rules publiées ?
- [ ] google-services.json avec bon project_id ?
- [ ] google-services.json avec bon package_name ?
- [ ] App rebuildée après changement config ?
- [ ] Émulateur a accès internet (ping 8.8.8.8) ?
- [ ] Collection `_test` créée dans Firestore ?
- [ ] Test de connexion dans App.js fonctionne ?

---

## 🔧 Commandes de Debug

### Test réseau émulateur
```powershell
adb shell ping -c 4 8.8.8.8
adb shell ping -c 4 firestore.googleapis.com
```

### Vérifier package installé
```powershell
adb shell pm list packages | Select-String "fitnessrpg"
```

### Rebuild complet
```powershell
# Nettoyer
cd android
./gradlew clean

# Désinstaller l'app
adb uninstall com.fitnessrpg.app

# Rebuild
cd ..
npx expo run:android
```

### Vérifier logs Firebase
```powershell
adb logcat | Select-String "Firebase"
adb logcat | Select-String "Firestore"
```

---

## 📝 Exemple de Configuration Complète

### Firebase Console
```
Project: hybridrpg-53f62
Location: europe-west1
Firestore Database: ENABLED
Mode: Test mode (expires 2025-12-31)

Collections:
  - users (created)
  - progress (will be created automatically)
  - _test (created for testing)
```

### google-services.json
```json
{
  "project_info": {
    "project_id": "hybridrpg-53f62"
  },
  "client": [{
    "client_info": {
      "android_client_info": {
        "package_name": "com.fitnessrpg.app"
      }
    },
    "api_key": [{"current_key": "AIzaSy..."}]
  }]
}
```

### app.json
```json
{
  "expo": {
    "android": {
      "package": "com.fitnessrpg.app"
    }
  }
}
```

---

## ⏱️ Temps de Résolution Attendu

- **Activer Firestore** : 2-3 minutes
- **Configurer rules** : 1 minute
- **Rebuild app** : 5-10 minutes
- **Test** : 1 minute

**Total** : ~15 minutes maximum

---

## 📞 Si le Problème Persiste

1. **Screenshot de Firebase Console → Firestore Database** (vue complète)
2. **Copie des logs complets** de l'erreur
3. **Vérification** : `adb shell ping firestore.googleapis.com`

---

**Date** : 5 octobre 2025  
**Status** : 🔴 Firestore unavailable - Activation requise  
**Action** : Activer Cloud Firestore dans Firebase Console
