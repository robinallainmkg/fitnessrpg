# Battle Screen - RPG Gaming Redesign Prompt

## 🎯 Context
Design a complete, immersive RPG-style Battle screen for a fitness gamification mobile app. The user progresses through workout programs represented as epic quests, earning XP and leveling up their character.

## 📱 Current Technical Stack
- **React Native + Expo**
- **Design System**: RPG theme with medieval fantasy aesthetics
- **Data Structure**: User has active programs, daily challenges, skill challenges (quests), workout history
- **Navigation**: 3 tabs ONLY - **Programme** | **Battle** | **Entraînement** (NO Home, NO Profile tabs)

## 🔴 CRITICAL: Real Data Structure (DO NOT INVENT DATA)

### **Available User Data (from Firestore `users` collection)**
```javascript
{
  displayName: "Obi Way",           // Username
  globalLevel: 15,                   // Overall level (1000 XP = 1 level)
  globalXP: 14500,                   // Total XP earned
  title: "Warrior",                  // Title based on level (Débutant, Apprenti, Guerrier, Champion, Légende)
  streakDays: 7,                     // Consecutive days active
  avatarId: 0,                       // Avatar identifier (0-5)
  // NO "power", NO "gems", NO other metrics
}
```

### **Daily Challenge Data (from `dailyChallenges` collection)**
```javascript
{
  id: "2025-11-03",
  title: "50 Push-ups",             // Exercise name
  type: "pompes",                    // Exercise type
  targetReps: 50,                    // Target to achieve
  xpReward: 150,                     // XP for completion
  submitted: false,                  // User submission status
  videoUrl: "https://...",           // Submission video (if submitted)
  // User submits VIDEO, admin validates
}
```

### **Skill Challenge Data (from `skillChallenges` collection)**
```javascript
{
  programId: "street-workout-basics",
  levelId: 3,
  title: "Master the Pull-up",
  status: "available",               // available | pending | approved | rejected
  exercises: [
    { name: "Pull-ups", sets: 3, reps: 8 }
  ],
  xpReward: 500,
  difficulty: "medium",              // easy | medium | hard
  // NO "boss names", NO fantasy titles (use real program names)
}
```

### **Workout History Data (from `workoutSessions` collection)**
```javascript
{
  type: "challenge",                 // "challenge" or "training"
  exercises: [
    { name: "Pull-ups", sets: 3, reps: [8, 7, 6] }
  ],
  xpEarned: 500,                     // XP gained (0 for training)
  score: 850,                        // Performance score (0-1000)
  createdAt: Timestamp,
  // Challenges give XP, training gives 0 XP
}
```

### **Navigation Structure (EXACT)**
```
ONLY 3 TABS:
┌─────────────────────────────────────┐
│  Programme  |  Battle  | Entraînement │
└─────────────────────────────────────┘

DO NOT add: Home, Profile, Quest, or any other tabs
```

## 🎨 Design Requirements

### **Visual Universe - Manga/Anime RPG Style**
Create a modern RPG aesthetic inspired by:
- **Genshin Impact**: Clean UI with magical particles, gradient overlays, character progression
- **Solo Leveling**: Dark, edgy aesthetic with glowing blue/purple accents, level-up effects
- **Fire Emblem**: Strategic quest cards, clear progression indicators
- **Honkai Star Rail**: Sleek modern UI with fantasy elements, character portraits

