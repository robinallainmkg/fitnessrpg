# 📚 GLOSSAIRE - HIÉRARCHIE FITNESS RPG

## 🎯 HIÉRARCHIE CLAIRE

### 1. 🏋️ PROGRAMME 
- **Définition** : La catégorie principale de l'application (l'arbre complet)
- **Exemple** : "Street Workout"
- **Contient** : Plusieurs COMPÉTENCES
- **Dans le code** : Racine de `programs.json`, affiché en header de l'arbre
- **UI** : "Programme Street Workout"

### 2. ⭐ COMPÉTENCE
- **Définition** : Une discipline spécifique à maîtriser
- **Exemples** : "Fondations Débutant", "Muscle-Up Strict", "Back Lever"
- **Anciennement appelé** : "program" dans le code (CONFUSION À CORRIGER)
- **Contient** : 3-6 NIVEAUX de progression
- **Débloquage** : Via prérequis (autres compétences)
- **Dans le code** : `skill` (nouveau nom), `programs[].skills[]` dans la structure
- **UI** : "Compétence", "20 compétences à débloquer"

### 3. 📊 NIVEAU
- **Définition** : Un palier de progression dans une compétence
- **Exemples** : "Niveau 1 - Initiation", "Niveau 2 - Développement"
- **Contient** : Plusieurs EXERCICES avec séries/répétitions
- **Validation** : Score minimum requis (80%) pour débloquer le suivant
- **Dans le code** : `levels[]` dans chaque skill
- **UI** : "Niveaux de progression", "Niveau X validé !"

### 4. 🏃 SÉANCE
- **Définition** : Une tentative d'exécution d'un niveau spécifique
- **États possibles** : En cours, Complétée, Abandonnée
- **Contient** : Performances sur chaque exercice, score final, XP gagnée
- **Stockage** : Collection Firestore `sessions`
- **UI** : "Séance terminée", "Dernière séance"

## 🔄 REFACTORING VOCABULARY

### AVANT → APRÈS

| Ancien terme | Nouveau terme | Contexte |
|--------------|---------------|----------|
| "Mes Programmes" | "Mon Arbre de Compétences" | Titre écran d'accueil |
| "programme" (compétence) | "compétence" | Partout dans l'UI |
| "challenge" | "compétence" | Anciens textes |
| "module" | "compétence" | Anciens textes |
| "workout" | "séance" | Session d'entraînement |
| "débloquer un programme" | "débloquer une compétence" | Actions utilisateur |
| "compléter un programme" | "maîtriser une compétence" | État final |
| `programId` | `skillId` | Variables code |
| `completedPrograms` | `completedSkills` | Collections données |
| `userProgress` | `skillProgress` | Collection Firestore |
| `workoutSessions` | `sessions` | Collection Firestore |

## 📱 TEXTES UI STANDARDS

### HomeScreen
- **Titre principal** : "Mon Arbre"
- **Card programme** : "Programme Street Workout"
- **Stats** : "20 compétences | X maîtrisées"
- **Sections** : "Compétences en cours", "À débloquer bientôt", "Dernière séance"

### SkillTreeScreen  
- **Header** : "🏋️ Street Workout"
- **Stats** : "X/20 compétences maîtrisées"
- **Nodes** : Nom de chaque compétence

### SkillDetailScreen
- **Header** : [Nom de la compétence]
- **Section** : "Niveaux de progression"
- **Boutons** : "Commencer le niveau X", "Continuer le niveau X"

### WorkoutScreen
- **Header** : "[Compétence] - Niveau X"
- **Progress** : "Exercice X/Y - Série X/Y"

### WorkoutSummaryScreen
- **Titre** : "Séance terminée"
- **Succès niveau** : "Niveau X validé ! 🎉"
- **Succès compétence** : "Compétence maîtrisée ! ✅"
- **Navigation** : "Niveau suivant", "Retour à l'arbre"

## 🗂️ STRUCTURE FIRESTORE

### Collection `skillProgress`
```javascript
{
  userId: string,
  skillId: string,        // anciennement programId
  currentLevel: number,
  unlockedLevels: number[],
  totalSessions: number,
  bestScore: number,
  lastSessionDate: timestamp
}
```

### Collection `sessions`
```javascript
{
  sessionId: string,
  userId: string,
  skillId: string,        // anciennement programId
  levelId: number,
  date: timestamp,
  exercises: array,
  score: number,
  xpEarned: number,
  completed: boolean,     // true si niveau validé
  abandoned: boolean      // true si séance abandonnée
}
```

## ✅ CHECKLIST REFACTORING

### Phase 1 - Textes UI (URGENT)
- [ ] HomeScreen : nouveau wording et structure
- [ ] SkillTreeScreen : header et stats
- [ ] SkillDetailScreen : renommage et wording
- [ ] WorkoutScreen : header et progress
- [ ] WorkoutSummaryScreen : messages de succès

### Phase 2 - Code (IMPORTANT)  
- [ ] Renommer variables `program` → `skill`
- [ ] Mettre à jour contextes (Auth, Workout)
- [ ] Adapter les fonctions utilitaires
- [ ] Mettre à jour les commentaires

### Phase 3 - Structure (OPTIONNEL)
- [ ] Renommer `ProgramDetailScreen.js` → `SkillDetailScreen.js`
- [ ] Adapter les imports
- [ ] Nettoyer les anciens commentaires
- [ ] Documenter les changements

## 🎯 OBJECTIF FINAL

Une expérience utilisateur claire où :
- L'utilisateur comprend qu'il progresse dans un **Programme** (Street Workout)
- Composé de multiples **Compétences** à débloquer et maîtriser
- Chaque compétence a des **Niveaux** de difficulté croissante  
- Chaque **Séance** fait progresser vers la maîtrise d'un niveau

**Fini la confusion entre "programme" et "compétence" !** 🎉
