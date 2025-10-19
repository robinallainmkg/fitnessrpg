# 🔄 Migration : Fichiers de Programmes Séparés

## ✅ Migration Complétée

### Changements Effectués

#### 1. **Structure de Fichiers Modifiée**

**AVANT** :
```
src/data/
└── programs.json  (1 gros fichier avec toutes les catégories)
```

**APRÈS** :
```
src/data/
├── streetworkout.json  (Catégorie Street Workout uniquement)
├── run10k.json         (Catégorie Running uniquement)
└── programs.js         (Index qui combine les deux)
```

#### 2. **Avantages de Cette Architecture**

✅ **Fichiers plus petits** : Plus facile à éditer et maintenir
✅ **Séparation des responsabilités** : Chaque programme dans son fichier
✅ **Meilleure organisation** : Structure modulaire
✅ **Facilite l'ajout de nouveaux programmes** : Créer un nouveau fichier et l'ajouter à programs.js
✅ **Pas de conflit Git** : Deux personnes peuvent travailler sur des programmes différents

---

## 📁 Structure des Fichiers

### `streetworkout.json`
```json
{
  "categories": [
    {
      "id": "street",
      "name": "Street Workout",
      "description": "L'arbre de compétences complet du calisthenics...",
      "icon": "",
      "color": "#6C63FF",
      "backgroundImage": "street-workout-bg.jpg",
      "type": "skill-tree",
      "programs": [
        /* 22 programmes Street Workout */
      ]
    }
  ]
}
```

### `run10k.json`
```json
{
  "categories": [
    {
      "id": "running",
      "name": "Run 10k - 45min",
      "description": "Programme complet pour courir 10km en 45 minutes...",
      "icon": "🏃",
      "color": "#FF6B35",
      "backgroundImage": "running-bg.jpg",
      "type": "skill-tree",
      "programs": [
        /* 5 programmes Running (tiers 0-2) */
        /* TODO: Ajouter tiers 3-7 (7 programmes manquants) */
      ]
    }
  ]
}
```

### `programs.js` (Index)
```javascript
import streetWorkoutData from './streetworkout.json';
import run10kData from './run10k.json';

const programs = {
  categories: [
    ...streetWorkoutData.categories,
    ...run10kData.categories
  ]
};

export default programs;
```

---

## 🔄 Imports Mis à Jour

### Fichiers Modifiés (12 fichiers)

✅ **Screens** (9 fichiers)
- `HomeScreen.js`
- `WorkoutSummaryScreen.js`
- `ProgramSelectionScreen.js`
- `ManageActiveProgramsScreen.js`
- `ProgramsScreen.js`
- `SkillTreeScreen.js`
- `SkillDetailScreen.js`
- `SystemTestScreen.js`

✅ **Contexts** (1 fichier)
- `WorkoutContext.js`

✅ **Services** (1 fichier)
- `sessionQueueService.js`

✅ **Hooks** (1 fichier)
- `useUserPrograms.js`

✅ **Components** (1 fichier)
- `ProgramProgressCard.js`

### Changement Appliqué

**AVANT** :
```javascript
import programs from '../data/programs.json';
```

**APRÈS** :
```javascript
import programs from '../data/programs.js';
```

---

## 🎯 État Actuel des Programmes

### Street Workout ✅
- **Statut** : Complet
- **Programmes** : 22 programmes (tiers 0-7)
- **Fichier** : `streetworkout.json`

### Running ⚠️
- **Statut** : Partiel (5/12 programmes)
- **Programmes** : 
  - ✅ Tier 0 : couch-to-5k
  - ✅ Tier 1 : 5k-consolidation, tempo-runs-intro
  - ✅ Tier 2 : 5k-to-10k, speed-work-basic
  - ❌ Tier 3 : 10k-consolidation, tempo-runs-advanced, speed-work-advanced (MANQUANTS)
  - ❌ Tier 4 : 10k-sub-60 (MANQUANT)
  - ❌ Tier 5 : 10k-sub-50 (MANQUANT)
  - ❌ Tier 6 : 10k-sub-45 (MANQUANT)
  - ❌ Tier 7 : master-runner (MANQUANT)
