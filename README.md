# � HybridRPG - Fitness Gamification App

> **Gamify your fitness journey with RPG progression, skill trees, and real-time coaching**

![Status](https://img.shields.io/badge/status-ready%20for%20play%20store-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Android%207.0%2B-green)

## 📱 Overview

**HybridRPG** transforms fitness training into an epic RPG adventure with:

- ✅ **2 Complete Programs:** Running (11 levels), StreetWorkout (22 levels)
- ✅ **RPG Progression System:** Levels, XP, Skill Trees with visual connections
- ✅ **Guided Workouts:** Real-time exercises with instructions, rest timers
- ✅ **Smart Scoring:** Automatic performance calculation vs. targets
- ✅ **Statistics Dashboard:** Charts, streak tracking, session history
- ✅ **Firebase Backend:** Real-time cloud sync, secure authentication

## 🚀 Quick Start

```bash
# Installation
npm install

# Development
npm start
# Press 'a' for Android, 'i' for iOS, 'w' for web

# Production Build
cd android && cmd /c gradlew.bat bundleRelease
```

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React Native + Expo 52+ |
| **Backend** | Firebase (Firestore + Auth) |
| **Charts** | React Native SVG + LineChart |
| **Navigation** | React Navigation 6+ |
| **State** | Context API + Hooks |
| **UI** | React Native Paper |
| **Build** | Gradle + EAS |

## 📁 Project Structure

```
RpgHybrid/
├── src/
│   ├── components/       # Cards, Headers, Timers
│   ├── screens/          # Home, Selection, SkillTree, Workout
│   ├── services/         # Firebase, Queue, Scoring
│   ├── hooks/            # useUserPrograms, useWorkout
│   ├── contexts/         # AuthContext, ProgramContext
│   ├── data/             # JSON programs, metadata
│   ├── theme/            # Colors, Typography
│   └── utils/            # Helpers
│
├── android/
│   ├── app/
│   │   └── build.gradle  # 🔑 Signing configuration
│   └── gradle.properties
│
├── assets/
│   ├── programmes/       # Background images
│   └── avatars/          # User avatars
│
├── app.json              # Expo config
├── eas.json              # EAS build profiles
├── package.json
└── README.md             # This file

```
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
## 🔥 Firebase & Firestore

### Collections Structure

```javascript
users/{userId}/
├── activePrograms: ["running", "streetworkout"]
├── stats: { globalXP, globalLevel, title }
└── programs: { 
    "running": { level: 3, xp: 2500, completedSkills: [...] }
}

workoutSessions/{sessionId}/
├── userId
├── programId
├── skillId
├── score (0-100)
├── xpGained
└── completedAt
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /workoutSessions/{doc=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🎮 Features

### ✅ Implemented
- ✅ 2 complete programs (Running 11 levels, StreetWorkout 22 levels)
- ✅ Multi-select programs (up to 2 active)
- ✅ Skill tree with visual SVG connections
- ✅ Guided workout sessions with timers
- ✅ Automatic scoring system
- ✅ XP rewards & level progression
- ✅ Statistics & progress charts
- ✅ Firebase authentication
- ✅ Real-time data sync

### 🎯 For Future Releases
- Push notifications for workouts
- Social features (leaderboards)
- Apple HealthKit integration
- Offline mode with sync
- Custom workout creation
- Video tutorials

## 📦 Build & Deploy

### **IMPORTANT: Keystore Security**

```bash
# Your keystore password
Password: 12031990Robin!
Keystore file: android/hybridrpg-release.keystore

⚠️ NEVER commit keystore to git!
⚠️ NEVER share password in code!
```

### **Build Steps**

```bash
# 1. Create signed APK
cd android
cmd /c gradlew.bat bundleRelease

# 2. Output location
android/app/build/outputs/bundle/release/app-release.aab

# 3. Upload to Play Store
https://play.google.com/console
```

### **Play Store Deployment**

1. **Create Internal Testing Release**
   - Upload app-release.aab
   - Add yourself as tester
   - Get test link

2. **Test on Real Device**
   - Download from Play Store link
   - Verify Firebase works
   - Test all features

3. **Submit for Review**
   - Complete all metadata
   - Add screenshots
   - Submit once testing passes

4. **Production Release**
   - Google reviews (24-48 hours)
   - App goes live!

## 🧪 Testing

### Local Testing
```bash
npm start
# Press 'a' for Android Emulator
# All features available for testing
```

### Device Testing (No USB Cable)
```bash
# Transfer APK via:
# 1. Email
# 2. Google Drive
# 3. Bluetooth
# 4. Local WiFi share

# Or via Play Store internal testing link
```

## 📋 Important Files & Configs

| File | Purpose | Status |
|------|---------|--------|
| `app.json` | Expo config | ✅ Production ready |
| `eas.json` | EAS build config | ✅ Configured |
| `android/app/build.gradle` | Gradle signing config | ✅ Configured |
| `hybridrpg-release.keystore` | Signing key | 🔐 Secure storage |
| `.env` | Firebase credentials | 🔐 Secure storage |
| `android/gradle.properties` | Build properties | ✅ Optimized |

## ✅ Deployment Checklist

Before submitting to Play Store:

- [ ] All features tested on real device
- [ ] Firebase auth working correctly
- [ ] No console errors or warnings
- [ ] ProGuard enabled (code obfuscation)
- [ ] Shrink resources enabled (optimized size)
- [ ] App icon set correctly
- [ ] Splash screen working
- [ ] All permissions justified

For Play Store:

- [ ] App name: "HybridRPG"
- [ ] Category: Health & Fitness
- [ ] Privacy policy URL
- [ ] Screenshots uploaded (2-5)
- [ ] Description complete
- [ ] Internal testing passed
- [ ] Keystore file secured
- [ ] Credentials not in git

## 🔗 Resources

- **GitHub:** https://github.com/robinallainmkg/fitnessrpg
- **Play Store:** https://play.google.com/store/apps/details?id=com.fitnessrpg.app
- **Expo Docs:** https://docs.expo.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **React Native:** https://reactnative.dev

## 📞 Troubleshooting

### Build fails with "no firebase app created"
→ Check `.env` and Firebase initialization

### App crashes on startup
→ Check Firestore rules and authentication

### APK exceeds size limits
→ Verify ProGuard and Shrink Resources are enabled

### Play Store review rejected
→ Check privacy policy, permissions, and content rating

## 👨‍💻 Development

### Running in Development

```bash
npm start

# Interactive menu:
# a  - Android emulator
# i  - iOS simulator
# w  - Web browser
# j  - Debugger
# r  - Reload
# m  - More options
```

### Code Style

- **Components:** Functional with hooks
- **State:** Context API + local useState
- **Naming:** camelCase for files, PascalCase for components
- **Formatting:** Prettier (auto on save)

### Key Branches

- **main** - Production ready, all tests passing
- **develop** - Development branch, new features

## 📈 Performance Optimizations

- ✅ ProGuard: Code obfuscation & optimization
- ✅ Shrink Resources: Remove unused assets
- ✅ Lean Core: Only essential dependencies
- ✅ LazyLoad: Programs load on demand
- ✅ Memoization: React.memo for heavy components

## 📝 License

MIT License - See LICENSE file

---

**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Last Updated:** October 21, 2025  
**Maintainer:** Robin Allain

**Next Steps:** Submit to Google Play Store for internal testing and review! 🚀
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
