# 🎮 Fitness RPG - Gamified Fitness Training App# � HybridRPG - Fitness Gamification App



> **Transform your fitness journey into an epic RPG adventure with challenges, XP, and progression**> **Gamify your fitness journey with RPG progression, skill trees, and real-time coaching**



![Status](https://img.shields.io/badge/status-in%20development-yellow)![Status](https://img.shields.io/badge/status-ready%20for%20play%20store-brightgreen)

![Version](https://img.shields.io/badge/version-0.9.0-blue)![Version](https://img.shields.io/badge/version-1.0.0-blue)

![Platform](https://img.shields.io/badge/platform-React%20Native-green)![Platform](https://img.shields.io/badge/platform-Android%207.0%2B-green)



## 📱 Overview## 📱 Overview



**Fitness RPG** is a **React Native** mobile app that gamifies fitness training with RPG mechanics:**HybridRPG** transforms fitness training into an epic RPG adventure with:



- ✅ **RPG Progression:** Earn XP, level up (1000 XP = 1 level), gain titles (Débutant → Légende)- ✅ **2 Complete Programs:** Running (11 levels), StreetWorkout (22 levels)

- ✅ **Daily Challenges:** Submit videos of daily exercises for admin validation (+150 XP)- ✅ **RPG Progression System:** Levels, XP, Skill Trees with visual connections

- ✅ **Skill Challenges (Quests):** Progressive program levels with performance scoring- ✅ **Guided Workouts:** Real-time exercises with instructions, rest timers

- ✅ **Training Mode:** Practice workouts without XP (only challenges give XP)- ✅ **Smart Scoring:** Automatic performance calculation vs. targets

- ✅ **Global Leaderboard:** Ranked by total XP (#1, #2, #3, etc.)- ✅ **Statistics Dashboard:** Charts, streak tracking, session history

- ✅ **Streak System:** Consecutive active days with fire emoji animation- ✅ **Firebase Backend:** Real-time cloud sync, secure authentication

- ✅ **Real-time Sync:** Firebase Firestore backend

## 🚀 Quick Start

## 🚀 Quick Start

```bash

```bash# Installation

# Installationnpm install

npm install

# Development

# Development (Requires development build, NOT Expo Go)npm start

npx expo run:android# Press 'a' for Android, 'i' for iOS, 'w' for web



# Production Build# Production Build

cd android && ./gradlew assembleReleasecd android && cmd /c gradlew.bat bundleRelease

``````



⚠️ **Important:** This app uses `@react-native-firebase` which requires a native development build, **NOT Expo Go**.## 🛠 Tech Stack



## 🛠 Tech Stack| Component | Technology |

|-----------|-----------|

| Component | Technology || **Frontend** | React Native + Expo 52+ |

|-----------|-----------|| **Backend** | Firebase (Firestore + Auth) |

| **Framework** | React Native + Expo (development build) || **Charts** | React Native SVG + LineChart |

| **Backend** | Firebase (Firestore + Authentication + Storage) || **Navigation** | React Navigation 6+ |

| **Navigation** | React Navigation 6 (3 tabs only) || **State** | Context API + Hooks |

| **State Management** | Context API || **UI** | React Native Paper |

| **UI Library** | React Native Paper + Custom RPG theme || **Build** | Gradle + EAS |

| **Charts** | React Native Chart Kit |

| **Animations** | React Native Reanimated |## 📁 Project Structure



## 📁 Project Structure```

RpgHybrid/

```├── src/

RpgHybrid/                    ← Main React Native project│   ├── components/       # Cards, Headers, Timers

├── src/│   ├── screens/          # Home, Selection, SkillTree, Workout

│   ├── components/           ← UserHeader, DailyChallengeCard, QuestePrincipale│   ├── services/         # Firebase, Queue, Scoring

│   ├── screens/              ← BattleScreen, ProgramScreen, EntrainementScreen│   ├── hooks/            # useUserPrograms, useWorkout

│   ├── services/             ← skillChallengeService, rankingService│   ├── contexts/         # AuthContext, ProgramContext

│   ├── contexts/             ← AuthContext, WorkoutContext, ChallengeContext│   ├── data/             # JSON programs, metadata

│   ├── config/               ← firebase.simple.js│   ├── theme/            # Colors, Typography

│   ├── theme/                ← rpgTheme.js, colors.js│   └── utils/            # Helpers

│   └── utils/                ← scoring.js│

│├── android/

├── android/                  ← Native Android project│   ├── app/

├── assets/                   ← Images, backgrounds, avatars│   │   └── build.gradle  # 🔑 Signing configuration

├── docs/                     ← Complete documentation│   └── gradle.properties

│   ├── BATTLE_SCREEN_REDESIGN_PROMPT.md  ← Design specs for redesign│

│   └── architecture/├── assets/

││   ├── programmes/       # Background images

├── FitnessGameApp/           ← ⚠️ LEGACY iOS SwiftUI prototype (IGNORE)│   └── avatars/          # User avatars

││

├── app.json                  ← Expo config├── app.json              # Expo config

├── package.json├── eas.json              # EAS build profiles

└── README.md                 ← This file├── package.json

```└── README.md             # This file



⚠️ **Note:** The `FitnessGameApp/` folder contains an old iOS SwiftUI prototype and is **NOT** the main project. The main project is the React Native app in the root directory.```

│   └── components/     # Documentation des composants

## 🎯 Navigation Structure└── FitnessGameApp/      # Prototype iOS SwiftUI (legacy)

```

The app has **exactly 3 tabs** (no more, no less):

## 📖 Documentation

```

┌─────────────────────────────────────┐La documentation complète est organisée dans le dossier **[`/docs`](./docs/README.md)** :

│  Programme  |  Battle  | Entraînement │

└─────────────────────────────────────┘- **🔧 [Setup](./docs/setup/)** - Installation Android et Firebase

```- **🏗️ [Architecture](./docs/architecture/)** - Structure multi-programmes

- **📘 [Guides](./docs/guides/)** - UX, workflow, tests

- **Programme:** Browse and activate workout programs- **🧩 [Composants](./docs/components/)** - Documentation des composants

- **Battle:** Daily challenges, main quest, side quests, history- **🔗 [Ressources](./docs/GITHUB_URLS.md)** - Liens utiles

- **Entraînement:** Training sessions queue, workout preview

### Documents Clés

**NO** Home tab, **NO** Profile tab, **NO** Quest tab.- [Architecture Multi-Programmes](./docs/architecture/MULTI_PROGRAMS.md) - Structure Programme → Compétence → Niveau → Séance

- [Améliorations UX](./docs/guides/UX_IMPROVEMENTS.md) - Refonte de l'interface utilisateur

## 🔥 Firebase Data Structure- [Guide Firebase](./docs/setup/FIREBASE_FIX.md) - Configuration Firebase pour React Native

- [Tests Système](./docs/guides/TESTING.md) - Guide de test complet

### `users/{userId}`## 🔥 Firebase & Firestore

```javascript

{### Collections Structure

  displayName: "Obi Way",      // Username

  globalLevel: 15,              // Overall level (1000 XP = 1 level)```javascript

  globalXP: 14500,              // Total XP earned (all time)users/{userId}/

  title: "Warrior",             // Title based on level├── activePrograms: ["running", "streetworkout"]

  streakDays: 7,                // Consecutive days active├── stats: { globalXP, globalLevel, title }

  avatarId: 0,                  // Avatar identifier (0-5)└── programs: { 

  activePrograms: ["street-workout-basics"]    "running": { level: 3, xp: 2500, completedSkills: [...] }

}}

```

workoutSessions/{sessionId}/

### `dailyChallenges/{date}`├── userId

```javascript├── programId

{├── skillId

  id: "2025-11-03",├── score (0-100)

  title: "50 Push-ups",        // Exercise name├── xpGained

  type: "pompes",               // Exercise type└── completedAt

  targetReps: 50,```

  xpReward: 150,

  submitted: false,             // User submitted video?### Security Rules

  videoUrl: "gs://..."          // Firebase Storage path

}```javascript

```rules_version = '2';

service cloud.firestore {

### `skillChallenges/{challengeId}`  match /databases/{database}/documents {

```javascript    match /users/{userId} {

{      allow read, write: if request.auth.uid == userId;

  programId: "street-workout-basics",    }

  levelId: 3,    match /workoutSessions/{doc=**} {

  title: "Master the Pull-up",      allow read, write: if request.auth.uid == resource.data.userId;

  status: "available",          // available | pending | approved | rejected    }

  exercises: [  }

    { name: "Pull-ups", sets: 3, reps: 8 }}

  ],```

  xpReward: 500,

  difficulty: "medium"          // easy | medium | hard## 🎮 Features

}

```### ✅ Implemented

- ✅ 2 complete programs (Running 11 levels, StreetWorkout 22 levels)

### `workoutSessions/{sessionId}`- ✅ Multi-select programs (up to 2 active)

```javascript- ✅ Skill tree with visual SVG connections

{- ✅ Guided workout sessions with timers

  userId: "abc123",- ✅ Automatic scoring system

  type: "challenge",            // "challenge" or "training"- ✅ XP rewards & level progression

  exercises: [- ✅ Statistics & progress charts

    { name: "Pull-ups", sets: 3, reps: [8, 7, 6] }- ✅ Firebase authentication

  ],- ✅ Real-time data sync

  xpEarned: 500,                // 0 for training, calculated for challenges

  score: 850,                   // Performance score (0-1000)### 🎯 For Future Releases

  createdAt: Timestamp- Push notifications for workouts

}- Social features (leaderboards)

```- Apple HealthKit integration

- Offline mode with sync

## 🎮 Key Features- Custom workout creation

- Video tutorials

### Battle Screen (Main Screen)

1. **Header:** Username, level, XP bar, streak, global rank (#12)## 📦 Build & Deploy

2. **Défi du Jour:** Daily video challenge (e.g., "50 Push-ups")

3. **Quête Principale:** Recommended skill challenge for today### **IMPORTANT: Keystore Security**

4. **Quêtes Secondaires:** All available skill challenges (grid layout)

5. **Historique:** Past challenge completions```bash

# Your keystore password

### Training vs ChallengesPassword: 12031990Robin!

- **Challenges:** Earn XP based on performance (score ≥ 800 = level validated)Keystore file: android/hybridrpg-release.keystore

- **Training:** Practice mode, 0 XP, just records session for stats

⚠️ NEVER commit keystore to git!

### Progression System⚠️ NEVER share password in code!

- **Leveling:** 1000 XP = 1 level```

- **Titles:** Débutant (Lv 1-3) → Apprenti (Lv 4-6) → Guerrier (Lv 7-10) → Champion (Lv 11-15) → Légende (Lv 16+)

- **Ranking:** Global leaderboard based on `globalXP`### **Build Steps**

- **Streak:** Consecutive days active (resets if no activity)

```bash

## 📖 Documentation# 1. Create signed APK

cd android

Complete documentation in [`/docs`](./docs):cmd /c gradlew.bat bundleRelease



- **[Battle Screen Redesign](./docs/BATTLE_SCREEN_REDESIGN_PROMPT.md):** Complete design specifications for UI overhaul# 2. Output location

- **[Architecture](./docs/architecture/):** System design and data flowandroid/app/build/outputs/bundle/release/app-release.aab

- **[Setup Guides](./docs/setup/):** Firebase configuration, Android setup

- **[Components](./docs/components/):** Documentation for each component# 3. Upload to Play Store

https://play.google.com/console

## 🚧 Current Development Status```



### ✅ Implemented### **Play Store Deployment**

- Authentication (email/password + phone number)

- Daily challenges with video submission1. **Create Internal Testing Release**

- Skill challenges (quêtes) system   - Upload app-release.aab

- Training mode (0 XP)   - Add yourself as tester

- Challenge mode (earns XP)   - Get test link

- Global ranking system

- Streak tracking2. **Test on Real Device**

- Battle screen with all sections   - Download from Play Store link

- Workout session tracking   - Verify Firebase works

   - Test all features

### 🔄 In Progress

- Battle screen UI/UX redesign (RPG aesthetic)3. **Submit for Review**

- Navigation icons with active states   - Complete all metadata

- Character avatar evolution system   - Add screenshots

- Animated XP gains and level-ups   - Submit once testing passes



### 🎯 Roadmap4. **Production Release**

- Push notifications for daily challenges   - Google reviews (24-48 hours)

- Social features (friends, leaderboards)   - App goes live!

- Apple Health / Google Fit integration

- Offline mode with sync## 🧪 Testing

- More workout programs

- Video challenge feed### Local Testing

```bash

## 🔧 Developmentnpm start

# Press 'a' for Android Emulator

### Running the App# All features available for testing

```

```bash

# Start development server### Device Testing (No USB Cable)

npx expo start```bash

# Transfer APK via:

# Run on Android (requires Android Studio)# 1. Email

npx expo run:android# 2. Google Drive

# 3. Bluetooth

# Run on iOS (requires Xcode, macOS only)# 4. Local WiFi share

npx expo run:ios

```# Or via Play Store internal testing link

```

### Build for Production

## 📋 Important Files & Configs

```bash

# Android APK| File | Purpose | Status |

cd android|------|---------|--------|

./gradlew assembleRelease| `app.json` | Expo config | ✅ Production ready |

| `eas.json` | EAS build config | ✅ Configured |

# Output: android/app/build/outputs/apk/release/app-release.apk| `android/app/build.gradle` | Gradle signing config | ✅ Configured |

| `hybridrpg-release.keystore` | Signing key | 🔐 Secure storage |

# Android App Bundle (for Play Store)| `.env` | Firebase credentials | 🔐 Secure storage |

./gradlew bundleRelease| `android/gradle.properties` | Build properties | ✅ Optimized |



# Output: android/app/build/outputs/bundle/release/app-release.aab## ✅ Deployment Checklist

```

Before submitting to Play Store:

### Environment Variables

- [ ] All features tested on real device

Create `.env` file:- [ ] Firebase auth working correctly

```bash- [ ] No console errors or warnings

FIREBASE_API_KEY=your_api_key- [ ] ProGuard enabled (code obfuscation)

FIREBASE_AUTH_DOMAIN=your_auth_domain- [ ] Shrink resources enabled (optimized size)

FIREBASE_PROJECT_ID=your_project_id- [ ] App icon set correctly

# ... other Firebase config- [ ] Splash screen working

```- [ ] All permissions justified



## 🐛 TroubleshootingFor Play Store:



### "Native module RNFBAAppModule not found"- [ ] App name: "HybridRPG"

→ You're trying to use Expo Go. Use `npx expo run:android` instead.- [ ] Category: Health & Fitness

- [ ] Privacy policy URL

### Build fails with Firebase errors- [ ] Screenshots uploaded (2-5)

→ Check `android/app/google-services.json` exists and is valid.- [ ] Description complete

- [ ] Internal testing passed

### Challenges don't load on Battle screen- [ ] Keystore file secured

→ Check Firestore rules allow user to read `skillChallenges` collection.- [ ] Credentials not in git



### XP not updating after challenge## 🔗 Resources

→ Verify `type: "challenge"` is set in `workoutSessions` document.

- **GitHub:** https://github.com/robinallainmkg/fitnessrpg

## 🤝 Contributing- **Play Store:** https://play.google.com/store/apps/details?id=com.fitnessrpg.app

- **Expo Docs:** https://docs.expo.dev

Contributions welcome! Check [docs/](./docs) for architecture before starting.- **Firebase Docs:** https://firebase.google.com/docs

- **React Native:** https://reactnative.dev

## 📄 License

## 📞 Troubleshooting

MIT License

### Build fails with "no firebase app created"

---→ Check `.env` and Firebase initialization



**📱 Main Project:** React Native (this root folder)  ### App crashes on startup

**🗑️ Legacy Project:** `FitnessGameApp/` (iOS SwiftUI prototype - not maintained)  → Check Firestore rules and authentication

**🔗 GitHub:** https://github.com/robinallainmkg/fitnessrpg

### APK exceeds size limits

**Status:** Active development  → Verify ProGuard and Shrink Resources are enabled

**Platform:** Android (primary), iOS (future)  

**Last Updated:** November 3, 2025### Play Store review rejected

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
