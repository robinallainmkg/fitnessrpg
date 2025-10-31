# 📚 Fitness RPG - Documentation

Bienvenue dans la documentation complète du projet **Fitness RPG**, une application mobile de gamification du fitness développée avec React Native (Expo) et Firebase.

---

## 🎯 Vue d'ensemble du projet

**Fitness RPG** transforme l'entraînement physique en une aventure RPG gamifiée où :
- Chaque workout rapporte de l'XP et améliore vos statistiques
- Vous débloquez des compétences dans un arbre de progression
- Vous progressez à travers différents programmes (Street Workout, Calisthenics, etc.)
- Votre corps devient votre avatar, chaque séance est une quête

### Stack technique
- **Frontend** : React Native (Expo)
- **Backend** : Firebase (Firestore + Authentication)
- **Navigation** : React Navigation
- **UI** : React Native Paper
- **State** : React Hooks + Context API

---

## 📖 Table des matières

### 🚀 Configuration & Installation
- [Installation & Setup](./setup/INSTALLATION.md)
- [Configuration Android](./setup/ANDROID_SETUP.md)
- [Configuration Firebase](./setup/FIREBASE_SETUP.md)

### 🏗️ Architecture
- [Architecture globale](./architecture/ARCHITECTURE.md)
- [Structure multi-programmes](./architecture/MULTI_PROGRAMS.md)
- [Modèle de données](./architecture/DATA_MODEL.md)
- [Services & API](./architecture/SERVICES.md)

### 📘 Guides de développement
- [Guide Workout & Séances](./guides/WORKOUT_GUIDE.md)
- [Système de progression & XP](./guides/PROGRESSION_SYSTEM.md)
- [UX & Interface utilisateur](./guides/UX_IMPROVEMENTS.md)
- [Migration de données](./guides/MIGRATION.md)
- [Tests système](./guides/TESTING.md)
- [**🔥 Mode Développement (DEV_AUTO_LOGIN)**](./guides/DEV_MODE.md)

### 🎨 Composants
- [UserHeader](./components/UserHeader.md)
- [UserStatsCard](./components/UserStatsCard.md)
- [ProgramProgressCard](./components/ProgramProgressCard.md)
- [SkillNode](./components/SkillNode.md)
- [SessionQueueCard](./components/SessionQueueCard.md)
- [ActiveProgramCard](./components/ActiveProgramCard.md)

### 🔧 Guides de dépannage
- [Correction erreurs Firebase](./setup/FIREBASE_FIX.md)
- [Problèmes courants](./guides/TROUBLESHOOTING.md)

---

## 🎮 Concepts clés

### Structure de l'application

```
Programme (ex: Street Workout)
  └── Compétence (ex: Squat)
      └── Niveau (ex: Niveau 1, 2, 3...)
          └── Séance (ex: "Squat débutant")
              └── Exercices (ex: 3x10 Squats)
```

### Flow utilisateur typique

1. **Onboarding** : Sélection de 1-2 programmes
2. **Activation automatique** : Les programmes sont immédiatement actifs
3. **Queue de séances** : Les premières séances disponibles s'affichent
4. **Entraînement** : L'utilisateur démarre une séance
5. **Progression** : Gains d'XP et déblocage de nouvelles compétences

### Principes de design

- **Pas de calendrier** : L'utilisateur fait les séances quand il veut
- **Pas de tracking temporel** : Pas de notion de "semaine"
- **Flexibilité maximale** : Pull n'importe quelle séance disponible
- **Gamification** : XP, niveaux, badges, arbre de compétences

---

## 🗂️ Structure du projet

```
fitnessrpg/
├── src/
│   ├── components/       # Composants réutilisables
│   ├── screens/          # Écrans de l'app
│   ├── services/         # Services Firebase & logique métier
│   ├── contexts/         # Contexts React (Auth, Workout)
│   ├── hooks/            # Hooks personnalisés
│   ├── theme/            # Couleurs et styles
│   ├── data/             # Données statiques (programmes.json)
│   └── utils/            # Utilitaires
├── docs/                 # Documentation (vous êtes ici !)
├── assets/               # Images et ressources
├── android/              # Code natif Android
└── App.js                # Point d'entrée
```

---

## 🚀 Quick Start

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer Firebase (voir docs/setup/FIREBASE_SETUP.md)
# Créer un fichier .env avec vos credentials

# 3. Lancer l'application
npx expo start

# 4. Scanner le QR code avec Expo Go
```

---

## 📊 État actuel du projet

### ✅ Fonctionnalités implémentées

- [x] Système d'authentification (Firebase)
- [x] Sélection de programmes
- [x] Activation automatique des programmes
- [x] Queue de séances recommandées
- [x] Écran de workout avec timer et suivi
- [x] Système de progression & XP
- [x] Arbre de compétences
- [x] Profil utilisateur avec stats
- [x] Historique des séances

### 🚧 En cours

- [ ] Refonte de l'écran d'accueil (compact, sans scroll)
- [ ] Déplacement des stats vers Profil
- [ ] Simplification du service sessionQueue

### 🔮 Roadmap

- [ ] Système de succès/badges
- [ ] Partage social
- [ ] Mode hors ligne
- [ ] Notifications push
- [ ] Apple Health / Google Fit integration

---

## 🤝 Contribution

Pour contribuer au projet :

1. Consultez les [guides de développement](./guides/)
2. Respectez l'[architecture](./architecture/ARCHITECTURE.md)
3. Testez vos modifications
4. Documentez les nouveaux composants

---

## 📞 Support & Contact

Pour toute question ou problème :
- Consultez d'abord les [guides de dépannage](./guides/TROUBLESHOOTING.md)
- Vérifiez les [problèmes connus](./setup/FIREBASE_FIX.md)
- Référez-vous aux [URLs importantes](./GITHUB_URLS.md)

---

## 📝 Licence

Ce projet est un prototype éducatif.

---

**Dernière mise à jour** : 29 octobre 2025  
**Version** : 1.0.0
