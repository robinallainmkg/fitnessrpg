# 🔥 FIRESTORE UNAVAILABLE - Diagnostic Rapide

## ⚠️ Symptôme
```
ERROR [firestore/unavailable] The service is currently unavailable.
```

---

## ✅ SOLUTION RAPIDE (5 minutes)

### Étape 1 : Vérifier que Firestore EXISTE dans Firebase

1. **Ouvrir Firebase Console :**
   👉 https://console.firebase.google.com

2. **Sélectionner votre projet**

3. **Menu BUILD → Firestore Database**

4. **Vérifier le statut :**

   #### ❌ Si vous voyez "Get started" ou "Create database" :
   ```
   → Firestore N'EST PAS ACTIVÉ (c'est probablement le problème !)
   ```
   
   **ACTION : Créer la base de données**
   - Cliquer "Create database"
   - Location : `eur3 (europe-west)` ou autre proche de vous
   - **IMPORTANT : Choisir "Start in TEST MODE"**
   - Attendre 30-60 secondes
   
   #### ✅ Si vous voyez des onglets "Data", "Rules", "Indexes" :
   ```
   → Firestore est activé, vérifier Rules (étape 2)
   ```

---

### Étape 2 : Vérifier les Security Rules

**Firebase Console → Firestore → Rules**

#### ❌ Règles bloquantes (par défaut) :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ BLOQUE TOUT
    }
  }
}
```

#### ✅ Règles de TEST (à utiliser maintenant) :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ✅ Autorise tout (TEST ONLY)
    }
  }
}
```

**⚠️ ATTENTION : Règles de test = TEMPORAIRE pour développement**
- À changer avant mise en production
- Voir section "Production Rules" plus bas

**Cliquer "Publish" après modification**

---

### Étape 3 : Vérifier google-services.json

#### Windows (PowerShell) :
```powershell
Test-Path android\app\google-services.json
```

#### Si `False` ou fichier manquant :

1. **Télécharger depuis Firebase Console :**
   - Firebase Console → ⚙️ Project Settings
   - Descendre → "Your apps"
   - Section Android (icône robot)
   - Cliquer "google-services.json" download

2. **Placer le fichier :**
   ```
   RpgHybrid/
   └── android/
       └── app/
           └── google-services.json  ← ICI
   ```

3. **REBUILD obligatoire :**
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   npx expo run:android --device
   ```

---

### Étape 4 : Tester la connexion internet

#### Test simple dans PowerShell :
```powershell
Test-NetConnection google.com -Port 443
```

#### Si échec :
- Vérifier WiFi/câble
- Désactiver VPN si actif
- Vérifier firewall/antivirus
- Essayer autre réseau

---

## 🎯 CHECKLIST COMPLÈTE

Cochez au fur et à mesure :

```
□ Firebase Console ouvert
□ Firestore Database créé (pas juste "Get started")
□ Rules en test mode (allow read, write: if true)
□ google-services.json présent dans android/app/
□ google-services.json correspond au projet Firebase actuel
□ Internet fonctionne (ping google.com OK)
□ Rebuild fait après changement google-services.json
□ Émulateur/téléphone redémarré
```

---

## 🔧 Commandes de Debug Utiles

### Vérifier projet Firebase dans google-services.json :
```powershell
Get-Content android\app\google-services.json | Select-String "project_id"
```

### Logs Android Firestore :
```powershell
adb logcat | Select-String "Firestore"
```

### Clean build Android :
```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug
cd ..
```

---

## 📱 Après Avoir Appliqué une Solution

1. **Arrêter l'app complètement** (pas juste Ctrl+C)
2. **Rebuild :**
   ```powershell
   npx expo run:android --device
   ```
3. **Attendre le log de diagnostic :**
   ```
   🔍 === FIRESTORE CONNECTION TEST ===
   ✅ Firestore CONNECTED - app will work normally
   ```

---

## 🚨 Si RIEN ne Marche

### Créer un nouveau projet Firebase (solution radicale) :

1. **Firebase Console → Créer nouveau projet**
2. **Ajouter app Android** avec votre package name
3. **Télécharger google-services.json**
4. **Activer Firestore** (test mode)
5. **Rebuild app**

### Vérifier package name :
```powershell
Get-Content android\app\build.gradle | Select-String "applicationId"
```

Doit correspondre au package dans Firebase Console

---

## 🔐 Production Rules (après test)

**⚠️ NE PAS UTILISER EN PRODUCTION : `allow read, write: if true`**

**Rules sécurisées pour production :**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users : lecture/écriture de son propre document uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workouts : lecture/écriture de ses propres workouts
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null 
                          && request.resource.data.userId == request.auth.uid;
    }
    
    // Programs : lecture publique, écriture admin only
    match /programs/{programId} {
      allow read: if true;  // Tout le monde peut lire
      allow write: if false; // Personne ne peut écrire (géré backend)
    }
    
    // Sessions : lecture/écriture de ses propres sessions
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null
                          && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📞 Support

Si le problème persiste après TOUTES ces étapes :

1. **Copier la sortie complète de :**
   ```powershell
   npx expo run:android --device 2>&1 | Out-File -FilePath firestore-debug.log
   ```

2. **Vérifier `firestore-debug.log`** pour erreurs spécifiques

3. **Stack Overflow :**
   - Tag: `[react-native-firebase]` + `[firestore]`
   - Inclure : version RN, version Firebase, logs complets

4. **GitHub Issues :**
   - https://github.com/invertase/react-native-firebase/issues

---

## ✅ Résumé

**90% des cas = Firestore pas créé ou Rules bloquantes**

**Solution la plus probable :**
1. Firebase Console → Firestore → Create Database (test mode)
2. Attendre 60 secondes
3. Restart app
4. ✅ Ça marche !

**Si ça ne suffit pas :**
- Vérifier google-services.json
- Rebuild complet
- Tester internet

---

**Bon courage ! 🚀**
