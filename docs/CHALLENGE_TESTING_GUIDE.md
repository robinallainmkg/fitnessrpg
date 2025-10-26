# Guide de Test Local - Challenge System

## Configuration

Le Challenge System peut fonctionner en **mode MOCK** pour tester localement sans Firebase.

### Activer le Mode Mock

Dans `src/contexts/ChallengeContext.tsx` :

```typescript
const USE_MOCK_SERVICES = true; // ✅ Mode mock activé
```

**Avantages du mode mock :**
- ✅ Aucune connexion Firebase requise
- ✅ Données stockées en AsyncStorage (persistantes entre sessions)
- ✅ Upload vidéo simulé avec progression (2 secondes)
- ✅ Tous les flows fonctionnent (submission, admin review, XP)

---

## Procédure de Test

### 1. Préparer l'App

```bash
# Installer les dépendances
npm install

# Lancer l'app
npx expo start
```

Choisir Android/iOS emulator ou appareil physique

---

### 2. Test: Défi du Jour

**Actions :**
1. Ouvrir l'app → Onglet **"DÉFI"**
2. Observer le challenge généré aléatoirement (ex: "50 Pompes Non-Stop")
3. Vérifier l'affichage :
   - Nom du défi
   - XP potentiel (ex: 100 XP)
   - Instructions
   - Bouton "Enregistrer une Vidéo"

**Vérifications :**
- ✅ Challenge différent chaque jour (AsyncStorage: `@mock:daily_challenges_{userId}_{date}`)
- ✅ Message si mode invité : "Connectez-vous pour participer"

**Logs attendus :**
```
[ChallengeContext] Loading challenge for date: 2025-10-26
🎭 [MOCK] Getting daily challenge for: mock_user_123 2025-10-26
✅ [MOCK] Created new challenge: 50_pushups_unbroken
[ChallengeContext] ✅ Today challenge loaded: 50_pushups_unbroken
```

---

### 3. Test: Enregistrement Vidéo

**Actions :**
1. Appuyer sur "Enregistrer une Vidéo"
2. Autoriser permissions caméra (popup système)
3. Caméra s'ouvre → Appuyer bouton rouge pour commencer
4. Enregistrer ~5-10 secondes
5. Appuyer à nouveau pour arrêter

**Vérifications :**
- ✅ Permissions caméra demandées correctement
- ✅ Enregistrement max 5 minutes (protection)
- ✅ Preview vidéo s'affiche après enregistrement
- ✅ Boutons "Soumettre" et "Recommencer" visibles

**Logs attendus :**
```
[useCamera] Camera permissions granted
[useCamera] Starting recording...
[useCamera] Recording stopped, URI: file:///...
```

**⚠️ Note :** Si erreur "CameraView recording not supported", c'est normal (expo-camera v17+ API change). La vidéo locale est quand même disponible pour upload.

---

### 4. Test: Soumission avec Upload Progressif

**Actions :**
1. Après enregistrement → Appuyer **"Soumettre"**
2. Observer la barre de progression (0% → 100%)
3. Attendre message de confirmation

**Vérifications :**
- ✅ Barre de progression animée (2 secondes en mock)
- ✅ Message : "✅ Challenge soumis ! En attente de validation."
- ✅ Bouton "Soumettre" désactivé après soumission
- ✅ Message "Déjà soumis aujourd'hui" si on réessaye

**Logs attendus :**
```
[ChallengeContext] Starting challenge submission...
🎭 [MOCK] Starting video upload simulation
  📊 Upload progress: 0%
  📊 Upload progress: 10%
  ...
  📊 Upload progress: 100%
✅ [MOCK] Upload complete (simulated)
🎭 [MOCK] Creating submission
✅ [MOCK] Submission created: mock_1730000000_1
🎭 [MOCK] Marking challenge as submitted
✅ [MOCK] Stats updated: { totalChallengesSubmitted: 1, ... }
[ChallengeContext] ✅ Challenge submission complete
```

**Données AsyncStorage créées :**
- `@mock:submissions` : Liste des soumissions
- `@mock:daily_challenges_{userId}_{date}` : Challenge marqué `submitted: true`
- `@mock:user_stats_{userId}` : Stats incrémentées

---

### 5. Test: Admin Review

**Actions :**
1. Aller dans **Profil** (onglet bas)
2. Scroll vers le bas → Appuyer **"🔍 Validation Défis"** 
   _(Note: Visible pour tous en mode mock, pas de vérification `isAdmin`)_
3. Voir la liste des soumissions en attente

**Vérifications :**
- ✅ Card avec preview vidéo (thumbnail)
- ✅ Nom du challenge (ex: "50 Pompes Non-Stop")
- ✅ Date/heure de soumission
- ✅ Boutons "✅ Approuver" et "❌ Rejeter"

---

### 6. Test: Approbation

**Actions :**
1. Dans AdminReviewScreen → Appuyer **"✅ Approuver"**
2. Confirmer dans l'alerte
3. Observer la disparition de la card

**Vérifications :**
- ✅ Card disparaît de la liste
- ✅ Toast : "✅ Soumission approuvée !"
- ✅ XP récompensé (vérifié dans logs, pas de UI XP dans mock)

**Logs attendus :**
```
🎭 [MOCK] Approving submission: mock_1730000000_1
✅ [MOCK] Submission approved, XP: 100
🎭 [MOCK] Updating user stats: approved
✅ [MOCK] Stats updated: { totalChallengesApproved: 1, ... }
🎭 [MOCK] Rewarding XP: { userId: '...', xp: 100 }
✅ [MOCK] XP reward simulated
```

