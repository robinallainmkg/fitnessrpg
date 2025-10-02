/**
 * 🧪 EXEMPLE D'UTILISATION - WorkoutSummaryScreen avec Gains de Stats
 * 
 * Ce fichier montre comment le WorkoutSummaryScreen modifié affiche les gains de stats
 * quand une compétence est complétée avec succès.
 */

// SCÉNARIO 1: Fondations Débutant - Niveau Validé
const exampleSession1 = {
  program: {
    id: 'beginner-foundation',
    name: 'Fondations Débutant',
    icon: '🌱',
    color: '#4CAF50'
  },
  level: {
    id: 1,
    name: 'Semaine 1-2 : Initiation'
  },
  sessionData: {
    score: 850,           // Score > 800 = niveau validé
    percentage: 85,
    xpEarned: 150,       // XP gagné pour cette session
    levelCompleted: true,
    programCompleted: false,
    exercises: [
      {
        exerciseId: 1,
        exerciseName: 'Tractions assistées',
        type: 'reps',
        target: 24,
        actual: 20
      },
      {
        exerciseId: 2,
        exerciseName: 'Pompes',
        type: 'reps', 
        target: 40,
        actual: 35
      }
    ]
  }
};

// RÉSULTAT AFFICHÉ:
/* 
┌─────────────────────────────────────┐
│ 🎁 Gains de Stats                   │
│ Compétence maîtrisée - Tes          │
│ caractéristiques augmentent !       │
│                                     │
│ ✨ XP Global              [+150 XP] │
│                                     │
│ Stats gagnées :                     │
│ 💪 Force                     [+3]   │
│ ⚡ Puissance                 [+2]   │
│ 🔋 Endurance                 [+1]   │
└─────────────────────────────────────┘
*/

// SCÉNARIO 2: Programme Complété + Level Up Global
const exampleSession2 = {
  program: {
    id: 'beginner-foundation', 
    name: 'Fondations Débutant'
  },
  level: {
    id: 2,
    name: 'Semaine 3-4 : Progression'
  },
  sessionData: {
    score: 920,
    percentage: 92,
    xpEarned: 650,       // Assez d'XP pour level up global
    levelCompleted: true,
    programCompleted: true
  },
  globalLevelUp: {
    newLevel: 3,
    previousLevel: 2,
    newTitle: 'Guerrier'
  }
};

// RÉSULTAT AFFICHÉ:
/*
┌─────────────────────────────────────┐
│ 🎁 Gains de Stats                   │
│ ✨ XP Global              [+650 XP] │
│ 💪 Force                     [+3]   │
│ ⚡ Puissance                 [+2]   │ 
│ 🔋 Endurance                 [+1]   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│            🎉                       │
│      NIVEAU GLOBAL UP !             │
│                                     │
│ Tu es maintenant niveau 3 -         │
│ Guerrier !                          │
│                                     │
│ Niveau 2 → Niveau 3                 │
│        [👑 Guerrier]                │
└─────────────────────────────────────┘
*/

// LOGIQUE DE CALCUL DES GAINS:

// 1. Récupération des statBonuses depuis programs.json
const programStatBonuses = {
  "beginner-foundation": {
    "strength": 3,     // +3 💪 Force
    "power": 2,        // +2 ⚡ Puissance  
    "endurance": 1,    // +1 🔋 Endurance
    "speed": 0,        // Pas de gain
    "flexibility": 0   // Pas de gain
  }
};

// 2. Calcul du level up global
const calculateGlobalLevel = (totalXP) => {
  return Math.floor(totalXP / 1000) + 1;
};

// Exemple: 
// Avant session: 1500 XP → Niveau 2
// Après session: 1500 + 650 = 2150 XP → Niveau 3 ✨ LEVEL UP!

// 3. Attribution des titres
const getTitleForLevel = (level) => {
  if (level >= 10) return "Légende";
  if (level >= 7) return "Champion";
  if (level >= 4) return "Guerrier";    // ← Niveau 3 devient Guerrier
  if (level >= 2) return "Apprenti";
  return "Débutant";
};

// SÉQUENCE D'ANIMATION:
/*
T+0ms:    Affichage du score principal
T+1000ms: 🎁 Gains de Stats apparaissent (fade-in)
T+1800ms: 🎉 Level Up Global apparaît (spring + scale)
*/

// CONDITIONS D'AFFICHAGE:
/*
✅ Gains de Stats:
   - Niveau validé (score ≥ 800)
   - Programme a des statBonuses dans programs.json
   - Utilisateur authentifié

✅ Level Up Global:
   - Niveau validé 
   - XP session fait passer un palier de 1000 XP
   - Calcul: nouveauNiveau > ancienNiveau
*/

// EXEMPLES DE PROGRAMMES AVEC DIFFÉRENTS GAINS:

const streetWorkoutGains = {
  "beginner-foundation": { strength: 3, power: 2, endurance: 1 },
  "strict-pullups": { strength: 4, power: 3, endurance: 2 },
  "muscle-up-progression": { strength: 5, power: 4, endurance: 3 }
};

const boxingGains = {
  "boxing-basics": { power: 4, speed: 3, endurance: 2 },
  "combo-mastery": { power: 3, speed: 4, endurance: 3 },
  "heavy-bag": { power: 5, strength: 2, endurance: 3 }
};

const yogaGains = {
  "flexibility-flow": { flexibility: 5, strength: 1, endurance: 2 },
  "balance-mastery": { flexibility: 3, strength: 2, endurance: 1 },
  "advanced-poses": { flexibility: 4, strength: 3, endurance: 2 }
};

// IMPACT UTILISATEUR:
/*
🎯 Motivation renforcée:
   - Récompenses visuelles immédiates
   - Progression tangible des stats
   - Célébration des level ups

💪 Gamification avancée:
   - Système de progression à long terme
   - Titres de prestige
   - Animations engageantes

📈 Rétention améliorée:
   - Raison de revenir (voir ses stats grandir)
   - Objectifs à long terme (level ups)
   - Sentiment d'accomplissement
*/
