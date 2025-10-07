# 🏋️ Fitness RPG

Une application mobile gamifiée pour transformer l'entraînement sportif en aventure épique avec un système de progression RPG.

## 📱 À Propos

Fitness RPG gamifie votre entraînement avec :
- **Programmes multiples actifs** - Activez jusqu'à 2 programmes simultanément
- **Système de compétences** - Débloquez des compétences par progression
- **File d'attente intelligente** - Sessions générées automatiquement selon votre progression
- **XP et Niveaux** - Montez en niveau avec chaque séance complétée
- **Stats en temps réel** - Suivez vos progrès et améliorations

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancer l'application en développement
npm start
```

**📚 [Documentation Complète →](./docs/README.md)**

## 🛠 Stack Technique

- **Framework**: React Native + Expo
- **Backend**: Firebase (Firestore + Authentication)
- **Navigation**: React Navigation
- **UI**: React Native Paper
- **État**: Context API (AuthContext, WorkoutContext)

## 📁 Structure du Projet

```
fitnessrpg/
├── src/
│   ├── components/       # Composants réutilisables (cards, timer, etc.)
│   ├── contexts/         # AuthContext, WorkoutContext
│   ├── data/            # programmes.json
│   ├── hooks/           # Custom hooks
│   ├── screens/         # Écrans de l'app
│   ├── services/        # Firebase, sessionQueue, activePrograms
│   ├── theme/           # Thème et styles
│   └── utils/           # Fonctions utilitaires
├── assets/              # Images et ressources
├── docs/                # 📚 Documentation complète
│   ├── setup/          # Guides d'installation (Android, Firebase)
│   ├── architecture/   # Architecture multi-programmes
│   ├── guides/         # UX, migration, tests
│   └── components/     # Documentation des composants
└── FitnessGameApp/      # Prototype iOS SwiftUI (legacy)
```

## 📖 Documentation

La documentation complète est organisée dans le dossier **[`/docs`](./docs/README.md)** :

- **🔧 [Setup](./docs/setup/)** - Installation Android et Firebase
- **🏗️ [Architecture](./docs/architecture/)** - Structure multi-programmes
- **📘 [Guides](./docs/guides/)** - UX, workflow, tests
- **🧩 [Composants](./docs/components/)** - Documentation des composants
- **🔗 [Ressources](./docs/GITHUB_URLS.md)** - Liens utiles

### Documents Clés
- [Architecture Multi-Programmes](./docs/architecture/MULTI_PROGRAMS.md) - Structure Programme → Compétence → Niveau → Séance
- [Améliorations UX](./docs/guides/UX_IMPROVEMENTS.md) - Refonte de l'interface utilisateur
- [Guide Firebase](./docs/setup/FIREBASE_FIX.md) - Configuration Firebase pour React Native
- [Tests Système](./docs/guides/TESTING.md) - Guide de test complet

## 🔥 Configuration Firebase

**📋 [Guide Complet Firebase →](./docs/  setup/FIREBASE_FIX.md)**

### Résumé
1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Créer une base Firestore
4. Configurer les règles de sécurité
5. Ajouter les credentials dans votre environnement

Voir le [guide détaillé](./docs/setup/FIREBASE_FIX.md) pour les instructions complètes.

## 📊 Modèle de Données

### Structure Hiérarchique
```
Programme
  └─ Compétence (ex: "Pré-requis Pull-ups")
      └─ Niveau (ex: 1, 2, 3...)
          └─ Séance (liste d'exercices)
```

### Collections Firestore

#### `users`
```javascript
{
  email: "user@example.com",
  username: "athlete123",
  totalXP: 1500,
  level: 5,
  activePrograms: ["muscleup", "handstand"], // Max 2
  selectedPrograms: ["muscleup", "handstand", "planche"],
  createdAt: timestamp
}
```

#### `userProgress/{userId}/programs/{programId}`
```javascript
{
  programId: "muscleup",
  skills: {
    "pre-requis-pullups": {
      currentLevel: 3,
      unlockedLevels: [1, 2, 3],
      completedSessions: 5
    }
  },
  startedAt: timestamp,
  lastActivity: timestamp
}
```

#### `workoutSessions`
```javascript
{
  userId: "abc123",
  programId: "muscleup",
  skillId: "pre-requis-pullups",
  levelNumber: 2,
  sessionId: "session1",
  date: timestamp,
  exercises: [...],
  score: 920,
  xpEarned: 250,
  completed: true
}
```

## � Fonctionnalités

### ✅ Implémentées
- **Authentification Firebase** - Login/signup avec persistence
- **Multi-programmes actifs** - Jusqu'à 2 programmes actifs simultanément
- **File d'attente de séances** - Sessions générées automatiquement
- **Séances guidées** - Timer de repos, suivi des reps
- **Système de scoring** - Score et XP calculés automatiquement
- **Progression par compétences** - Déverrouillage niveau par niveau
- **Statistiques** - Graphiques et historique

### 🔄 Workflow Utilisateur
1. **Onboarding** - Sélection des programmes souhaités
2. **Activation auto** - Les 2 premiers programmes sont activés automatiquement
3. **File d'attente** - Sessions disponibles générées selon progression
4. **Séance** - Exercices guidés avec timer et saisie des reps
5. **Résultats** - Score, XP, déverrouillage de niveaux

## 🔮 Roadmap

- [ ] Mode hors-ligne avec synchronisation
- [ ] Leaderboards et défis entre amis
- [ ] Notifications de rappel
- [ ] Analyse IA des performances
- [ ] Nouveaux programmes (Handstand, Planche, etc.)
- [ ] Intégration Apple Health / Google Fit

## 🤝 Contribution

Les contributions sont bienvenues ! Consultez les [guides](./docs/guides/) pour comprendre l'architecture avant de contribuer.

## 📄 License

MIT License - Voir le fichier `LICENSE` pour plus de détails.

---

**📚 Pour plus d'informations, consultez la [documentation complète](./docs/README.md)**
