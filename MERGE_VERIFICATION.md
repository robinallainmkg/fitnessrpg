# ✅ Vérification de la Fusion des Comptes

## 📋 Checklist de Test

### Test 1 : Fusion basique
```
□ Créer compte invité
□ Faire 2 workouts (noter XP)
□ Se connecter avec numéro existant
□ Vérifier message "Compte fusionné ! X workout(s)..."
□ Vérifier Progression → tous les workouts visibles
□ Vérifier XP total = ancien + nouveau
```

### Test 2 : Fusion avec challenges
```
□ Créer compte invité
□ Compléter un challenge du jour
□ Se connecter avec numéro existant
□ Vérifier message inclut "X challenge(s)"
□ Vérifier dans Firebase que le challenge est transféré
```

### Test 3 : Fusion avec programmes communs
```
□ Compte invité : activer "street"
□ Compte existant : déjà "street" actif
□ Fusionner
□ Vérifier que "street" n'est pas dupliqué
□ Vérifier que le niveau le plus haut est gardé
```

### Test 4 : Stats fusion
```
□ Invité : strength 15, endurance 5
□ Existant : strength 8, endurance 20
□ Fusionner
□ Vérifier : strength 15 (max), endurance 20 (max)
```

---

## 🔍 Points de vérification Firestore

### Document utilisateur fusionné
```javascript
users/{existingUid}/
  ├── globalXP: (somme des deux comptes)
  ├── globalLevel: (max des deux)
  ├── activePrograms: [array fusionné sans doublons]
  ├── programs: {objet fusionné}
  ├── stats: {chaque stat = max des deux}
  ├── mergedFrom: "guestUid"
  └── lastMerge: Timestamp
```

### Workouts transférés
```javascript
workoutSessions/{workoutId}/
  ├── userId: "existingUid" (CHANGÉ)
  ├── mergedFrom: "guestUid" (AJOUTÉ)
  └── mergedAt: Timestamp (AJOUTÉ)
```

### Challenges transférés
```javascript
dailyChallenges/{date}/users/{existingUid}/
  ├── challengeType: "..."
  ├── submitted: true
  ├── videoUrl: "..."
  ├── mergedFrom: "guestUid" (AJOUTÉ)
  └── mergedAt: Timestamp (AJOUTÉ)
```

---

## 🐛 Problèmes possibles

### Erreur : "Batch too large"
- **Cause** : Plus de 500 opérations (workouts + challenges)
- **Solution** : Découper en plusieurs batches
- **Status** : ⚠️ À implémenter si nécessaire

### Erreur : Challenge déjà existant
- **Comportement** : Skip avec log "⏭️ Challenge {date} déjà existant"
- **Status** : ✅ Géré

### XP incorrect
- **Vérifier** : `mergedXP = (existing.globalXP || 0) + (guest.globalXP || 0)`
- **Logs** : `XP: 500 → 1200` (ancien → nouveau)

---

## 📊 Logs de Debug

Chercher dans Metro :
```bash
⚠️ Numéro déjà utilisé - FUSION des comptes invité + existant...
📦 UID invité à fusionner: xxx
📊 Données invité récupérées: X workouts, Y challenges, Z programmes
✅ Connecté au compte existant: yyy
🔄 Fusion en cours...
📋 Transfert de X workouts et Y challenges...
⏭️ Challenge 2025-11-01 déjà existant, skip
✅ FUSION COMPLÈTE: X workouts + Y challenges transférés, XP: A → B
```

---

## ✅ Validation Finale

### Console Firestore
1. Ouvrir [Firebase Console](https://console.firebase.google.com/project/hybridrpg-53f62/firestore)
2. Chercher `users/{existingUid}`
3. Vérifier présence de :
   - `mergedFrom` field
   - `lastMerge` timestamp
   - `globalXP` augmenté

### Écran App
1. **Progression** : Tous les workouts visibles
2. **Profil** : XP total correct
3. **Programmes** : Tous les programmes actifs visibles
4. **Challenge** : Historique complet

---

## 🚀 Améliorations futures

### UI de confirmation
```jsx
<Alert>
  Vous avez {guestWorkouts.length} workout(s) et {guestXP} XP en mode invité.
  Voulez-vous les fusionner avec votre compte existant ?
  
  [Fusionner] [Abandonner]
</Alert>
```

### Migration asynchrone
```javascript
// Pour >500 items, faire en arrière-plan
await migrateGuestDataInBackground(guestUid, existingUid);
// Montrer progress bar
```

### Nettoyage compte invité
```javascript
// Optionnel : après fusion réussie
await firestore.collection('users').doc(guestUid).delete();
// Garder trace dans un champ "deletedAccounts"
```
