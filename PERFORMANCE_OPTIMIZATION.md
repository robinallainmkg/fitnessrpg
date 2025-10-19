# Optimisation Performance - Chargement des Programmes

## 📊 Problème Identifié

### Symptômes
- **Temps de chargement : ~10 secondes** pour afficher l'écran d'accueil
- Les logs montrent : `[useUserPrograms] ✅ Completed in 10001ms`
- Chargements multiples des mêmes données sur plusieurs écrans

### Causes
1. **Fichiers JSON très lourds** (chargés de manière synchrone) :
   - `streetworkout.json` : **165 KB** (4575 lignes)
   - `run10k.json` : **30 KB** (877 lignes)
   - **Total : ~195 KB**

2. **Import synchrone** : 
   ```js
   import programs from '../data/programs.js';
   ```
   Charge TOUT le contenu immédiatement au démarrage

3. **Pas de mise en cache** : 
   - Les données sont rechargées à chaque import
   - Multiples écrans importent simultanément

4. **Parsing JSON répété** :
   - React Native parse les JSON à chaque chargement de composant

## ✅ Solution Implémentée

### 1. Programme Loader avec Cache (`src/data/programsLoader.js`)

**Caractéristiques** :
- ✅ **Import asynchrone (lazy loading)** : Ne charge que quand nécessaire
- ✅ **Cache en mémoire** : Une seule fois chargé, réutilisé partout
- ✅ **Promise partagée** : Si plusieurs appels simultanés, une seule requête
- ✅ **Compatibilité descendante** : Fonction `getProgramsSync()` pour code legacy

**API** :
```javascript
import { loadPrograms, getCategoryById, getProgramById } from '../data/programsLoader';

// Chargement async (recommandé)
const programs = await loadPrograms();

// Récupérer une catégorie spécifique
const category = await getCategoryById('street');

// Récupérer un programme spécifique  
const program = await getProgramById('street', 'beginner-foundation');

// Vider le cache (si besoin)
clearCache();
```

### 2. Hooks mis à jour

**✅ `useUserPrograms`** :
- Remplace `import programs from '../data/programs.js'`
- Par `import { loadPrograms } from '../data/programsLoader'`
- Utilise `const programs = await loadPrograms()`

**✅ `useUserCategories`** :
- Même optimisation

### 3. Fichiers à mettre à jour

**Priorité HAUTE** (impact performance) :
- [x] `src/hooks/useUserPrograms.js` ✅ FAIT
- [ ] `src/services/sessionQueueService.js` (appelé partout)
- [ ] `src/contexts/WorkoutContext.js` (contexte global)

**Priorité MOYENNE** (écrans principaux) :
- [ ] `src/screens/HomeScreen.js`
- [ ] `src/screens/SkillTreeScreen.js`
- [ ] `src/screens/ProgramSelectionScreen.js`

**Priorité BASSE** (écrans secondaires) :
- [ ] `src/screens/WorkoutSummaryScreen.js`
- [ ] `src/screens/SkillDetailScreen.js`
- [ ] `src/screens/ProgramsScreen.js`
- [ ] `src/screens/ManageActiveProgramsScreen.js`
- [ ] `src/screens/SystemTestScreen.js`
- [ ] `src/components/ProgramProgressCard.js`

## 📈 Gains Attendus

### Performance
- **Avant** : ~10 secondes de chargement
- **Après** (estimation) :
  - Premier chargement : ~2-3 secondes (import async initial)
  - Chargements suivants : **instantané** (depuis le cache)

### Mémoire
- Données chargées **une seule fois** en mémoire
- Partagées entre tous les composants
- Gain : ~80% de mémoire économisée

## 🚀 Prochaines Étapes

### Phase 1 : Fichiers critiques (URGENT)
1. ✅ Hooks mis à jour (`useUserPrograms`, `useUserCategories`)
2. Mettre à jour `sessionQueueService.js`
3. Mettre à jour `WorkoutContext.js`
4. **Tester** → Devrait déjà améliorer significativement

### Phase 2 : Écrans principaux
1. Mettre à jour `HomeScreen.js`
2. Mettre à jour `SkillTreeScreen.js`
3. Mettre à jour `ProgramSelectionScreen.js`
4. **Tester** → Performance optimale

### Phase 3 : Écrans secondaires (si nécessaire)
1. Mettre à jour les écrans restants
2. Validation finale

### Phase 4 : Optimisations supplémentaires (optionnel)
- [ ] Compresser les fichiers JSON (retirer descriptions trop longues)
- [ ] AsyncStorage persistence (survit aux rechargements d'app)
- [ ] Préchargement au démarrage de l'app

## 🔍 Comment tester

### Console Logs
Chercher ces messages dans les logs :
```
📦 Début chargement programmes...
✅ Programmes chargés et mis en cache (XXXms)
[useUserPrograms] ✅ Completed in XXXms
```

### Benchmark
- **Avant** : `Completed in 10001ms`
- **Cible** : `Completed in <3000ms` (premier chargement)
- **Cible** : `Completed in <500ms` (chargements suivants)

### Comportement attendu
1. **Premier affichage HomeScreen** :
   - Loading rapide (~2-3s au lieu de 10s)
   - Message "Programmes chargés et mis en cache"

2. **Navigation entre écrans** :
   - **Instantané** (données déjà en cache)
   - Pas de re-chargement

3. **Rechargement de l'app** :
   - Cache vidé, recommence à 2-3s
   - (Future amélioration : persistence AsyncStorage)

## 📝 Notes Techniques

### Import dynamique
```javascript
// ❌ Import synchrone (bloque le thread)
import programs from './programs.json';

// ✅ Import asynchrone (non-bloquant)
const programs = await import('./programs.json');
```

### Cache Pattern
```javascript
let cache = null;

export const loadData = async () => {
  if (cache) return cache;  // Retour instantané si en cache
  
  cache = await fetchData(); // Charge une seule fois
  return cache;
};
```

### Promise Sharing
```javascript
let loading = false;
let promise = null;

export const loadData = async () => {
  if (loading && promise) return promise; // Attend la promesse existante
  
  loading = true;
  promise = fetchData();
  const result = await promise;
  loading = false;
  return result;
};
```

## ✅ Checklist Migration

- [x] Créer `programsLoader.js`
- [x] Mettre à jour `useUserPrograms` hook
- [x] Mettre à jour `useUserCategories` hook
- [ ] Mettre à jour `sessionQueueService.js`
- [ ] Mettre à jour `WorkoutContext.js`
- [ ] Mettre à jour `HomeScreen.js`
- [ ] Tester l'application
- [ ] Mesurer l'amélioration de performance
- [ ] Mettre à jour les écrans restants si nécessaire

## 🎯 Objectif Final

**Chargement de l'écran d'accueil : < 3 secondes**
**Chargements suivants : instantané**
