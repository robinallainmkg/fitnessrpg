# 🎮 Guide d'Intégration - Battle Screen V2

## ✅ Ce qui a été créé

### **1. NavigationBarV2** 
`src/components/navigation/NavigationBarV2.js`

Navigation RPG professionnelle avec:
- ⚔️ `sword-cross` → Programme
- ⚡ `flash` → Battle  
- 💪 `dumbbell` → Entrainement
- Glow effects sur tab active
- Animations scale au tap
- Support notifications badges

### **2. BattleScreenHeroLanding**
`src/screens/BattleScreenHeroLanding.js`

Écran d'accueil épique style League of Legends:
- Avatar animé avec bounce + glow
- Bouton central "COMMENCER L'AVENTURE"
- Quick stats footer (streak, XP, rank)
- Background avec gradient overlay

### **3. QuestSelectionModal**
`src/components/modals/QuestSelectionModal.js`

Modal de sélection de quête style ranked:
- 📅 **Défi du Jour** (+150 XP)
- ⚔️ **Quête Principale** (+500 XP)
- 🗺️ **Quêtes Secondaires** (XP variable)
- Animations slide-in
- Blur background

---

## 🔧 Étapes d'intégration

### **Étape 1: Installer dépendances manquantes (si besoin)**

```bash
npx expo install expo-blur expo-linear-gradient
```

### **Étape 2: Intégrer NavigationBarV2 dans App.js**

**Fichier**: `App.js`

**Avant** (ligne ~58):
```javascript
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        // ...
      }}
    >
      <Tab.Screen 
        name="Battle" 
        component={BattleScreen}
        options={{ 
          tabBarButton: (props) => <CustomTabBarButton {...props} label="BATTLE" />,
        }}
      />
      // ... autres tabs
    </Tab.Navigator>
  );
};
```

**Après** (remplacer par):
```javascript
import NavigationBarV2 from './src/components/navigation/NavigationBarV2';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const [activeTab, setActiveTab] = React.useState('Battle');

  return (
    <View style={{ flex: 1 }}>
      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'Programme' && <ProgramScreen />}
        {activeTab === 'Battle' && <BattleScreenHeroLanding />}
        {activeTab === 'Entrainement' && <EntrainementScreen />}
      </View>

      {/* Navigation V2 */}
      <NavigationBarV2
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={{
          Battle: true, // Badge si nouveau daily challenge
        }}
      />
    </View>
  );
};
```

**OU** (version plus propre avec React Navigation):

Garder Tab.Navigator mais custom tabBar:

```javascript
import NavigationBarV2 from './src/components/navigation/NavigationBarV2';

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Programme" component={ProgramScreen} />
      <Tab.Screen name="Battle" component={BattleScreenHeroLanding} />
      <Tab.Screen name="Entrainement" component={EntrainementScreen} />
    </Tab.Navigator>
  );
};

// Custom tab bar component
const CustomTabBar = ({ state, navigation }) => {
  const activeTab = state.routes[state.index].name;

  const handleTabChange = (tabName) => {
    navigation.navigate(tabName);
  };

  return (
    <NavigationBarV2
      activeTab={activeTab}
      onTabChange={handleTabChange}
      notifications={{
        Battle: true, // TODO: Calculer dynamiquement
      }}
    />
  );
};
```

### **Étape 3: Connecter BattleScreenHeroLanding aux vraies données**

**Fichier**: `src/screens/BattleScreenHeroLanding.js`

**Remplacer** (ligne ~75):
```javascript
const loadUserStats = async () => {
  // TODO: Charger depuis Firestore
  // Pour l'instant, données mock
  setUserStats({
    displayName: user?.displayName || 'Guerrier',
    globalLevel: 15,
    globalXP: 14500,
    title: 'Champion',
    streakDays: 7,
    avatarId: 0,
  });
};
```

**Par**:
```javascript
const loadUserStats = async () => {
  if (!user?.uid) return;
  
  try {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUserStats({
        displayName: data.displayName || user.displayName || 'Guerrier',
        globalLevel: data.globalLevel || 1,
        globalXP: data.globalXP || 0,
        title: data.title || 'Débutant',
        streakDays: data.streakDays || 0,
        avatarId: data.avatarId || 0,
      });
    }
  } catch (error) {
    console.error('❌ Erreur chargement stats:', error);
  }
};
```

**Ajouter imports**:
```javascript
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from '../config/firebase.simple';
const firestore = getFirestore();
```

### **Étape 4: Connecter QuestSelectionModal aux données**