**Données AsyncStorage modifiées :**
- `@mock:submissions` : Status changé à `approved`, `xpRewarded: 100`
- `@mock:user_stats_{userId}` : `totalChallengesApproved` incrémenté

---

### 7. Test: Rejet avec Raison

**Actions :**
1. Soumettre un nouveau challenge (lendemain ou reset data)
2. Dans AdminReviewScreen → Appuyer **"❌ Rejeter"**
3. Modal s'ouvre → Saisir raison : "Vidéo floue"
4. Appuyer "Confirmer le rejet"

**Vérifications :**
- ✅ Modal avec input texte
- ✅ Card disparaît après confirmation
- ✅ Toast : "Soumission rejetée"

**Logs attendus :**
```
🎭 [MOCK] Rejecting submission: mock_1730000000_2 reason: Vidéo floue
✅ [MOCK] Submission rejected
```

**Données AsyncStorage modifiées :**
- `@mock:submissions` : Status changé à `rejected`, `reason: "Vidéo floue"`

---

## Scénarios de Test Avancés

### Test 1: Rotation Quotidienne

**Objectif :** Vérifier qu'un nouveau défi apparaît chaque jour

**Méthode :**
1. Soumettre un challenge aujourd'hui
2. Changer la date système à demain
3. Relancer l'app → Onglet "DÉFI"
4. Vérifier : Nouveau challenge affiché, bouton "Enregistrer" réactivé

**Ou :** Reset les données (voir section Reset ci-dessous)

---

### Test 2: Mode Invité Bloqué

**Objectif :** Vérifier que les invités ne peuvent pas soumettre

**Méthode :**
1. Se déconnecter (mode invité)
2. Aller dans "DÉFI"
3. Vérifier : Message "Connectez-vous pour participer aux défis quotidiens"

---

### Test 3: Upload Échoué (Simulation Erreur)

**Objectif :** Tester la gestion d'erreur

**Méthode :**
1. Modifier temporairement `MockStorageService.uploadChallengeVideo` :
   ```typescript
   throw new Error('Erreur réseau simulée');
   ```
2. Tenter de soumettre un challenge
3. Vérifier : Message d'erreur affiché "Erreur lors de la soumission"

---

## Reset des Données Mock

Pour repartir de zéro pendant les tests :

**Option 1: Via Code (ajouter un bouton debug)**

```typescript
import { resetMockData } from '../services/MockChallengeService';

// Dans un bouton debug
<Button onPress={async () => {
  await resetMockData();
  console.log('✅ Mock data reset');
}}>
  Reset Mock Data
</Button>
```

**Option 2: Via Console Developer**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supprimer toutes les données mock
const keys = await AsyncStorage.getAllKeys();
const mockKeys = keys.filter(k => k.startsWith('@mock:'));
await AsyncStorage.multiRemove(mockKeys);
console.log('✅ Cleared:', mockKeys.length, 'keys');
```

**Option 3: Réinstaller l'app** (supprime tout AsyncStorage)

---

## Passer en Mode Firebase (Production)

Une fois les tests locaux OK, pour utiliser les vrais services Firebase :

### 1. Modifier ChallengeContext.tsx

```typescript
const USE_MOCK_SERVICES = false; // ❌ Mode mock désactivé
```

### 2. Configurer Firebase

Suivre le guide : `docs/setup/FIREBASE_CHALLENGE_SETUP.md`

- Activer Storage
- Configurer Security Rules
- Ajouter `isAdmin: true` à un user

### 3. Tester en Production

Refaire tous les tests ci-dessus, mais cette fois :
- Vidéos uploadées sur Firebase Storage
- Soumissions créées dans Firestore `/submissions`
- Daily challenges dans `/dailyChallenges/{date}/{userId}`
- XP vraiment ajouté au profil utilisateur

---

## Checklist Complète

- [ ] Challenge du jour s'affiche (random)
- [ ] Permissions caméra accordées
- [ ] Enregistrement vidéo (5-10s)
- [ ] Preview vidéo après enregistrement
- [ ] Upload progressif (barre 0-100%)
- [ ] Message confirmation "soumis"
- [ ] Blocage "déjà soumis" si on réessaye
- [ ] AdminReviewScreen liste les soumissions
- [ ] Approbation fonctionne (card disparaît)
- [ ] Rejet fonctionne (avec raison)
- [ ] Logs console corrects à chaque étape
- [ ] Pas de crash/erreur JavaScript
- [ ] Mode invité bloqué correctement

---

## Problèmes Connus

### 1. Recording API expo-camera v17

**Symptôme :** `useCamera.ts` peut ne pas fonctionner sur tous appareils

**Solution temporaire :** L'upload mock utilise l'URI local, donc même sans vrai enregistrement, le flow complet peut être testé

**Fix production :** Adapter `useCamera.ts` selon [expo-camera docs v17](https://docs.expo.dev/versions/latest/sdk/camera/)

### 2. TypeScript Warnings

**Symptôme :** `as any` utilisé dans plusieurs endroits

**Impact :** Aucun (code fonctionne), juste perte de type safety temporaire

**Fix futur :** Aligner types ChallengeSubmission entre services mock/real

---

## Support

**Logs utiles :**
- Tous les logs préfixés `[ChallengeContext]`
- Logs mock préfixés `🎭 [MOCK]`
- Logs camera préfixés `[useCamera]`

**AsyncStorage Explorer :**
- Installer Reactotron ou Flipper pour voir le contenu AsyncStorage en direct
- Ou utiliser : `npx react-native log-android` / `log-ios`

**Firebase Debugging (mode production uniquement) :**
- Firebase Console → Storage → Vérifier uploads
- Firestore → Collections `submissions`, `dailyChallenges`
