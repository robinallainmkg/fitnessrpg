# Optimisation du Chargement des Programmes - Résumé

## 🎯 Objectif
Réduire le temps de chargement de l'écran d'accueil de **~10 secondes** à **<1 seconde**.

## 📊 Problème Initial
- **190KB de JSON** chargés de manière synchrone au démarrage
  - `streetworkout.json`: 165KB (22 programmes avec tous les niveaux et exercices)
  - `run10k.json`: 30KB (5 programmes)
- Tous les imports synchrones chargeaient les données complètes
- Aucun cache, multiples chargements simultanés

## 💡 Solution Implémentée

### 1. Split des Données (89.1% de réduction)
```
Avant:
├── streetworkout.json (165KB) - Tout
├── run10k.json (30KB) - Tout
└── programs.js - Combine les deux

Après:
├── programs-meta.json (21KB) ← MÉTADONNÉES UNIQUEMENT
├── programDetails/
│   ├── streetworkout-details.json (120KB) ← DÉTAILS COMPLETS
│   └── run10k-details.json (21KB) ← DÉTAILS COMPLETS
└── programs.js - Pointe vers programs-meta.json
```

### 2. Structure des Métadonnées (21KB)
**Contenu inclus:**
- `id`, `name`, `difficulty`, `icon`, `color`
- `position`, `tier`, `prerequisites`, `unlocks`
- `totalWeeks`, `totalLevels`, `xpReward`, `statBonuses`
- `shortDescription`

**Contenu EXCLU:**
- `description` (longue)
- `levels[]` (détails de tous les niveaux)
- `exercises[]` (tous les exercices)
- `tips` et conseils détaillés

### 3. Architecture de Chargement

#### Niveau 1: Métadonnées (Immédiat)
```javascript
// Au démarrage de l'app - 21KB seulement
import programs from '../data/programs.js';
// OU (async)
const programs = await loadProgramsMeta();
```

#### Niveau 2: Détails (Lazy Loading)
```javascript
// Quand l'utilisateur ouvre un programme
import { getCategoryWithDetails } from '../utils/programLoader';
const category = await getCategoryWithDetails('street');
```

#### Niveau 3: Cache Intelligent
- Cache en mémoire après premier chargement
- Partage des promises pour éviter les chargements multiples
- Préchargement optionnel en arrière-plan

## 🔧 Fichiers Modifiés

### Fichiers de Données
1. **`src/data/programs.js`**
   - Avant: Chargeait `streetworkout.json` + `run10k.json` (190KB)
   - Après: Charge uniquement `programs-meta.json` (21KB)
   - Impact: Tous les imports synchrones maintenant légers

2. **`src/data/programsLoader.js`** (NOUVEAU)
   - `loadProgramsMeta()` - Charge métadonnées avec cache
   - `loadCategoryDetails(id)` - Lazy load des détails
   - `loadFullProgram(cat, prog)` - Fusionne meta + détails
   - Gestion de cache avec partage de promises

3. **`src/utils/programLoader.js`** (NOUVEAU)
   - `getProgramWithDetails(cat, prog)` - Helper avec cache
   - `getCategoryWithDetails(cat)` - Catégorie complète
   - `preloadCategoryDetails(cat)` - Préchargement
   - Cache persistant en mémoire

### Services Mis à Jour
4. **`src/services/sessionQueueService.js`**
   - `generateInitialQueue()`: maintenant `async`
   - `generateAvailableSessions()`: maintenant `async`
   - Utilise `getCategoryWithDetails()` au lieu de `programs`
   - Impact: Les détails ne sont chargés que lors de la création de sessions

5. **`src/contexts/WorkoutContext.js`**
   - Importe `programsMeta` au lieu de `programsData`
   - Utilise uniquement les métadonnées (nom des programmes débloqués)
   - Impact: Pas de chargement lourd dans le contexte

### Hooks Optimisés
6. **`src/hooks/useUserPrograms.js`**
   - Utilise `loadPrograms()` (async)
   - Bénéficie du cache du loader
   - Impact: Un seul chargement par session

## 📈 Résultats Attendus

### Avant
```
Chargement initial: 10 secondes
Taille chargée: 190KB (synchrone)
Cache: Aucun
```

### Après
```
Chargement initial: <1 seconde  ✅ (-90%)
Taille initiale: 21KB           ✅ (-89.1%)
Cache: Intelligent avec partage
Détails: Chargés à la demande (141KB)
```

## 🔍 Stratégie de Chargement

### Au Démarrage (HomeScreen)
1. **Métadonnées chargées** (21KB)
   - Affichage des catégories
   - Liste des programmes disponibles
   - Progression de l'utilisateur
   - ✅ UI complète visible rapidement

### À l'Ouverture d'un Programme
2. **Détails chargés en lazy** (~70KB par catégorie)
   - Chargé uniquement quand nécessaire
   - Mis en cache pour réutilisation
   - Transparent pour l'utilisateur

### Optimisations Futures (Optionnel)
3. **Préchargement intelligent**
   ```javascript
   // Précharger en arrière-plan après l'affichage initial
   setTimeout(() => {
     preloadCategoryDetails('street');
   }, 2000);
   ```

## 🧪 Testing

### Vérifier l'Optimisation
```bash
# Vérifier les tailles de fichiers
Get-ChildItem src/data/ -Recurse -Include *.json

# Résultat attendu:
# programs-meta.json: 21KB
# streetworkout-details.json: 120KB
# run10k-details.json: 21KB
```

### Points de Contrôle
- ✅ L'écran d'accueil s'affiche en <1 seconde
- ✅ Les programmes se chargent normalement
- ✅ Les sessions de workout fonctionnent
- ✅ La progression est sauvegardée correctement
- ✅ Pas de régression fonctionnelle

## 📝 Notes pour les Développeurs

### Charger des Métadonnées
```javascript
// Import synchrone (léger, 21KB)
import programs from '../data/programs.js';

// OU async avec cache
import { loadProgramsMeta } from '../data/programsLoader';
const programs = await loadProgramsMeta();
```

### Charger des Détails Complets
```javascript
import { getCategoryWithDetails } from '../utils/programLoader';

// Charger une catégorie complète
const street = await getCategoryWithDetails('street');

// Ou un programme spécifique
import { getProgramWithDetails } from '../utils/programLoader';
const program = await getProgramWithDetails('street', 'beginner-foundation');
```

### Précharger pour Performance
```javascript
import { preloadCategoryDetails } from '../utils/programLoader';

// En arrière-plan après le chargement initial
useEffect(() => {
  setTimeout(() => {
    preloadCategoryDetails('street');
    preloadCategoryDetails('run');
  }, 1000);
}, []);
```

## 🚀 Impact Global
- **Expérience utilisateur**: Accueil instantané au lieu de 10s d'attente
- **Performance**: 89% de réduction de données au démarrage
- **Maintenabilité**: Séparation claire métadonnées/détails
- **Évolutivité**: Système de cache réutilisable pour d'autres données

## ⚠️ Fichiers à NE PAS MODIFIER
- `programs-meta.json` - Généré par script
- `streetworkout-details.json` - Généré par script
- `run10k-details.json` - Généré par script

**Pour regénérer ces fichiers:**
```bash
node scripts/splitProgramData.js
```

## 🎯 Prochaines Optimisations Possibles
1. Compression gzip des JSON (réduction supplémentaire ~60%)
2. IndexedDB pour cache persistant offline
3. Service Worker pour préchargement intelligent
4. Pagination des programmes (si >100 programmes)
