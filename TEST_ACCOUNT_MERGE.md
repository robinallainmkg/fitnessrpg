# Test de Fusion de Comptes

## 🧪 Scénario de test

### Configuration initiale

**Compte Invité** (UID: `guest123`)
```json
{
  "isGuest": true,
  "globalXP": 500,
  "globalLevel": 2,
  "activePrograms": ["street"],
  "programs": {
    "street": {
      "xp": 300,
      "level": 2,
      "completedSkills": ["beginner-foundation"]
    }
  },
  "stats": {
    "strength": 10,
    "endurance": 8,
    "power": 5,
    "speed": 3,
    "flexibility": 2
  }
}
```

**Workouts Invité** : 3 sessions
```json
[
  { "id": "w1", "userId": "guest123", "xp": 150, "programId": "street" },
  { "id": "w2", "userId": "guest123", "xp": 200, "programId": "street" },
  { "id": "w3", "userId": "guest123", "xp": 150, "programId": "street" }
]
```

---

**Compte Existant** (UID: `existing456`, tel: +33679430759)
```json
{
  "phoneNumber": "+33679430759",
  "isGuest": false,
  "globalXP": 1200,
  "globalLevel": 3,
  "activePrograms": ["running"],
  "programs": {
    "running": {
      "xp": 600,
      "level": 3,
      "completedSkills": ["base-i", "base-ii"]
    }
  },
  "stats": {
    "strength": 5,
    "endurance": 15,
    "power": 3,
    "speed": 12,
    "flexibility": 4
  }
}
```

**Workouts Existant** : 5 sessions
```json
[
  { "id": "w4", "userId": "existing456", "xp": 250, "programId": "running" },
  { "id": "w5", "userId": "existing456", "xp": 300, "programId": "running" },
  ...
]
```

---

## ✅ Résultat Attendu Après Fusion

**Compte Final** (UID: `existing456`)
```json
{
  "phoneNumber": "+33679430759",
  "isGuest": false,
  "globalXP": 1700,        // 1200 + 500 ✅
  "globalLevel": 3,         // max(3, 2) ✅
  "activePrograms": ["running", "street"],  // Fusionné ✅
  "programs": {
    "running": {
      "xp": 600,
      "level": 3,
      "completedSkills": ["base-i", "base-ii"]
    },
    "street": {             // Ajouté depuis invité ✅
      "xp": 300,
      "level": 2,
      "completedSkills": ["beginner-foundation"]
    }
  },
  "stats": {
    "strength": 10,         // max(5, 10) ✅
    "endurance": 15,        // max(15, 8) ✅
    "power": 5,             // max(3, 5) ✅
    "speed": 12,            // max(12, 3) ✅
    "flexibility": 4        // max(4, 2) ✅
  },
  "mergedFrom": "guest123",
  "lastMerge": "2025-11-01T..."
}
```

**Workouts Final** : 8 sessions (5 + 3)
```json
[
  // Workouts existants (inchangés)
  { "id": "w4", "userId": "existing456", "xp": 250 },
  { "id": "w5", "userId": "userId": "existing456", "xp": 300 },
  ...
  
  // Workouts invité (transférés) ✅
  { 
    "id": "w1", 
    "userId": "existing456",     // Changé ✅
    "xp": 150,
    "mergedFrom": "guest123",    // Traçabilité ✅
    "mergedAt": "2025-11-01T..."
  },
  { "id": "w2", "userId": "existing456", "mergedFrom": "guest123" },
  { "id": "w3", "userId": "existing456", "mergedFrom": "guest123" }
]
```

---

## 📊 Logs Attendus

```
LOG: ⚠️ Numéro déjà utilisé - FUSION des comptes invité + existant...
LOG: 📦 UID invité à fusionner: guest123
LOG: 📊 Données invité récupérées: 3 workouts, 1 programmes
LOG: ✅ Connecté au compte existant: existing456
LOG: 🔄 Fusion en cours...
LOG: 📋 Transfert de 3 workouts...
LOG: ✅ FUSION COMPLÈTE: 3 workouts transférés, XP: 500 → 1700
```