**Color Palette:**
- Primary: Deep blue (#1E293B) to purple (#6B21A8) gradients
- Accent: Electric blue (#3B82F6), gold (#FFD700) for rewards
- Energy: Neon cyan (#06B6D4) for active elements
- Danger: Red (#DC2626) for challenges
- Success: Green (#10B981) for completed quests
- Background: Dark navy with subtle animated particles

### **Character Avatar System**
**Evolving Character Design:**
1. **Base Avatar**: Starts as a simple silhouette/rookie character
2. **Level Progression**: Visual changes every 5 levels
   - Level 1-5: Basic warrior outfit, simple animations
   - Level 6-10: Enhanced armor, glowing effects
   - Level 11-20: Epic armor, particle trails, aura effects
   - Level 21+: Legendary appearance, full animated effects

**Avatar Features:**
- Idle animation (breathing, subtle movement)
- Level-up transformation animation
- Equipment/cosmetics unlock based on program completion
- Dynamic pose changes based on streak (confident vs tired)
- Emotion system: Motivated (high streak), Neutral, Tired (low activity)

### **Storytelling Integration**
**Quest Narrative Framework:**
- Each program = Training journey (NO fantasy chapter names)
- Daily challenges = Daily video submission quests
- Skill challenges = Program level progression (use real exercise names)
- NO NPC quest givers (no "Master Kai", "The Titan", etc.)
- NO dialogue system needed

**Keep it simple:**
- Use real program names from Firestore (e.g., "Street Workout Basics")
- Use real exercise names (e.g., "Pull-ups", "Push-ups")
- Add RPG-style visual polish WITHOUT inventing fake narrative elements

## 📐 Screen Layout - Battle Screen

### **1. Header Section (Enhanced)**
```
┌─────────────────────────────────────────┐
│  [Avatar]  Obi Way                 #12  │
│  [====XP Bar====] Lv.15 Warrior         │
│  🔥 7 day streak    14,500 XP total     │
└─────────────────────────────────────────┘
```

**Real Data Displayed:**
- **Avatar**: User's avatarId (0-5) with idle animation
- **Username**: `displayName` from user document
- **Rank**: `#12` - calculated from `globalXP` (user's position vs all users)
- **XP Bar**: Shows progress to next level
  - Current: `globalXP % 1000` (e.g., 14,500 → 500/1000)
  - Gradient fills based on percentage
- **Level**: `globalLevel` (e.g., 15)
- **Title**: `title` (Débutant, Apprenti, Guerrier, Champion, Légende)
- **Streak**: `streakDays` with animated flame emoji
- **Total XP**: `globalXP` displayed

**DO NOT show:**
- ❌ "Power" stat (doesn't exist)
- ❌ "Gems" currency (doesn't exist)
- ❌ Any invented metrics

### **2. Daily Challenge - "Défi du Jour"**
```
┌─────────────────────────────────────────┐
│  📜 DÉFI DU JOUR                        │
│  ┌───────────────────────────────────┐ │
│  │  [Video Icon]   50 Push-ups       │ │
│  │  Type: Pompes                     │ │
│  │  Récompense: +150 XP              │ │
│  │  [SOUMETTRE VIDÉO] →              │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Real Data from `dailyChallenges`:**
- **Title**: `challenge.title` (e.g., "50 Push-ups")
- **Type**: `challenge.type` (e.g., "pompes", "tractions", "squats")
- **Target**: `challenge.targetReps` (e.g., 50)
- **XP Reward**: `challenge.xpReward` (e.g., 150)
- **Status**: 
  - Not submitted: Show "SOUMETTRE VIDÉO" button
  - Submitted (`submitted: true`): Show "En attente de validation"
  - No `videoUrl`: User must record/upload video

**DO NOT show:**
- ❌ NPC names like "Master Kai" (not in data)
- ❌ Countdown timer (challenges don't expire)
- ❌ Quest giver portraits (doesn't exist)

### **3. Main Quest - "Quête Principale"**
```
┌─────────────────────────────────────────┐
│  ⚔️ QUÊTE PRINCIPALE                    │
│  ┌───────────────────────────────────┐ │
│  │  Master the Pull-up               │ │
│  │  Programme: Street Workout Basics │ │
│  │  Niveau 3                         │ │
│  │                                   │ │
│  │  � 3 séries × 8 Pull-ups         │ │
│  │  🎁 +500 XP                       │ │
│  │  Difficulté: ●●●○○ Moyen          │ │
│  │  [COMMENCER] →                    │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Real Data from `skillChallenges` (recommended for today):**
- **Title**: `challenge.title` (e.g., "Master the Pull-up")
- **Program**: `programId` → load program name from Firestore
- **Level**: `levelId` (e.g., 3)
- **Exercises**: Display `challenge.exercises` 
  - Format: "{sets} séries × {reps} {name}"
  - Example: "3 séries × 8 Pull-ups"
- **XP Reward**: `challenge.xpReward` (e.g., 500)
- **Difficulty**: `challenge.difficulty` 
  - "easy" = ●●○○○ Facile
  - "medium" = ●●●○○ Moyen
  - "hard" = ●●●●● Difficile
- **Status**: `challenge.status`
  - "available" = Show "COMMENCER" button
  - "pending" = Show "En attente de validation"
  - "approved" = Don't show (completed)

**DO NOT show:**
- ❌ Fantasy boss names (use real exercise names)
- ❌ "Titan's Trial" or invented quest names
- ❌ Rarity borders (Bronze/Silver/Gold) - doesn't exist

### **4. Side Quests - "Quêtes Secondaires"**
```
┌─────────────────────────────────────────┐
│  🗡️ QUÊTES SECONDAIRES                 │
│  ┌─────────────────┐ ┌───────────────┐│
│  │ Push-up Test    │ │ Squat Power   ││
│  │ Niveau 2        │ │ Niveau 1      ││
│  │ +200 XP    ●●○ │ │ +180 XP   ●○○││
│  └─────────────────┘ └───────────────┘│
│  ┌─────────────────┐ ┌───────────────┐│
│  │ Dip Challenge   │ │ Core Strength ││
│  │ Niveau 4        │ │ Niveau 3      ││
│  │ +300 XP   ●●●● │ │ +250 XP  ●●●○││
│  └─────────────────┘ └───────────────┘│
└─────────────────────────────────────────┘
```

**Real Data from `skillChallenges` (all available):**
Display challenges where `status === "available"` or `status === "pending"` or `status === "rejected"`

**For each challenge, show:**
- **Title**: `challenge.title`
- **Level**: `levelId`
- **XP**: `xpReward`
- **Difficulty**: Visual dots based on `difficulty`
  - easy: ●○○
  - medium: ●●○
  - hard: ●●●
- **Status Badge**: 
  - "pending" → Show yellow "En attente" badge
  - "rejected" → Show red "Refusé" badge
  - "available" → No badge

**DO NOT show:**
- ❌ "NEW", "LOCKED" statuses (not in data)
- ❌ Invented quest names
- ❌ Long-press stats (not implemented)

### **5. Battle History - "Historique des Batailles"**
```
┌─────────────────────────────────────────┐
│  📖 HISTORIQUE DES BATAILLES            │
│  ┌───────────────────────────────────┐ │
│  │ 🏆 Validé • Il y a 2 heures       │ │
│  │ Pull-ups (3×8)                    │ │
│  │ +500 XP  |  Score: 85%            │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ ⚔️ Validé • Hier                  │ │
│  │ Push-ups (4×12)                   │ │
│  │ +200 XP  |  Score: 92%            │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ 💪 Entraînement • Hier            │ │
│  │ Full Body Workout                 │ │
│  │ 0 XP  |  Score: 78%               │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Real Data from `workoutSessions`:**
Filter where `type === "challenge"` OR `exercises.length === 1`

**For each session, display:**
- **Icon**: 
  - 🏆 if `type === "challenge"`
  - 💪 if `type === "training"`
- **Exercise Name**: `exercises[0].name` + sets/reps
  - Format: "{name} ({sets}×{reps})"
  - Example: "Pull-ups (3×8)"
- **XP Earned**: `xpEarned`
  - Challenges: Shows actual XP (e.g., "+500 XP")
  - Training: Shows "0 XP" (training doesn't give XP)
- **Score**: `score / 10` to get percentage (e.g., 850 → 85%)
- **Date**: Format `createdAt` as "Il y a X heures/jours"

**DO NOT show:**
- ❌ "Victory!" text (use "Validé")
- ❌ Perfect score badges (not implemented)
- ❌ Confetti animations on tap (not specified)
- ❌ Weekly/Monthly filters (not implemented yet)

## 🎬 Animation & Micro-interactions

### **Page Load Sequence**
1. **0ms**: Background fades in with particles
2. **100ms**: Header slides down with bounce
3. **200ms**: Daily quest card fades in from left
4. **300ms**: Main quest card scales up from center
5. **400ms**: Side quests stagger in (cascade effect)
6. **500ms**: History section slides up from bottom

### **Interactive Animations**
- **Quest Card Tap**: Scale up (1.02x), glow pulse, haptic feedback
- **Quest Accept**: Card flip animation revealing quest details
- **Quest Complete**: Explosion of particles, XP counter animates up, level-up check
- **XP Gain**: Progress bar fills smoothly with number ticker
- **Streak Milestone**: Flame grows bigger, screen shake, achievement popup

### **Background Ambience**
- Floating particles (speed varies by user level)
- Subtle gradient shift based on time of day
- Parallax layers on scroll
- Energy waves when user is on a streak

## 🎯 Navigation Bar Redesign

### **EXACT Navigation Structure (3 tabs ONLY)**

**Current (Text-based):**
```
[ Programme ] [ Battle ] [ Entraînement ]
```

**Proposed (Icon-based with states):**
```
┌─────────────────────────────────────────┐
│      ⚔️         ⚡         �           │
│   Programme   Battle  Entraînement      │
│                ◉                        │ ← Active indicator
└─────────────────────────────────────────┘
```

### **Icon Specifications (ONLY 3 tabs)**

| Tab | Icon | Label | Active State | Inactive State |
|-----|------|-------|--------------|----------------|
| **Programme** | ⚔️ Crossed Swords | Programme | Glowing gold, scale 1.15x | Gray 50% opacity |
| **Battle** | ⚡ Lightning Bolt | Battle | Electric spark animation | Static gray |
| **Entraînement** | 💪 Flexed Bicep | Entraînement | Pulsing glow | Faded |

**DO NOT add:**
- ❌ Home tab (doesn't exist)
- ❌ Profile tab (doesn't exist)
- ❌ Quest tab (Battle IS the quest tab)
- ❌ Any other tabs

### **Navigation Enhancements**
- **Active indicator**: Glowing line/dot below active tab
- **Press state**: Icon bounces down (scale 0.9x), haptic feedback
- **Badge notifications**: Red dot on Battle when new daily challenge available
- **Smooth transitions**: Fade between screens (200ms duration)
- **Custom icons**: Use SVG or simple emoji (emojis work fine for MVP)

## 🖼️ AI Image Generation Prompts

### **For Skill Challenge Cards (Use Real Exercise Names)**
```
"Fitness challenge card, dark RPG aesthetic, glowing blue energy, 
pull-up exercise illustration, dramatic lighting, particles and magic effects, 
mobile game UI quality, 16:9 card format, modern design"
```

### **For Character Avatar Evolution**
```
Level 1-5: "Beginner fitness warrior, simple athletic wear, determined expression, 
anime style, clean lines, blue color scheme"

Level 10+: "Advanced fitness warrior, enhanced athletic gear, energy aura, 
confident pose, anime RPG style, dramatic lighting, victorious stance"
```

### **For Background Elements**
```
"Dark fantasy gym environment, atmospheric lighting, subtle magical particles, 
RPG game background, depth of field, mobile game quality"
```

**DO NOT generate:**
- ❌ NPC quest giver portraits (not needed)
- ❌ Fantasy boss characters (use real exercises)
- ❌ Dialogue bubbles or speech systems

## 🎨 Design Deliverables Needed

### **From Graphic Designers**
1. **Character Evolution Set** (3-4 stages)
   - Base avatar (Level 1-5)
   - Intermediate (Level 6-10)
   - Advanced (Level 11-20)
   - Elite (Level 21+)
   - Simple idle animations (breathing effect)

2. **Challenge Card Templates**
   - 3 difficulty levels (Easy, Medium, Hard)
   - Active/Inactive states
   - Pending/Rejected status overlays

3. **Navigation Icons**
   - 3 custom icons (Programme, Battle, Entraînement)
   - Active and inactive states
   - Simple press animations (scale effect)

4. **UI Elements Kit**
   - Buttons (primary, secondary)
   - Progress bars (XP bar only)
   - Status badges (En attente, Refusé, Validé)
   - Simple particle effects (XP gain, level-up)

5. **Background Assets**
   - Single parallax layer (optional)
   - Ambient particles
   - Gradient overlays

**NO need for:**
- ❌ NPC portraits
- ❌ Quest giver characters
- ❌ Speech bubbles
- ❌ Dialogue systems
- ❌ Complex Lottie animations (simple CSS/React Native Animated is fine)

## 🔧 Technical Implementation Notes

### **Animation Libraries**
- **Lottie**: Character animations, complex effects
- **React Native Reanimated**: Micro-interactions, layout animations
- **React Native Gesture Handler**: Swipe gestures, card interactions
- **React Native Skia**: Custom graphics, particles

### **Performance Considerations**
- Lazy load images, cache aggressively
- Use `useMemo` for expensive calculations
- Virtualized lists for history section
- Optimize Lottie animations (reduce complexity)
- Implement skeleton loaders during data fetch

### **Assets Organization**
```
assets/
├── characters/
│   ├── avatar_lv1.json (Lottie)
│   ├── avatar_lv5.json
│   └── avatar_lv10.json
├── npcs/
│   ├── master_kai.png
│   └── the_titan.png
├── quest-cards/
│   ├── common_frame.png
│   ├── rare_frame.png
│   └── legendary_frame.png
├── particles/
│   ├── victory.json
│   └── level_up.json
└── navigation/
    ├── icon_home.svg
    └── icon_battle.svg
```

## 🎯 User Experience Goals

1. **Immediate Clarity**: User knows what to do within 2 seconds
2. **Motivation**: Visual rewards make user excited to complete quests
3. **Progression Feeling**: Every action shows clear growth/improvement
4. **Immersion**: Feels like playing an RPG game, not just tracking workouts
5. **Accessibility**: Beautiful but not overwhelming, clear hierarchy

## 📊 Success Metrics Post-Redesign

- **Engagement**: Daily active users +30%
- **Completion Rate**: Quest completion +25%
- **Session Duration**: Average time in app +40%
- **Retention**: 7-day retention +20%
- **Delight**: NPS score improvement from user feedback

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
- New navigation bar with icons
- Enhanced header with animated avatar
- Basic card redesigns (no animations yet)

### **Phase 2: Visual Polish (Week 3-4)**
- AI-generated boss cards
- Character evolution system (3 levels minimum)
- Particle effects for key actions

### **Phase 3: Storytelling (Week 5-6)**
- NPC integration
- Quest narrative text
- Dialogue system for quest acceptance

### **Phase 4: Advanced Animations (Week 7-8)**
- Full Lottie character animations
- Complex page transitions
- Victory sequences and celebrations

---

**Budget Recommendations:**
- **AI Image Generation**: $200-500 (Midjourney + refinements)
- **Character Artist**: $2,000-5,000 (evolution set + animations)
- **UI/UX Designer**: $3,000-7,000 (full redesign + asset kit)
- **Motion Designer**: $1,500-3,000 (Lottie animations)

**Total Estimated**: $6,700 - $15,500 for complete redesign

This creates a world-class RPG fitness experience that rivals top mobile games while maintaining workout functionality.
