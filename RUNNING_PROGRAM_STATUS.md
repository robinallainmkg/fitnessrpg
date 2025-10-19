# 🏃 Programme Running - État et Plan d'Intégration

## 📋 État Actuel

### ❌ Fichier `run10k.json` - PROBLÈMES CRITIQUES

Le fichier actuel contient **plusieurs erreurs majeures** qui le rendent inutilisable :

#### 1. **Prérequis Inversés** ❌
```json
"id": "couch-to-5k",  // Programme DÉBUTANT
"prerequisites": ["10k-sub-50", "speed-work-advanced"]  // ← Requiert des programmes AVANCÉS !
```
**Problème** : Un débutant absolu ne peut PAS commencer le programme car il nécessite d'abord terminer des programmes avancés. C'est l'inverse de la logique !

#### 2. **Positions/Tiers Inversés** ❌
```json
"id": "couch-to-5k",   // DÉBUTANT
"position": { "tier": 6 }  // ← Position de programme avancé

"id": "10k-sub-50",    // AVANCÉ
"position": { "tier": 5 }  // ← Plus bas que le débutant !
```

#### 3. **Fichier Incomplet** ❌
Le fichier s'arrête brutalement à la ligne 2007 en plein milieu d'un exercice :
```json
"rpe": "RPE 5/10
```
Il manque la fin de l'exercice, les niveaux suivants, et plusieurs programmes.

#### 4. **Programmes Dans le Désordre** ❌
Les programmes apparaissent dans un ordre aléatoire, pas dans l'ordre de progression logique.

---

## ✅ Structure Logique Correcte

### Progression Running (Tier 0 → Tier 7)

```
TIER 0 - DÉBUTANT ABSOLU
├─ couch-to-5k (🌱 Débutant)
│  └─ De 0 à 5km sans s'arrêter
│
TIER 1 - DÉBUTANT+
├─ 5k-consolidation (💪 Débutant+)
│  └─ Solidifier le 5K
├─ tempo-runs-intro (⚡ Débutant+)
│  └─ Introduction aux différentes allures
│
TIER 2 - INTERMÉDIAIRE
├─ 5k-to-10k (📈 Intermédiaire)
│  └─ De 5K à 10K progressivement
├─ speed-work-basic (🚀 Intermédiaire)
│  └─ Intervalles courts
│
TIER 3 - INTERMÉDIAIRE+
├─ 10k-consolidation (🎯 Intermédiaire)
│  └─ Rendre le 10K confortable
├─ tempo-runs-advanced (⚡⚡ Intermédiaire+)
│  └─ Tempo runs longs
├─ speed-work-advanced (💨 Intermédiaire+)
│  └─ Intervalles variés et intenses
│
TIER 4 - AVANCÉ
├─ 10k-sub-60 (🎯 Avancé)
│  └─ Casser la barre des 60 minutes
│
TIER 5 - AVANCÉ+
├─ 10k-sub-50 (⚡ Avancé+)
│  └─ Descendre sous les 50 minutes
│
TIER 6 - EXPERT
├─ 10k-sub-45 (👑 Expert)
│  └─ L'objectif ultime : 45 minutes
│
TIER 7 - LÉGENDE
└─ master-runner (🏃‍♂️👑 LEGEND)
   └─ Tu fais partie de l'élite mondiale
```

### Arbre de Dépendances

```
couch-to-5k (tier 0)
├─► 5k-consolidation (tier 1)
│   ├─► 5k-to-10k (tier 2)
│   │   └─► 10k-consolidation (tier 3)
│   │       ├─► tempo-runs-advanced (tier 3)
│   │       │   ├─► 10k-sub-60 (tier 4)
│   │       │   │   └─► 10k-sub-50 (tier 5)
│   │       │   │       └─► 10k-sub-45 (tier 6)
│   │       │   │           └─► master-runner (tier 7)
│   │       │   └─► 10k-sub-50 (tier 5)
│   │       └─► 10k-sub-60 (tier 4)
│   └─► speed-work-basic (tier 2)
│       └─► speed-work-advanced (tier 3)
│           ├─► 10k-sub-50 (tier 5)
│           └─► 10k-sub-45 (tier 6)
└─► tempo-runs-intro (tier 1)
    └─► speed-work-basic (tier 2)
```