**Fichier**: `src/screens/BattleScreenHeroLanding.js`

**Importer le vrai modal**:
```javascript
import QuestSelectionModal from '../components/modals/QuestSelectionModal';
```

**Remplacer** (ligne ~155):
```javascript
{showQuestModal && (
  <QuestSelectionModal
    visible={showQuestModal}
    onClose={() => setShowQuestModal(false)}
    navigation={navigation}
  />
)}
```

**Par**:
```javascript
{showQuestModal && (
  <QuestSelectionModal
    visible={showQuestModal}
    onClose={() => setShowQuestModal(false)}
    navigation={navigation}
    todayChallenge={todayChallenge}
    mainQuest={todaySkillChallenge}
    sideQuests={skillChallenges}
  />
)}
```

**Ajouter le chargement des challenges**:
```javascript
const [todaySkillChallenge, setTodaySkillChallenge] = useState(null);
const [skillChallenges, setSkillChallenges] = useState([]);
const { todayChallenge } = useChallenge();

useEffect(() => {
  if (user?.uid) {
    loadChallenges();
  }
}, [user?.uid]);

const loadChallenges = async () => {
  try {
    const challenges = await getAvailableChallenges(user.uid);
    setSkillChallenges(challenges);
    
    if (challenges.length > 0) {
      const recommended = recommendTodayChallenge(challenges, userStats);
      setTodaySkillChallenge(recommended);
    }
  } catch (error) {
    console.error('❌ Erreur chargement challenges:', error);
  }
};
```

**Imports nécessaires**:
```javascript
import { getAvailableChallenges, recommendTodayChallenge } from '../services/skillChallengeService';
```

---

## 🎨 Customisation

### **Changer les couleurs de navigation**

`src/components/navigation/NavigationBarV2.js` (ligne 17):

```javascript
const TAB_CONFIG = [
  {
    name: 'Programme',
    icon: 'sword-cross',
    activeColor: '#FFD700', // ← Changer ici
    inactiveColor: '#64748B',
  },
  // ...
];
```

### **Changer les game modes**

`src/components/modals/QuestSelectionModal.js` (ligne 28):

```javascript
const GAME_MODES = [
  {
    id: 'daily',
    title: 'DÉFI DU JOUR', // ← Modifier
    xpReward: 150, // ← Ajuster
    gradient: ['#F59E0B', '#EF4444'], // ← Couleurs
    // ...
  },
  // ...
];
```

---

## 🧪 Test rapide

### **1. Tester navigation seule**

Créer un fichier test: `src/screens/NavigationTest.js`

```javascript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import NavigationBarV2 from '../components/navigation/NavigationBarV2';

export default function NavigationTest() {
  const [activeTab, setActiveTab] = useState('Battle');

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: 24 }}>
          Tab actif: {activeTab}
        </Text>
      </View>
      
      <NavigationBarV2
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </View>
  );
}
```

Remplacer temporairement BattleScreen par NavigationTest dans App.js.

### **2. Tester Hero Landing**

```bash
npx expo run:android
```

Naviguer vers Battle tab → voir écran Hero Landing → taper bouton → modal s'ouvre.

---

## 🐛 Troubleshooting

### **Erreur: "expo-blur not found"**
```bash
npx expo install expo-blur
```

### **Erreur: "LinearGradient not found"**
```bash
npx expo install expo-linear-gradient
```

### **Navigation ne change pas de tab**
Vérifier que `onTabChange` est bien appelé et que l'état `activeTab` est mis à jour.

### **Modal ne s'affiche pas**
Vérifier `showQuestModal` state et que `visible={showQuestModal}` est bien passé.

---

## 📊 Métriques à tracker

Après intégration, mesurer:
- ✅ **Temps sur Battle screen** (avant vs après)
- ✅ **Taux de tap sur "COMMENCER L'AVENTURE"** (engagement)
- ✅ **Taux de sélection de chaque game mode** (daily vs main vs side)
- ✅ **Crash rate** (doit rester <0.5%)
- ✅ **Frame rate** (target ≥55fps)

---

## 🚀 Next Steps

1. **A/B test**: Battle V2 (Hero Landing) vs Battle V1 (liste de cards)
2. **Avatar animations**: Implémenter walking sprite ou Lottie
3. **Particles**: Ajouter effet de particules au background
4. **Sound effects**: Bouton tap sound, modal open sound
5. **Haptic feedback**: iOS taptic engine sur interactions

---

**Besoin d'aide ?** Ouvre une issue ou DM @dev 🚀
