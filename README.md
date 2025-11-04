# 🎮 HybridRPG - Fitness Gamification App

> **Gamify your fitness journey with RPG progression, skill trees, and real-time coaching**

![Status](https://img.shields.io/badge/status-ready%20for%20play%20store-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Android%207.0%2B-green)
![Firebase](https://img.shields.io/badge/backend-Firebase-orange)



## 📱 Overview

**HybridRPG** transforms fitness training into an epic RPG adventure with:

- ✅ **RPG Progression System:** Levels, XP (1000 XP = 1 level), Titles (Débutant → Légende)
- ✅ **2 Complete Programs:** Running (11 levels), Street Workout (22 skills)
- ✅ **Skill Trees:** Visual progression with SVG connections and unlocking system
- ✅ **3 Quest Types:** Daily Challenges (video), Main Quest (recommended), Side Quests (available)
- ✅ **Dual Workout Modes:** Training (practice, 0 XP) & Challenge (earn XP)
- ✅ **Guided Workouts:** Real-time coaching with rest timers and rep tracking
- ✅ **Smart Scoring:** Automatic performance calculation (0-1000 points)
- ✅ **Global Ranking:** Leaderboard based on total XP
- ✅ **Streak System:** Consecutive active days tracking
- ✅ **Statistics Dashboard:** Charts, workout history, progress analytics
- ✅ **Firebase Backend:** Real-time cloud sync, authentication, video storage

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



## 📁 Project Structure

```
RpgHybrid/
├── src/
│   ├── components/
│   │   ├── cards/              # WorkoutCard, ProgramProgressCard
│   │   ├── modals/             # QuestSelectionModal
│   │   ├── navigation/         # NavigationBarV2 (custom tab bar)
│   │   ├── UserHeader.js       # User stats header
│   │   ├── DailyChallengeCard.js
│   │   ├── QuestePrincipale.js
│   │   └── ChallengeCard.js
│   ├── screens/
│   │   ├── BattleScreenHeroLanding.js    # Main battle screen (LOL-style)
│   │   ├── ProgramScreen.js              # Program browser
│   │   ├── EntrainementScreen.js         # Training queue
│   │   ├── SkillTreeScreen.js            # Skill tree visualization
│   │   ├── WorkoutScreen.js              # Guided workout session
│   │   ├── WorkoutSummaryScreen.js       # Results & XP gains
│   │   ├── ChallengeScreen.tsx           # Daily video challenges
│   │   ├── AdminReviewScreen.tsx         # Admin validation
│   │   └── ProgressScreen.js             # Statistics
│   ├── services/
│   │   ├── skillChallengeService.js      # Quest/challenge logic
│   │   ├── rankingService.js             # Global leaderboard
│   │   ├── ChallengeService.ts           # Daily challenges
│   │   └── queueService.js               # Session queue
│   ├── contexts/
│   │   ├── AuthContext.js                # Authentication
│   │   ├── WorkoutContext.js             # Workout sessions
│   │   ├── ChallengeContext.tsx          # Daily challenges
│   │   └── ProgramContext.js             # Program management
│   ├── data/
│   │   ├── programs.json                 # 22 Street Workout skills
│   │   └── programmes/                   # Program metadata
│   ├── theme/
│   │   ├── rpgTheme.js                   # RPG design system
│   │   └── colors.js                     # Color palette
│   └── utils/
│       ├── scoring.js                    # Performance calculation
│       └── skillIcons.js                 # Icon mapping
│
├── android/
│   ├── app/
│   │   ├── build.gradle                  # 🔑 Signing config
│   │   └── google-services.json          # Firebase config
│   └── gradle.properties
│
├── assets/
│   ├── programmes/                       # Background images
│   └── avatars/                          # User avatars
│
├── docs/
│   ├── BATTLE_SCREEN_REDESIGN_PROMPT.md  # UI/UX design specs
│   ├── INTEGRATION_GUIDE_BATTLE_V2.md    # Battle V2 integration
│   ├── architecture/                     # System architecture
│   ├── challenges/                       # Challenge system docs
│   ├── components/                       # Component documentation
│   └── setup/                            # Firebase & build setup
│
├── FitnessGameApp/                       # ⚠️ LEGACY iOS prototype (IGNORE)
│
├── app.json                              # Expo config
├── eas.json                              # EAS build profiles
├── package.json
└── README.md                             # This file
```

⚠️ **Note:** `FitnessGameApp/` is a legacy iOS SwiftUI prototype. The main project is React Native in the root directory.

## 🎯 Navigation Structure

The app has **exactly 3 tabs**:

```
┌──────────────────────────────────────────┐
│  Programme  |  Battle  | Entraînement  │
└──────────────────────────────────────────┘
```

- **Programme:** Browse programs, view skill trees, activate/deactivate programs
- **Battle:** Daily challenges, main quest, side quests, challenge history
- **Entraînement:** Training queue, workout sessions, progress tracking

**NO** Home tab, **NO** Profile tab - navigation is simplified to these 3 core screens.

---

## 🎮 How It Works

### 📚 Programs (Programmes)

**What are Programs?**
Programs are complete fitness categories (e.g., "Street Workout", "Running"). Each program contains multiple **skills** organized in a progression tree.

**Structure:**
```
Programme (Category)
  └── Compétence (Skill)
      └── Niveau (Level)
          └── Séance (Workout Session)
              └── Exercice (Exercise)
```

**Example: Street Workout**
- **22 skills** organized in 4 tiers (Beginner → Elite → Legend)
- Skills like "Strict Pull-Ups", "L-Sit Hold", "Muscle-Up"
- Each skill has 3-6 progressive levels
- Visual tree with SVG connections showing prerequisites

**How to activate:**
1. Go to **Programme** tab
2. Browse available programs
3. Select "Activer" on a program card
4. Max 2 active programs at once
5. Skills unlock based on completed levels

**Progression:**
- Complete Level 1 of a skill → Level 2 unlocks
- Complete all levels of prerequisite skills → Next skill unlocks
- Example: Complete "Strict Pull-Ups" Lv3 → "Muscle-Up" becomes available

---

### 🏋️ Entraînement (Training)

**What is Training Mode?**
Training mode lets you practice any available workout **without earning XP**. It's perfect for:
- Learning new exercises
- Improving technique
- Testing your limits before attempting a challenge

**How it works:**

1. **Session Queue**
   - Automatic: System generates available sessions based on your progress
   - Go to **Entraînement** tab → see cards for each available session
   - Each card shows: Program, Skill, Level, XP reward, estimated duration

2. **Starting Training**
   - Tap a session card
   - Select **"MODE ENTRAÎNEMENT"** (Training Mode)
   - No XP earned, but session is recorded for stats

3. **Workout Session**
   - Guided exercise-by-exercise flow
   - Automatic rest timers (60-180 seconds between sets)
   - Rep tracking for each set
   - Progress bar showing completion

4. **After Training**
   - View your score (0-1000 points)
   - See performance vs targets
   - No XP gained
   - Encouraged to attempt **Challenge Mode** next

**Training vs Challenge:**
| Feature | Training Mode | Challenge Mode |
|---------|---------------|----------------|
| XP Earned | ❌ 0 XP | ✅ Based on score |
| Unlocks Levels | ❌ No | ✅ Yes (if score ≥ 800) |
| Purpose | Practice | Progression |
| Recorded | ✅ In history | ✅ In history |

---

### ⚔️ Quêtes (Quests/Challenges)

**3 Types of Quests:**

#### 1️⃣ **Défi du Jour (Daily Challenge)**
- **What:** Video-based challenge refreshed daily
- **How:** 
  1. Go to **Battle** tab
  2. See today's challenge (e.g., "50 Push-ups")
  3. Tap "Enregistrer une vidéo"
  4. Record yourself completing the challenge
  5. Submit video for admin validation
- **Rewards:** +150 XP (after admin approval)
- **Status:** `pending` → `approved` (XP added) or `rejected` (can retry tomorrow)

#### 2️⃣ **Quête Principale (Main Quest)**
- **What:** Recommended skill challenge based on your current progress
- **How:**
  - System analyzes your active programs
  - Recommends next logical level to attempt
  - Shows on **Battle** tab as "Quête Principale"
  - Displays program, level, exercises, XP reward
- **Example:** "Master the Pull-up - Street Workout Lv3 - 3×8 Pull-ups - +500 XP"
- **Start:** Tap → SkillChallengeScreen → Choose Training or Challenge

#### 3️⃣ **Quêtes Secondaires (Side Quests)**
- **What:** All available skill challenges you can attempt
- **How:**
  - Grid of challenge cards on **Battle** tab
  - Filter: `available`, `pending`, or `rejected` challenges
  - Each shows skill, level, XP, difficulty
- **Status badges:**
  - 🎯 **Disponible** - Ready to attempt
  - ⏳ **En attente** - Video submitted, awaiting admin validation
  - ❌ **Refusé** - Rejected, can re-attempt after training
  - ✅ **Validé** - Completed, XP awarded

---

### 🎯 Challenge Mode (Video Validation)

**What is Challenge Mode?**
Challenge mode earns XP and unlocks progression. It requires **video submission** for validation.

**How it works:**

1. **Access Challenge**
   - From **Battle** → tap a quest card
   - Or from **Entraînement** → tap session → **"CHALLENGE MODE"**
   - Opens **SkillChallengeScreen**

2. **Challenge Screen**
   - Shows validation criteria (e.g., "3 sets × 8 pull-ups")
   - Max 3 attempts per day
   - Options:
     - **MODE ENTRAÎNEMENT** - Practice (0 XP)
     - **FAIRE LE CHALLENGE** - Attempt with video (+XP)
     - **PASSER** - Skip (can return later)

3. **Attempting Challenge**
   - Records workout session with rep tracking
   - After completing exercises:
     - **Option A:** Submit video (admin validation, 1-3 days)
     - **Option B:** Auto-validation (immediate, if enabled)

4. **Scoring System**
   ```javascript
   Score = (Actual Reps / Target Reps) × 1000
   
   Example:
   Target: 3 sets × 8 reps = 24 total
   Actual: 8 + 7 + 6 = 21 reps
   Score: (21/24) × 1000 = 875 pts
   ```

5. **XP Calculation**
   ```javascript
   Score ≥ 900: +300 XP
   Score ≥ 800: +250 XP (level unlocked!)
   Score ≥ 700: +200 XP
   Score ≥ 600: +150 XP
   Score < 600: +100 XP
   ```

6. **Level Unlocking**
   - Score ≥ 800 → Level validated ✅
   - Next level in same skill unlocks
   - Stats bonuses awarded (Strength +5, etc.)
   - Global XP increases → may level up globally

---

### 📊 Scoring & Progression

**Performance Scoring:**
```javascript
// For each exercise:
Total Target = Sets × Reps
Total Actual = Sum of all reps performed

// Overall score:
Score = (Total Actual / Total Target) × 1000
Percentage = (Total Actual / Total Target) × 100

// Example:
Exercise 1: Pull-ups - 3×8 = 24 target, 21 actual
Exercise 2: Dips - 3×10 = 30 target, 28 actual
Exercise 3: Rows - 3×12 = 36 target = 32 actual

Total: 90 target, 81 actual
Score = (81/90) × 1000 = 900 pts
Percentage = 90%
```

**Global Progression:**
- **XP → Levels:** 1000 XP = 1 global level
- **Titles:**
  - Lv 1-3: Débutant 🌱
  - Lv 4-6: Apprenti ⚔️
  - Lv 7-10: Guerrier 🛡️
  - Lv 11-15: Champion 🏆
  - Lv 16+: Légende 👑
- **Global Ranking:** Based on total `globalXP` (e.g., #12 worldwide)

**Stat Bonuses:**
When you complete a skill level (score ≥ 800), you gain stat bonuses:
```javascript
{
  strength: +5,      // Pull-ups, muscle-ups
  endurance: +3,     // Running, cardio
  power: +4,         // Explosive movements
  speed: +2,         // Sprint-based skills
  flexibility: +3    // Stretching, yoga
}
```

---

## 🔥 Firebase & Firestore

### Collections Structure

**`users/{userId}`**
```javascript
{
  displayName: "Obi Way",
  email: "user@example.com",
  photoURL: "https://...",
  
  // Global progression
  globalXP: 14500,              // Total XP earned
  globalLevel: 15,              // Floor(globalXP / 1000) + 1
  title: "Champion",            // Title based on level
  
  // Activity tracking
  streakDays: 7,                // Consecutive active days
  lastActiveDate: Timestamp,
  createdAt: Timestamp,
  
  // Avatar & appearance
  avatarId: 0,                  // 0-5 avatar identifier
  
  // Stats system
  stats: {
    strength: 45,
    endurance: 32,
    power: 28,
    speed: 15,
    flexibility: 12
  },
  
  // Active programs (max 2)
  activePrograms: ["running", "streetworkout"],
  
  // Program-specific progress
  programs: {
    running: {
      xp: 2500,
      level: 3,
      completedSkills: ["beginner-run", "interval-training"],
      currentSkill: "hill-sprints"
    },
    streetworkout: {
      xp: 8200,
      level: 8,
      completedSkills: ["strict-pullups", "lsit-hold", "chest-to-bar"],
      currentSkill: "muscle-up-progression",
      unlockedSkills: ["strict-pullups", "lsit-hold", "chest-to-bar", "muscle-up-progression"]
    }
  },
  
  // Admin flag
  isAdmin: false                // true for admins (can review challenges)
}
```

**`workoutSessions/{sessionId}`**
```javascript
{
  userId: "abc123",
  programId: "streetworkout",
  skillId: "strict-pullups",
  levelNumber: 3,
  
  type: "challenge",            // "challenge" or "training"
  mode: "challenge",            // Deprecated, use 'type'
  
  exercises: [
    {
      name: "Pull-ups",
      type: "reps",             // "reps" or "time"
      sets: 3,
      target: 8,                // Target per set
      actual: [8, 7, 6],        // Actual reps per set
      totalTarget: 24,
      totalActual: 21
    },
    {
      name: "Dips",
      type: "reps",
      sets: 3,
      target: 10,
      actual: [10, 9, 8],
      totalTarget: 30,
      totalActual: 27
    }
  ],
  
  score: 850,                   // Performance score (0-1000)
  percentage: 85,               // Percentage of target (%)
  xpEarned: 250,                // XP gained (0 for training mode)
  
  duration: 1200,               // Session duration in seconds
  createdAt: Timestamp,
  completedAt: Timestamp,
  
  queueId: "queue_123",         // Reference to session queue
  
  // Stats bonuses awarded (if level completed)
  statsGained: {
    strength: 5,
    power: 3
  }
}
```

**`skillChallenges/{challengeId}`**
```javascript
{
  id: "user123_streetworkout_strict-pullups_3",
  userId: "user123",
  programId: "streetworkout",
  skillId: "strict-pullups",
  levelId: 3,
  
  title: "Master the Pull-up",
  status: "available",          // available | pending | approved | rejected | skipped
  
  exercises: [
    { name: "Pull-ups", sets: 3, reps: 8 },
    { name: "Dips", sets: 3, reps: 10 }
  ],
  
  xpReward: 500,
  difficulty: "medium",         // easy | medium | hard
  
  maxAttempts: 3,
  maxAttemptsPerDay: 3,
  attemptsTaken: 1,
  
  videoRequired: true,
  videoMinDuration: 30,
  videoMaxDuration: 180,
  
  submittedAt: Timestamp,
  approvedAt: null,
  rejectedAt: null,
  
  attempts: [
    {
      date: Timestamp,
      videoUrl: "gs://...",
      score: 850
    }
  ]
}
```

**`dailyChallenges/{date}/users/{userId}`**
```javascript
{
  date: "2025-11-03",           // YYYY-MM-DD format
  userId: "user123",
  
  challengeType: "50_pushups",  // Type identifier
  title: "50 Push-ups",
  description: "Complete 50 push-ups in one go",
  targetReps: 50,
  xpReward: 150,
  
  submitted: true,
  videoUrl: "gs://challenges/2025-11-03/user123.mp4",
  videoPath: "challenges/2025-11-03/user123.mp4",
  
  status: "pending",            // pending | approved | rejected
  submittedAt: Timestamp,
  approvedAt: null,
  rejectedAt: null,
  
  createdAt: Timestamp
}
```

**`submissions/{submissionId}` (for admin review)**
```javascript
{
  id: "submission_abc123",
  userId: "user123",
  challengeType: "50_pushups",
  videoURL: "gs://...",
  videoFileName: "challenge_user123_2025-11-03.mp4",
  
  status: "pending",            // pending | approved | rejected
  submittedAt: Timestamp,
  reviewedAt: null,
  reviewedBy: null,             // Admin user ID
  reason: null,                 // Rejection reason
  
  xpRewarded: 0                 // Set to XP amount when approved
}
```

### Firebase Storage Structure

```
/challenges/{date}/{userId}_{timestamp}.mp4
/submissions/{userId}/{videoFile}.mp4
/avatars/avatar_{0-5}.png
/programmes/background_{programId}.jpg
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Workout sessions
    match /workoutSessions/{sessionId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Skill challenges
    match /skillChallenges/{challengeId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    // Daily challenges
    match /dailyChallenges/{date}/users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Submissions (admin review)
    match /submissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAdmin();
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

---

## �️ Roadmap

### ✅ Phase 1: Core Foundation (COMPLETED)
- [x] Firebase Authentication (email/password + phone)
- [x] Multi-program architecture (Running + Street Workout)
- [x] Skill tree visualization with SVG connections
- [x] Session queue system
- [x] Guided workout sessions with timers
- [x] Automatic scoring system (0-1000 points)
- [x] XP & leveling system (1000 XP = 1 level)
- [x] Stats system (strength, endurance, power, speed, flexibility)
- [x] Firestore real-time sync

### ✅ Phase 2: Quest System (COMPLETED)
- [x] Daily video challenges
- [x] Skill challenges (main quest + side quests)
- [x] Training vs Challenge modes
- [x] Admin review system for video submissions
- [x] Firebase Storage for video uploads
- [x] Challenge status tracking (pending/approved/rejected)
- [x] Max 3 attempts per day per challenge

### ✅ Phase 3: Battle Screen Redesign (COMPLETED - Nov 2025)
- [x] Hero landing page (LOL/Genshin Impact style)
- [x] NavigationBarV2 with professional icons (no emojis)
- [x] QuestSelectionModal with 3 game modes
- [x] BattleScreenHeroLanding integration
- [x] User stats header with avatar bounce animation
- [x] Central "COMMENCER L'AVENTURE" button
- [x] Real Firestore data integration

### 🔄 Phase 4: Polish & Optimization (IN PROGRESS)
- [x] ProGuard code obfuscation
- [x] Resource shrinking
- [x] Performance optimizations
- [ ] **Testing on physical device** (current blocker: emulator offline)
- [ ] A/B test Battle V1 vs V2 (engagement metrics)
- [ ] Fix hardcoded rank (#12 → calculate from `globalXP`)
- [ ] Load real avatar images from `avatarId`
- [ ] Missing navigation routes (DailyChallenge, WorkoutSession, QuestList)

### 🎯 Phase 5: Social Features (PLANNED - Q1 2026)
- [ ] Global leaderboard (top 100 users by XP)
- [ ] Friends system (add/remove friends)
- [ ] Challenge friends to specific workouts
- [ ] Social feed (workout achievements)
- [ ] Badges & achievements system
- [ ] Profile customization (banners, titles)

### 🎯 Phase 6: Content Expansion (PLANNED - Q2 2026)
- [ ] 5 new programs:
  - [ ] Handstand Mastery (12 skills)
  - [ ] Planche Progression (10 skills)
  - [ ] Front Lever Journey (8 skills)
  - [ ] Boxing Fundamentals (15 skills)
  - [ ] Yoga Flow (20 skills)
- [ ] 100+ new skill levels
- [ ] Video tutorials for each exercise
- [ ] Custom workout builder

### 🎯 Phase 7: Advanced Features (PLANNED - Q3 2026)
- [ ] Push notifications (daily challenge reminder, level unlock)
- [ ] Offline mode with sync (workouts work without internet)
- [ ] Apple HealthKit integration
- [ ] Google Fit integration
- [ ] Wearable support (Apple Watch, Wear OS)
- [ ] Voice coaching during workouts
- [ ] AI-powered form analysis (video)

### 🎯 Phase 8: Monetization (PLANNED - Q4 2026)
- [ ] Freemium model:
  - [ ] Free: 2 programs, daily challenges
  - [ ] Premium: All programs, custom workouts, no ads
- [ ] In-app purchases:
  - [ ] Avatar packs
  - [ ] Premium programs
  - [ ] XP boosters
- [ ] Subscription tiers ($4.99/mo, $39.99/yr)

### 🎯 Phase 9: Platform Expansion (PLANNED - 2027)
- [ ] iOS version (Swift UI rewrite)
- [ ] Web version (React)
- [ ] Desktop app (Electron)
- [ ] Smart TV app (Android TV)

### 🔮 Future Vision (2027+)
- [ ] VR workouts (Meta Quest, Apple Vision Pro)
- [ ] AR form correction (phone camera)
- [ ] Live coaching sessions
- [ ] Community challenges (global events)
- [ ] Integration with gym equipment
- [ ] Corporate wellness programs
- [ ] Coaching certification program

---

## 📖 Documentation

## 📖 Documentation

Complete documentation in the **[`/docs`](./docs/README.md)** folder:

- **🔧 [Setup](./docs/setup/)** - Android & Firebase installation
- **🏗️ [Architecture](./docs/architecture/)** - Multi-program structure
- **📘 [Guides](./docs/guides/)** - UX, workflows, testing
- **🧩 [Components](./docs/components/)** - Component documentation
- **⚔️ [Challenges](./docs/challenges/)** - Daily challenge system
- **🔗 [Resources](./docs/GITHUB_URLS.md)** - Useful links

### Key Documents

- [Multi-Program Architecture](./docs/architecture/MULTI_PROGRAMS.md) - Program → Skill → Level → Session
- [Battle Screen Redesign](./docs/BATTLE_SCREEN_REDESIGN_PROMPT.md) - UI/UX specifications  
- [Battle V2 Integration](./docs/INTEGRATION_GUIDE_BATTLE_V2.md) - Implementation guide
- [Daily Challenges](./docs/challenges/README.md) - Video submission & admin validation
- [Firebase Setup](./docs/setup/FIREBASE_FIX.md) - Firebase configuration
- [System Testing](./docs/guides/TESTING.md) - Complete testing guide

---

## � Quick Start

```bash
# Installation
npm install

# Development (Requires development build, NOT Expo Go)
npm start
# Press 'a' for Android, 'i' for iOS

# Production Build
cd android && cmd /c gradlew.bat bundleRelease
```

⚠️ **Important:** This app uses `@react-native-firebase` which requires a native development build, **NOT Expo Go**.

---

## 🔧 Development

### Running the App

```bash
# Start development server
npx expo start

# Run on Android (requires Android Studio)
npx expo run:android

# Run on iOS (requires Xcode, macOS only)
npx expo run:ios
```

### Code Style

- **Components:** Functional with hooks
- **State:** Context API + local useState
- **Naming:** camelCase for files, PascalCase for components
- **Formatting:** Prettier (auto on save)

### Key Branches

- **main** - Production ready, all tests passing
- **develop** - Development branch, new features

---

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

---

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

---

## 📋 Important Files & Configs

| File | Purpose | Status |
|------|---------|--------|
| `app.json` | Expo config | ✅ Production ready |
| `eas.json` | EAS build config | ✅ Configured |
| `android/app/build.gradle` | Gradle signing config | ✅ Configured |
| `hybridrpg-release.keystore` | Signing key | 🔐 Secure storage |
| `.env` | Firebase credentials | 🔐 Secure storage |
| `android/gradle.properties` | Build properties | ✅ Optimized |

---

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

---

## � Troubleshooting

### "Native module RNFBAAppModule not found"
→ You're trying to use Expo Go. Use `npx expo run:android` instead.

### Build fails with Firebase errors
→ Check `android/app/google-services.json` exists and is valid.

### Challenges don't load on Battle screen
→ Check Firestore rules allow user to read `skillChallenges` collection.

### XP not updating after challenge
→ Verify `type: "challenge"` is set in `workoutSessions` document.

### Emulator offline
→ Restart emulator or test on physical device via USB debugging.

---

## 📈 Performance Optimizations

- ✅ ProGuard: Code obfuscation & optimization
- ✅ Shrink Resources: Remove unused assets
- ✅ Lean Core: Only essential dependencies
- ✅ LazyLoad: Programs load on demand
- ✅ Memoization: React.memo for heavy components

---

## � Resources

- **GitHub:** https://github.com/robinallainmkg/fitnessrpg
- **Play Store:** https://play.google.com/store/apps/details?id=com.fitnessrpg.app
- **Expo Docs:** https://docs.expo.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **React Native:** https://reactnative.dev

---

## 🤝 Contributing

Contributions welcome! Check [docs/](./docs) for architecture before starting.

---

## 📄 License

MIT License - See LICENSE file

---

**📱 Main Project:** React Native (this root folder)  
**🗑️ Legacy Project:** `FitnessGameApp/` (iOS SwiftUI prototype - not maintained)  
**🔗 GitHub:** https://github.com/robinallainmkg/fitnessrpg  
**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Maintainer:** Robin Allain  

**Next Steps:** Submit to Google Play Store for internal testing and review! 🚀