**Message utilisateur** :
```
✅ Compte fusionné ! 3 workout(s) et 500 XP ajoutés.
```

---

## 🧪 Comment tester

### Méthode 1 : Avec l'app

1. **Créer compte invité**
   ```
   - Lance l'app
   - Ne te connecte pas (mode invité automatique)
   - Fais 2-3 workouts
   - Note l'XP gagné
   ```

2. **Se connecter avec numéro existant**
   ```
   - Va dans Profil
   - Clique "Se connecter avec téléphone"
   - Entre ton numéro déjà utilisé (+33679430759)
   - Entre le code SMS
   ```

3. **Vérifier la fusion**
   ```
   - Va dans Progression
   - ✅ Tu devrais voir TOUS les workouts (invité + existant)
   - ✅ XP total = XP ancien + XP invité
   - ✅ Programmes actifs fusionnés
   ```

### Méthode 2 : Avec les logs

```bash
# Dans Metro bundler
adb logcat | grep -E "FUSION|Transfert|mergedFrom"
```

Cherche :
```
✅ FUSION COMPLÈTE: X workouts transférés, XP: Y → Z
```

### Méthode 3 : Firestore Console

1. Ouvre [Firebase Console](https://console.firebase.google.com/project/hybridrpg-53f62/firestore)
2. Va dans `users/{userId}`
3. Vérifie les champs :
   - ✅ `mergedFrom` existe
   - ✅ `globalXP` a augmenté
   - ✅ `activePrograms` contient les 2 programmes

4. Va dans `workoutSessions`
5. Vérifie que les workouts invité ont :
   - ✅ `userId` changé vers le compte existant
   - ✅ `mergedFrom` présent
   - ✅ `mergedAt` timestamp

---

## ⚠️ Edge Cases à tester

### Cas 1 : Invité sans données
```
Invité: 0 workouts, 0 XP
Existant: 10 workouts, 2000 XP
→ Résultat: 10 workouts, 2000 XP (pas de changement)
```

### Cas 2 : Programme en commun
```
Invité: street niveau 2
Existant: street niveau 5
→ Résultat: street niveau 5 gardé (pas d'override)
```

### Cas 3 : Stats contradictoires
```
Invité: strength 20
Existant: strength 5
→ Résultat: strength 20 (max gardé)
```

---

## 🐛 Problèmes potentiels

### 1. Batch limit Firebase
- Batch = 500 opérations max
- Si >500 workouts, le batch va échouer
- **Solution** : Découper en plusieurs batches

### 2. Race condition
- Si 2 connexions simultanées
- **Solution** : Transaction Firestore (à implémenter)

### 3. Challenges du jour
- Pas encore transférés dans le code actuel
- **TODO** : Ajouter transfert des challenges

---

## 📝 Checklist Validation

Avant de merger en production :

- [ ] Testé avec 0 workout invité
- [ ] Testé avec 1-5 workouts invité
- [ ] Testé avec programmes en commun
- [ ] Testé avec stats contradictoires
- [ ] Vérifié logs de fusion
- [ ] Vérifié Firestore après fusion
- [ ] Vérifié XP total correct
- [ ] Vérifié écran Progression affiche tout
- [ ] Testé avec >500 workouts (edge case)
- [ ] Documenté dans ACCOUNT_LINKING.md

---

## 🚀 Prochaines étapes

1. **Transférer les challenges**
   ```javascript
   // À ajouter dans la fusion
   const guestChallenges = await firestore
     .collection('dailyChallenges')
     .where('userId', '==', guestUid)
     .get();
   ```

2. **UI de confirmation**
   ```
   "Vous avez des données en mode invité. 
    Voulez-vous les fusionner avec votre compte existant ?"
   [Fusionner] [Abandonner]
   ```

3. **Nettoyage**
   ```javascript
   // Optionnel : Supprimer le document invité après fusion
   await firestore.collection('users').doc(guestUid).delete();
   ```
