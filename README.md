# 🏋️ Fitness Gamification App

Une application iOS native développée en SwiftUI pour gamifier l'entraînement sportif avec un système de progression par niveaux.

## 📱 Fonctionnalités

### ✅ Implémentées
- **Authentification Firebase** - Connexion/inscription avec email/mot de passe
- **Programmes d'entraînement** - Programmes structurés avec 6 niveaux progressifs
- **Séances guidées** - Interface pas-à-pas avec timer de repos
- **Système de scoring** - Calcul automatique des scores et XP
- **Suivi des progrès** - Graphiques et historique des performances
- **Profil utilisateur** - Statistiques et gestion du compte

### 🔄 Séance d'entraînement
1. Sélection du programme et niveau
2. Exercices guidés série par série
3. Timer de repos automatique entre les séries
4. Saisie des répétitions réalisées
5. Calcul du score final et XP gagnés
6. Déverrouillage automatique du niveau suivant (score ≥ 80%)

## 🛠 Stack Technique

- **Frontend**: SwiftUI (iOS 16+)
- **Backend**: Firebase (Firestore + Authentication)
- **Architecture**: MVVM
- **Charts**: Swift Charts (natif iOS)
- **Gestion d'état**: Combine + ObservableObject

## 📁 Structure du Projet

```
FitnessGameApp/
├── Models/
│   ├── UserModels.swift      # User, UserProgress, WorkoutSession
│   └── WorkoutModels.swift   # WorkoutProgram, Exercise, Level
├── Views/
│   ├── AuthView.swift        # Authentification
│   ├── MainTabView.swift     # Navigation principale
│   ├── ProgramsListView.swift # Liste des programmes
│   ├── ProgramDetailView.swift # Détail programme + niveaux
│   ├── WorkoutSessionView.swift # Séance guidée
│   ├── ProgressView.swift    # Graphiques et stats
│   └── ProfileView.swift     # Profil utilisateur
├── ViewModels/
│   ├── AuthViewModel.swift   # Gestion authentification
│   └── WorkoutViewModel.swift # Gestion séances et progrès
├── Services/
│   ├── AuthService.swift     # Service Firebase Auth
│   ├── FirestoreService.swift # Service Firestore
│   └── WorkoutProgramService.swift # Données programmes
└── Resources/
    └── Assets.xcassets       # Ressources graphiques
```

## 🔥 Configuration Firebase

### 1. Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Ajouter une application iOS avec le bundle ID: `com.example.FitnessGameApp`

### 2. Configurer Authentication
1. Dans Firebase Console → Authentication → Sign-in method
2. Activer "Email/Password"

### 3. Configurer Firestore
1. Dans Firebase Console → Firestore Database
2. Créer une base de données
3. Utiliser les règles de sécurité suivantes :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users peuvent lire/écrire leurs propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // UserProgress - utilisateur peut gérer ses progrès
    match /userProgress/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // WorkoutSessions - utilisateur peut gérer ses séances
    match /workoutSessions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Télécharger GoogleService-Info.plist
1. Dans Firebase Console → Project Settings → iOS apps
2. Télécharger `GoogleService-Info.plist`
3. Ajouter le fichier au projet Xcode dans le dossier principal

## 🚀 Installation et Lancement

### Prérequis
- Xcode 15.0+
- iOS 16.0+
- Compte développeur Apple (pour les tests sur appareil)

### Étapes
1. Cloner le repository
2. Ouvrir `FitnessGameApp.xcodeproj` dans Xcode
3. Ajouter `GoogleService-Info.plist` au projet
4. Sélectionner votre équipe de développement dans les paramètres du projet
5. Lancer sur simulateur ou appareil

## 📊 Modèle de Données

### Collections Firestore

#### `users`
```json
{
  "email": "user@example.com",
  "totalXP": 1500,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `userProgress`
```json
{
  "userId": "abc123",
  "programId": "muscleup",
  "currentLevel": 3,
  "unlockedLevels": [1, 2, 3],
  "totalSessions": 12
}
```

#### `workoutSessions`
```json
{
  "userId": "abc123",
  "programId": "muscleup",
  "levelId": 2,
  "date": "2024-01-15T10:30:00Z",
  "exercises": [
    {
      "exerciseName": "Tractions",
      "sets": [5, 5, 4, 5, 5],
      "target": 5
    }
  ],
  "score": 920,
  "xpEarned": 250,
  "completed": true
}
```

## 🎮 Programme Exemple : Muscle-Up Mastery

### Niveaux disponibles :
1. **Le Soldat** - Bases avec assistance
2. **Le Guerrier de Fer** - Force pure
3. **Le Titan d'Acier** - Maîtrise de la transition
4. **Le Conquérant du Ciel** - Technique avancée
5. **Le Maître de l'Apesanteur** - Vers la perfection
6. **Le Légendaire Muscle-Up** - Maîtrise absolue

Chaque niveau contient 4-5 exercices avec 5 séries chacun, des temps de repos adaptés et des instructions détaillées.

## 🔮 Fonctionnalités Futures

- [ ] Ajout de nouveaux programmes d'entraînement
- [ ] Mode hors-ligne avec synchronisation
- [ ] Partage social des performances
- [ ] Notifications de rappel d'entraînement
- [ ] Analyse IA des performances
- [ ] Intégration Apple Health
- [ ] Mode coach avec recommandations personnalisées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou proposer des pull requests.

## 📄 License

Ce projet est sous license MIT. Voir le fichier `LICENSE` pour plus de détails.
