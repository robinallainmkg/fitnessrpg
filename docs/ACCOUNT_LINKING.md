# Fusion des comptes - Guest → Authenticated

## 🎯 Objectif

Permettre aux utilisateurs de commencer en mode **invité** (anonymous), puis de **se connecter** avec un téléphone **sans perdre leurs données**.

---

## 📊 Comment ça fonctionne ?

### 1. **Mode Invité (Anonymous Auth)**

Quand un utilisateur lance l'app sans se connecter :

```javascript
// AuthContext.js - startGuestMode()
const userCredential = await auth.signInAnonymously();
// UID généré : ex. "abc123xyz" (Firebase Anonymous)

// Document Firestore créé automatiquement
await firestore.collection('users').doc('abc123xyz').set({
  isGuest: true,
  activePrograms: [],
  programs: {}
});
```

**Données stockées normalement** :
- ✅ Workouts sessions → `workoutSessions/{sessionId}` avec `userId: "abc123xyz"`
- ✅ Progression → `users/abc123xyz/programs/{programId}`
- ✅ Challenges → `dailyChallenges/{date}/users/abc123xyz`

---

### 2. **Connexion avec téléphone (Phone Auth)**

Quand l'invité décide de se connecter avec son téléphone :

#### Cas A : **Linking réussi** (numéro jamais utilisé)

```javascript
// AuthContext.js - verifyCode()
if (currentUser && currentUser.isAnonymous) {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  
  // LINKING : L'UID reste le même !
  const linkedUser = await currentUser.linkWithCredential(credential);
  // UID toujours : "abc123xyz"
  
  // Mise à jour Firestore avec MERGE
  await firestore.collection('users').doc('abc123xyz').set({
    phoneNumber: '+33679430759',
    isGuest: false
  }, { merge: true }); // ← CRUCIAL : préserve activePrograms, programs, etc.
}
```

**Résultat** :
- ✅ **Même UID** → Toutes les données restent intactes
- ✅ `isGuest: false` → Compte authentifié
- ✅ `phoneNumber` ajouté
- ✅ Workouts, progression, challenges **préservés automatiquement**

---

#### Cas B : **Numéro déjà utilisé** (compte existant)

Si le numéro est déjà lié à un autre compte :

```javascript
// AuthContext.js - verifyCode()
catch (linkError) {
  if (linkError.code === 'auth/credential-already-in-use') {
    // ABANDON du compte anonymous
    await auth.signOut();
    
    // CONNEXION au compte existant
    const userCredential = await confirmation.confirm(code);
    // UID change : "def456uvw" (compte existant)
    
    // L'utilisateur perd les données du mode invité
    // Car on switche vers un compte différent
  }
}
```

**Résultat** :
- ⚠️ **UID différent** → Données anonymous perdues
- ✅ Connexion au compte existant
- ℹ️ Message : "Connecté à votre compte existant"

---

## 🧪 Scénarios de test

### Scénario 1 : Invité → Compte (linking)

```
1. Lance l'app → Mode invité (UID: abc123)
2. Fait 3 workouts → Sauvés dans workoutSessions
3. Complète un challenge → Sauvé dans dailyChallenges
4. Se connecte avec +33679430759
5. ✅ Linking réussi → Même UID (abc123)
6. ✅ Tous les workouts + challenge préservés
```

### Scénario 2 : Invité → Compte existant

```
1. Lance l'app → Mode invité (UID: abc123)
2. Fait 2 workouts
3. Se connecte avec +33679430759 (déjà utilisé ailleurs)
4. ⚠️ Connexion au compte existant (UID: def456)
5. ❌ Les 2 workouts du mode invité sont perdus
6. ✅ Accès aux données du compte existant
```

---

## 🔧 Implémentation technique

### Fichiers concernés

1. **`src/contexts/AuthContext.js`**
   - `startGuestMode()` : Crée compte anonymous
   - `verifyCode()` : Gère le linking ou connexion existante

2. **`src/contexts/ChallengeContext.js`**
   - `submitChallenge()` : Sauvegarde avec `user.uid` (fonctionne pour invité et authentifié)

3. **`src/contexts/WorkoutContext.js`**
   - `saveWorkoutSession()` : Sauvegarde avec `user.uid`

### Points critiques

```javascript
// ✅ BON : Utilise merge pour préserver les données
await firestore.collection('users').doc(uid).set({
  phoneNumber: phone,
  isGuest: false
}, { merge: true });

// ❌ MAUVAIS : Écrase toutes les données
await firestore.collection('users').doc(uid).set({
  phoneNumber: phone,
  isGuest: false
});
```

---

## 📝 Logs pour debugging

```javascript
// Avant linking
LOG: 👤 Mode: INVITÉ (anonymous)
LOG: 🆔 UID: abc123xyz
LOG: 📊 Active programs: ["street"]

// Après linking
LOG: 🔗 Linking phone credential to anonymous account...
LOG: ✅ Phone linked! UID reste le même: abc123xyz
LOG: ✅ LINKING COMPLETE - Données préservées automatiquement
LOG: 👤 Mode: AUTHENTIFIÉ (phone)
LOG: 🆔 UID: abc123xyz (IDENTIQUE)
LOG: 📊 Active programs: ["street"] (PRÉSERVÉ)
```

---

## 🚨 Limitations connues

1. **Cas B (compte existant)** : Données anonymous perdues
   - **Solution future** : Implémenter une migration manuelle des données
   - Demander à l'utilisateur s'il veut fusionner ou abandonner

2. **Pas de migration automatique**
   - Si l'utilisateur a des données sur les 2 comptes, il faut choisir

3. **Challenges en mode invité**
   - ✅ Maintenant autorisé
   - ⚠️ Mais risque de perte si connexion à compte existant

---

## 🔐 Sécurité Firestore

Les règles Firestore permettent aux anonymous users d'écrire :

```javascript
// firestore.rules
match /{document=**} {
  allow read, write: if request.auth != null;
  // ↑ Inclut les anonymous users (request.auth.uid existe)
}
```

---

## ✅ Checklist développeur

Avant de modifier le système d'auth :

- [ ] Vérifier que `{ merge: true }` est utilisé
- [ ] Tester le linking avec un nouveau numéro
- [ ] Tester le linking avec un numéro existant
- [ ] Vérifier que les workouts/challenges sont préservés
- [ ] Logger l'UID avant/après pour comparer

---

## 📚 Ressources

- [Firebase Anonymous Auth](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Firebase Phone Auth](https://firebase.google.com/docs/auth/web/phone-auth)
- [Link Accounts](https://firebase.google.com/docs/auth/web/account-linking)