---

## 📊 Contenu Actuel du Fichier

### Programmes Complets (dans le fichier original)
1. ✅ **couch-to-5k** - 8 niveaux complets
2. ✅ **5k-consolidation** - 3 niveaux
3. ✅ **tempo-runs-intro** - 3 niveaux
4. ✅ **5k-to-10k** - 5 niveaux
5. ⚠️ **speed-work-basic** - 4 niveaux (mais incomplet, s'arrête en plein exercice)
6. ✅ **10k-consolidation** - 3 niveaux
7. ✅ **tempo-runs-advanced** - 4 niveaux
8. ✅ **speed-work-advanced** - 4 niveaux
9. ✅ **10k-sub-60** - 3 niveaux
10. ⚠️ **10k-sub-50** - Semble avoir 8 niveaux MAIS contient du contenu erroné (mélange avec couch-to-5k)
11. ✅ **10k-sub-45** - Visible dans l'aperçu
12. ✅ **master-runner** - 2 niveaux

### Programmes Corrects dans `run10k_corrected.json`
J'ai créé un fichier partiel avec :
- ✅ couch-to-5k (corrigé, tier 0)
- ✅ 5k-consolidation (tier 1)
- ✅ tempo-runs-intro (tier 1)
- ✅ 5k-to-10k (tier 2)
- ✅ speed-work-basic (tier 2)

**Manquent** : Les tiers 3-7 (7 programmes)

---

## 🎯 Plan d'Action

### Option 1 : Correction Manuelle du Fichier Original
**Avantages** :
- Le contenu existe déjà
- Juste besoin de réorganiser

**Inconvénients** :
- Fichier très long (2007 lignes)
- Risque d'erreurs de JSON
- Nécessite une révision complète

**Actions** :
1. Copier le contenu correct programme par programme
2. Réorganiser dans l'ordre des tiers
3. Corriger les prérequis
4. Corriger les positions
5. Terminer le fichier incomplet

### Option 2 : Compléter `run10k_corrected.json` Progressivement
**Avantages** :
- Déjà 5 programmes corrects
- Structure propre
- Fichier plus petit, plus maintenable

**Inconvénients** :
- Doit copier manuellement les 7 programmes manquants
- Plus de travail initial

**Actions** :
1. ✅ Tiers 0-2 déjà fait (5 programmes)
2. Ajouter tier 3 (3 programmes)
3. Ajouter tiers 4-7 (4 programmes)
4. Valider le JSON final

### ✅ **RECOMMANDATION** : Option 2

Compléter `run10k_corrected.json` progressivement est plus sûr car :
- La base est déjà propre
- Moins de risque d'erreurs
- Plus facile à tester
- Meilleure maintenabilité

---

## 🖼️ Images de Fond

### Fichiers Actuels
```
assets/programmes/
├─ street-workout-bg.jpg
└─ StreetWorkout.jpg
```

### Manquant
- ❌ `running-bg.jpg` - Image de fond pour la catégorie Running

### Solutions
1. **Créer une image** : Photo de coureur ou piste de running
2. **Utiliser une image générique** : Fond dégradé avec couleur #FF6B35 (orange)
3. **Laisser vide temporairement** : `"backgroundImage": ""`

---

## 🔄 Intégration dans `programs.json`

### Structure Actuelle
```json
{
  "categories": [
    {
      "id": "street",
      "name": "Street Workout",
      "programs": [...]
    }
  ]
}
```

### Structure Cible
```json
{
  "categories": [
    {
      "id": "street",
      "name": "Street Workout",
      "backgroundImage": "street-workout-bg.jpg",
      "programs": [...]
    },
    {
      "id": "running",
      "name": "Run 10k - 45min",
      "description": "Programme complet pour courir 10km en 45 minutes.",
      "icon": "🏃",
      "color": "#FF6B35",
      "backgroundImage": "running-bg.jpg",
      "type": "skill-tree",
      "programs": [
        /* 12 programmes de running */
      ]
    }
  ]
}
```

### Fusion
1. Lire `run10k_corrected.json` (une fois complet)
2. Extraire `categories[0]` (running)
3. Ajouter comme 2ème élément dans `programs.json`
4. ❌ **SUPPRIMER** `run10k.json` et `run10k_corrected.json` après fusion

---

## 📝 Prochaines Étapes

### 1. Compléter run10k_corrected.json
- [ ] Ajouter tier 3 : 10k-consolidation, tempo-runs-advanced, speed-work-advanced
- [ ] Ajouter tier 4 : 10k-sub-60
- [ ] Ajouter tier 5 : 10k-sub-50
- [ ] Ajouter tier 6 : 10k-sub-45
- [ ] Ajouter tier 7 : master-runner
- [ ] Valider JSON avec un validator en ligne

### 2. Créer/Gérer l'Image de Fond
- [ ] Décider : créer image, utiliser générique, ou laisser vide
- [ ] Si création : placer dans `assets/programmes/running-bg.jpg`
- [ ] Mettre à jour `backgroundImage` dans le JSON

### 3. Fusionner dans programs.json
- [ ] Ouvrir `programs.json`
- [ ] Ajouter la catégorie running après street
- [ ] Sauvegarder
- [ ] Tester l'application

### 4. Valider
- [ ] Lancer l'app
- [ ] Vérifier que "Run 10k - 45min" apparaît dans la liste des programmes
- [ ] Tester la progression (déverrouillage des niveaux)
- [ ] Vérifier que les prérequis fonctionnent correctement

---

## 🚀 Fichiers à Modifier/Créer

### Fichiers à Créer
- `assets/programmes/running-bg.jpg` (optionnel)

### Fichiers à Compléter
- `src/data/run10k_corrected.json` (add tiers 3-7)

### Fichiers à Modifier
- `src/data/programs.json` (ajouter catégorie running)

### Fichiers à Supprimer (après fusion)
- `src/data/run10k.json` (fichier original cassé)
- `src/data/run10k_corrected.json` (une fois fusionné dans programs.json)

---

## ✅ Checklist Finale

- [ ] run10k_corrected.json contient les 12 programmes
- [ ] Tous les programmes ont les bons tiers (0-7)
- [ ] Tous les prérequis sont corrects
- [ ] Toutes les positions sont cohérentes
- [ ] Le JSON est valide (pas d'erreurs de syntaxe)
- [ ] L'image de fond existe ou backgroundImage est ""
- [ ] programs.json contient street + running
- [ ] L'app affiche les deux catégories
- [ ] La progression fonctionne correctement
- [ ] Les fichiers temporaires sont supprimés

---

## 🎓 Notes Techniques

### Format des Prérequis
```json
"prerequisites": []               // Débutant (tier 0)
"prerequisites": ["couch-to-5k"]  // Nécessite couch-to-5k
"prerequisites": ["prog-a", "prog-b"]  // Nécessite LES DEUX
```

### Format des Positions
```json
"position": {
  "x": 2,   // Position horizontale dans le skill tree
  "y": 0,   // Position verticale
  "tier": 0 // Niveau de difficulté (0=débutant, 7=légende)
}
```

### Cohérence Tier/Difficulty
| Tier | Difficulty Label |
|------|------------------|
| 0    | "Débutant"       |
| 1    | "Débutant+"      |
| 2    | "Intermédiaire"  |
| 3    | "Intermédiaire+" |
| 4    | "Avancé"         |
| 5    | "Avancé+"        |
| 6    | "Expert"         |
| 7    | "LEGEND"         |

---

**Date de création** : 9 octobre 2025  
**Auteur** : GitHub Copilot  
**Status** : 🚧 EN COURS - Fichier run10k.json nécessite correction complète
