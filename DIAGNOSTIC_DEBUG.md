# 🔍 DEBUG COMPLET - Plan d'action

## ❌ Problèmes identifiés

### 1. **Règles Firestore non déployées**
- Les règles dans `firestore.rules` ont été corrigées mais **jamais déployées** sur Firebase
- Firebase CLI n'est pas installé localement
- **SOLUTION** : Déployer manuellement via Firebase Console

### 2. **Email null pour utilisateurs anonymes**
- Le code essayait de sauvegarder `email: user.email` même pour les anonymous users
- **CORRIGÉ** ✅ dans `HomeScreen.js` et `ProgramSelectionScreen.js`

### 3. **Possible problème de règles userProgress**
- La règle utilise `progressId.matches()` qui peut être trop restrictive
- **À TESTER** après déploiement

## 🎯 Actions à faire IMMÉDIATEMENT

### Étape 1: Déployer les règles Firestore ⚠️ CRITIQUE

1. Ouvre https://console.firebase.google.com/project/hybridrpg-53f62/firestore/rules

2. Copie-colle ces règles EXACTES :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('isAdmin', false) == true;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Challenge submissions
    match /submissions/{submissionId} {
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'pending';
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Daily challenges - SIMPLIFIÉ
    match /dailyChallenges/{date} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
      
      match /users/{userId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Categories (programme data)
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Program details
    match /programDetails/{programId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // User progress - SIMPLIFIÉ
    match /userProgress/{progressId} {
      allow read, write: if isAuthenticated();
    }
    
    // Workout sessions
    match /workoutSessions/{sessionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow create: if isAdmin() && request.resource.data.type == 'challenge';
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Clique sur **"Publier"** (bouton bleu en haut à droite)

4. Attends la confirmation "Règles publiées avec succès"

### Étape 2: Vérifier la configuration Firebase

1. Ouvre https://console.firebase.google.com/project/hybridrpg-53f62/authentication/providers

2. Vérifie que **"Anonymous"** est **activé** (toggle vert)

3. Ouvre https://console.firebase.google.com/project/hybridrpg-53f62/firestore/databases

4. Vérifie que Firestore est en **mode production** (pas test mode)

### Étape 3: Tester l'application

1. **Ferme complètement l'application** sur ton téléphone

2. **Redémarre Metro** :
   ```powershell
   # Arrêter le processus Node.js qui bloque le port 8081
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
   
   # Redémarrer proprement
   npx expo start --clear
   ```

3. **Lance l'app** et vérifie les logs

4. **Teste ces actions** :
   - ✅ Sélection de programme (doit sauvegarder dans Firestore)
   - ✅ Compléter un workout (doit gagner XP)
   - ✅ Voir le daily challenge
   - ✅ Refresh de l'écran d'accueil (pull down)

## 📊 Logs attendus après correction

### ✅ Sélection de programme réussie :
```
💾 Saving to Firestore: { selectedPrograms: ['street'], activePrograms: ['street'], ... }
✅ Nouveau document utilisateur créé avec programmes
🚀 Nouveau utilisateur - Navigation vers Home
```

### ✅ Workout complété avec XP :
```
💾 Workout completed - result: { xpEarned: 100, ... }
⭐ Updating user XP: + 100
✅ XP updated: 0 → 100 | Level: 1
🎯 Level validated - updating progression for program: beginner-foundation level: 1
✅ Level 1 completed for skill beginner-foundation
✅ Progression saved: { skillId: 'beginner-foundation', completedLevels: [1], currentLevel: 2 }
```

### ✅ Daily Challenge chargé :
```
📅 Loading daily challenge for: 2025-10-31 user: XXX
🆕 No challenge for today - creating one
🎲 Creating daily challenge for: 2025-10-31
✅ Daily challenge created: Faire 50 pompes
```

## ❌ Erreurs possibles et solutions

### `[firestore/permission-denied]`
➡️ Les règles ne sont pas déployées - retour Étape 1

### `[firestore/unavailable]`
➡️ Problème de connexion réseau ou Firestore pas activé
➡️ Vérifie https://console.firebase.google.com/project/hybridrpg-53f62/firestore

### `email is null`
➡️ Déjà corrigé ✅ - restart l'app si tu vois encore cette erreur

### Port 8081 occupé
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

## 📝 Fichiers modifiés aujourd'hui

✅ `src/contexts/ChallengeContext.js` - CRÉÉ
✅ `src/screens/HomeScreen.js` - Email optionnel pour anonymous
✅ `src/screens/ProgramSelectionScreen.js` - Email optionnel + champs manquants
✅ `src/screens/WorkoutSummaryScreen.js` - Sauvegarde XP et progression
✅ `src/contexts/WorkoutContext.js` - Suppression des blocs isGuest
✅ `firestore.rules` - Règles corrigées (À DÉPLOYER ⚠️)

## 🎯 Checklist finale

- [ ] Règles Firestore déployées sur Firebase Console
- [ ] Anonymous Auth activé dans Firebase
- [ ] Metro redémarré proprement
- [ ] App testée : sélection programme ✅
- [ ] App testée : workout + XP ✅
- [ ] App testée : daily challenge ✅
- [ ] Tous les logs montrent des ✅ (pas d'erreurs rouges)
