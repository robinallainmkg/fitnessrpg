# Instructions pour mettre à jour les règles Firestore

## Option 1 : Via la Console Firebase (RECOMMANDÉ)

1. **Aller sur Firebase Console**
   - https://console.firebase.google.com/project/hybridrpg-53f62/firestore/rules

2. **Copier-coller les règles ci-dessous** dans l'éditeur

3. **Cliquer sur "Publier"**

## Option 2 : Via Firebase CLI

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter
firebase login

# Déployer les règles
firebase deploy --only firestore:rules
```

---

## Règles Firestore à copier

```javascript
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
      // Vérifier si l'utilisateur est admin via son document
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
      // Les utilisateurs peuvent créer leurs propres soumissions
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'pending';
      
      // Les utilisateurs peuvent lire leurs propres soumissions
      // Les admins peuvent lire toutes les soumissions
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      
      // Seuls les admins peuvent modifier le statut des soumissions
      allow update: if isAdmin();
      
      // Seuls les admins peuvent supprimer des soumissions
      allow delete: if isAdmin();
    }
    
    // Daily challenges
    match /dailyChallenges/{date}/users/{userId} {
      allow read, write: if isOwner(userId);
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
    
    // User progress
    match /userProgress/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

---

## Vérification

Après avoir publié les règles :

1. **Relancer l'app**
2. **Aller dans ProfileScreen** - le champ `isAdmin` sera automatiquement ajouté
3. **Essayer d'approuver un challenge** - ça devrait fonctionner !

## Dépannage

Si ça ne marche toujours pas :

1. Vérifier dans Firestore Console que le champ `isAdmin: true` existe dans ton document utilisateur
2. Vérifier dans les logs : `console.log('👤 User phone:', ..., 'isAdmin:', ...)`
3. Tester les règles dans l'onglet "Rules Playground" de Firestore Console