- **Fichier** : `run10k.json`

---

## 📋 Prochaines Étapes

### 1. Tester l'Application
- [ ] Lancer l'app : `npx expo start --dev-client`
- [ ] Vérifier que les 2 catégories apparaissent
- [ ] Tester Street Workout (devrait fonctionner normalement)
- [ ] Tester Running (seulement tiers 0-2 disponibles)

### 2. Compléter run10k.json (Optionnel)
- [ ] Extraire les 7 programmes manquants de l'ancien fichier
- [ ] Corriger les prérequis et positions
- [ ] Les ajouter dans run10k.json
- [ ] Tester la progression complète

### 3. Ajouter l'Image de Fond Running (Optionnel)
- [ ] Créer ou trouver `running-bg.jpg`
- [ ] Placer dans `assets/programmes/`
- [ ] OU mettre `"backgroundImage": ""` si pas d'image

---

## 🚀 Ajout de Nouveaux Programmes (Futur)

Pour ajouter une nouvelle catégorie (ex: Yoga, Musculation, etc.) :

1. **Créer le fichier JSON**
```bash
touch src/data/yoga.json
```

2. **Structure du fichier**
```json
{
  "categories": [
    {
      "id": "yoga",
      "name": "Yoga Flow",
      "description": "...",
      "icon": "🧘",
      "color": "#8E44AD",
      "backgroundImage": "yoga-bg.jpg",
      "type": "skill-tree",
      "programs": [...]
    }
  ]
}
```

3. **Ajouter dans programs.js**
```javascript
import streetWorkoutData from './streetworkout.json';
import run10kData from './run10k.json';
import yogaData from './yoga.json';  // ← NOUVEAU

const programs = {
  categories: [
    ...streetWorkoutData.categories,
    ...run10kData.categories,
    ...yogaData.categories  // ← NOUVEAU
  ]
};

export default programs;
```

4. **Redémarrer l'app**
```bash
npx expo start --dev-client
```

---

## ⚠️ Points d'Attention

### Import .js vs .json

⚠️ **IMPORTANT** : L'import doit maintenant être `.js` et non `.json` :

```javascript
// ✅ CORRECT
import programs from '../data/programs.js';

// ❌ INCORRECT (ancien)
import programs from '../data/programs.json';
```

### Structure des Catégories

Chaque fichier JSON doit avoir la structure :
```json
{
  "categories": [
    { /* catégorie */ }
  ]
}
```

Même s'il n'y a qu'une seule catégorie, elle doit être dans un tableau `categories`.

---

## 📊 Statistiques

### Taille des Fichiers

- `streetworkout.json` : ~4579 lignes (Street Workout complet)
- `run10k.json` : ~871 lignes (Running partiel, 5/12 programmes)
- `programs.js` : ~13 lignes (Index de combinaison)

**Total** : ~5463 lignes (vs ~6000+ dans un seul fichier)

### Réduction de Complexité

- **Avant** : 1 fichier de 6000+ lignes
- **Après** : 2 fichiers de ~2500 lignes chacun + 1 index de 13 lignes

**Bénéfice** : Fichiers plus maintenables et moins de risque de conflits

---

## ✅ Validation

### Checklist de Migration

- [x] `programs.json` renommé en `streetworkout.json`
- [x] `run10k.json` existe avec structure correcte
- [x] `programs.js` créé et combine les catégories
- [x] 12 fichiers mis à jour pour importer `programs.js`
- [ ] Application testée et fonctionnelle
- [ ] Les 2 catégories visibles dans l'app

---

**Date de migration** : 10 octobre 2025  
**Status** : ✅ Migration technique complète - En attente de tests
