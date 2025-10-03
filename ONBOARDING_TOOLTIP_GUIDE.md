# 🎯 Système de Tooltip d'Onboarding - Documentation Technique

## Vue d'ensemble

Système de tooltip unique qui guide les nouveaux utilisateurs vers l'arbre de compétences après leur première sélection de programmes. Le tooltip apparaît une seule fois et est sauvegardé dans AsyncStorage.

## 🔄 Flux d'Implémentation

### 1. Déclenchement dans ProgramSelectionScreen
```javascript
// Navigation conditionnelle après validation programmes
if (Object.keys(existingPrograms).length === 0) {
  // Nouvel utilisateur → trigger tooltip
  navigation.navigate('Main', { 
    screen: 'Home',
    params: { triggerTreeTooltip: true }
  });
} else {
  // Utilisateur existant → navigation normale
  navigation.navigate('Home');
}
```

### 2. Détection dans HomeScreen
```javascript
useEffect(() => {
  const checkTooltip = async () => {
    const shown = await AsyncStorage.getItem('@fitnessrpg:tree_tooltip_shown');
    const trigger = route.params?.triggerTreeTooltip;
    
    if (trigger && shown !== 'true' && userPrograms.length > 0) {
      setTimeout(() => measureFirstCard(), 600);
    }
  };
  
  if (!loading && userPrograms.length > 0) {
    checkTooltip();
  }
}, [route.params, loading, userPrograms]);
```

### 3. Mesure et Affichage
```javascript
const measureFirstCard = () => {
  if (firstCardRef.current) {
    firstCardRef.current.measure((x, y, width, height, pageX, pageY) => {
      setCardLayout({ x: pageX, y: pageY, width, height });
    });
  }
};

// La première ProgramProgressCard est wrappée avec une ref
<View key={program.id} ref={firstCardRef} collapsable={false}>
  <ProgramProgressCard ... />
</View>
```

## 🎨 Composant TreeTooltipOverlay

### Fonctionnalités
- **Overlay semi-transparent** : 85% d'opacité noire
- **Spotlight doré** : Bordure dorée autour de la carte ciblée
- **Tooltip animé** : Bulle d'information avec animations
- **Emoji animé** : Pointer avec animation bounce
- **Touch to dismiss** : Tap anywhere pour fermer

### Animations
```javascript
// Animation d'entrée séquentielle
Animated.parallel([
  overlayOpacity: 0 → 0.85 (300ms),
  Animated.sequence([
    delay(150ms),
    tooltipTranslate: 20 → 0 (400ms),
    tooltipOpacity: 0 → 1 (400ms)
  ])
])

// Animation bounce infinie pour l'emoji
Animated.loop([
  emojiScale: 1 → 1.15 (400ms),
  emojiScale: 1.15 → 1 (400ms)
])
```

### Positionnement Dynamique
```javascript
const tooltipTop = cardLayout.y + cardLayout.height + 20;

// Spotlight positionné sur la carte
top: cardLayout.y - 4,
left: cardLayout.x - 4,
width: cardLayout.width + 8,
height: cardLayout.height + 8
```

## 💾 Persistance AsyncStorage

### Clé de stockage
```javascript
const STORAGE_KEY = '@fitnessrpg:tree_tooltip_shown';
```

### Logique de sauvegarde
```javascript
const handleTooltipDismiss = async () => {
  // 1. Marquer comme vu définitivement
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
  
  // 2. Fermer le tooltip
  setShowTooltip(false);
  
  // 3. Naviguer vers l'arbre du premier programme
  const firstProgram = userPrograms.find(up => up.isStarted);
  if (firstProgram) {
    navigation.navigate('SkillTree', { programId: firstProgram.program.id });
  }
};
```

## 🔧 États et Refs Nécessaires

### États HomeScreen
```javascript
const [showTooltip, setShowTooltip] = useState(false);
const [cardLayout, setCardLayout] = useState(null);
const firstCardRef = useRef(null);
```

### Conditions d'Affichage
1. **Trigger reçu** : `route.params?.triggerTreeTooltip === true`
2. **Jamais vu** : `AsyncStorage.getItem() !== 'true'`
3. **Programmes chargés** : `userPrograms.length > 0`
4. **Layout mesuré** : `cardLayout !== null`

## 🎯 Timing et Performance

### Délais Optimisés
- **600ms** avant mesure : Attendre le rendu complet
- **150ms** délai animation : Éviter l'effet brusque
- **300-400ms** animations : Fluidité naturelle

### Nettoyage Mémoire
```javascript
useEffect(() => {
  const bounceLoop = Animated.loop(...);
  bounceLoop.start();
  
  return () => bounceLoop.stop(); // Cleanup automatique
}, []);
```

## 🚦 Tests et Validation

### Reset pour Tests
```javascript
// Pour retester le tooltip en développement
await AsyncStorage.removeItem('@fitnessrpg:tree_tooltip_shown');
```

### Conditions de Test
1. Nouvel utilisateur sans programmes
2. Sélection de programmes via ProgramSelectionScreen
3. Navigation vers HomeScreen avec trigger
4. Affichage du tooltip sur la première carte
5. Tap pour fermer et naviguer vers SkillTree

## 📱 Compatibilité

### Dépendances
- `@react-native-async-storage/async-storage` : Persistance
- `react-native` : Animations et mesures
- Expo SDK 54+ compatible

### Plateformes
- ✅ iOS : Support complet animations et mesures
- ✅ Android : Support complet avec fallbacks
- ✅ Web : AsyncStorage polyfill automatique

## 🔄 Extensions Possibles

### Tooltips Additionnels
```javascript
// Structure extensible pour autres tooltips
const TOOLTIP_KEYS = {
  TREE_INTRO: '@fitnessrpg:tree_tooltip_shown',
  STATS_INTRO: '@fitnessrpg:stats_tooltip_shown',
  WORKOUT_INTRO: '@fitnessrpg:workout_tooltip_shown'
};
```

### Configuration Dynamique
```javascript
// Props configurables pour réutilisation
<TreeTooltipOverlay 
  cardLayout={cardLayout}
  onDismiss={handleDismiss}
  title="Custom title"
  subtitle="Custom subtitle"
  emoji="🎯"
  color="#FF6B35"
/>
```

## 🎮 Expérience Utilisateur

### Objectif
Guider naturellement les nouveaux utilisateurs vers leur premier arbre de compétences sans être intrusif.

### Flow UX
1. **Sélection programmes** → Validation
2. **Retour HomeScreen** → Tooltip apparaît automatiquement
3. **Tap tooltip** → Navigation directe vers SkillTree
4. **Plus jamais affiché** → Expérience fluide

### Feedback Visuel
- **Spotlight doré** : Attire l'attention sur la bonne carte
- **Animation bounce** : Indique clairement l'action à faire
- **Transition fluide** : Navigation immédiate vers l'objectif
