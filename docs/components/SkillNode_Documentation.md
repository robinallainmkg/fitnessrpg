# Documentation - Composant SkillNode

## 🎯 Vue d'ensemble

Le composant `SkillNode` représente un nœud individuel dans l'arbre de compétences Street Workout. Il affiche visuellement l'état de progression d'un programme avec des animations et des indicateurs clairs.

## 📋 Props

```javascript
SkillNode({
  program,        // Objet programme avec {id, name, icon, color, difficulty, levels}
  userProgress,   // Objet progression avec {currentLevel, unlockedLevels, completedLevels}
  isUnlocked,     // Boolean - programme accessible
  isCompleted,    // Boolean - programme terminé
  onPress         // Function callback quand pressé
})
```

## 🎨 États Visuels

### 1. LOCKED (Verrouillé) 🔒
**Conditions :** `!isUnlocked && !isCompleted`
- **Apparence :** Opacity 0.4, pas cliquable
- **Badge :** Icône 🔒 en haut à droite
- **Interaction :** Disabled, aucune réaction au touch

### 2. UNLOCKED (Débloqué) ✨
**Conditions :** `isUnlocked && currentLevel === 1`
- **Apparence :** Glow effect avec program.color
- **Animation :** Pulse subtil (scale 1.0 → 1.05 → 1.0)
- **Border :** Couleur du programme
- **Interaction :** Cliquable avec animation de pression

### 3. IN_PROGRESS (En cours) 📊
**Conditions :** `isUnlocked && currentLevel > 1 && !isCompleted`
- **Apparence :** Background léger program.color (20% opacity)
- **Progression :** Barre en bas montrant currentLevel/totalLevels
- **Badge :** "En cours" en orange
- **Interaction :** Cliquable

### 4. COMPLETED (Complété) ✅
**Conditions :** `isCompleted === true`
- **Apparence :** Background program.color (30% opacity)
- **Border :** Verte (colors.success)
- **Badge :** ✅ en haut à droite
- **Interaction :** Cliquable (pour refaire)

## 🎭 Animations

### Pulse Animation (UNLOCKED)
```javascript
scale: 1.0 → 1.05 → 1.0 (durée: 2.4s, boucle infinie)
```

### Press Animation (tous états cliquables)
```javascript
onPressIn:  scale → 0.95
onPressOut: scale → 1.0 (spring)
```

## 🎨 Couleurs par Difficulté

```javascript
const difficultyColors = {
  'Débutant': '#4CAF50',      // Vert
  'Débutant+': '#8BC34A',     // Vert clair
  'Intermédiaire': '#FF9800', // Orange
  'Intermédiaire+': '#FF5722',// Orange foncé
  'Avancé': '#F44336',        // Rouge
  'Avancé+': '#E91E63',       // Rose
  'Expert': '#9C27B0',        // Violet
  'Elite': '#673AB7',         // Violet foncé
  'LEGEND': '#FFD700'         // Or
};
```

## 📐 Dimensions

- **Nœud :** 80x80px (cercle parfait)
- **Container total :** 100px largeur (avec marges)
- **Icône programme :** 32px
- **Badge :** 24px minimum
- **Texte nom :** 12px, max 2 lignes
- **Texte difficulté :** 10px

## 🔧 Utilisation

```javascript
import SkillNode from '../components/SkillNode';

// Dans un écran
<SkillNode
  program={streetWorkoutProgram}
  userProgress={userProgression}
  isUnlocked={checkPrerequisites(program)}
  isCompleted={isProgram
(program)}
  onPress={() => navigateToProgram(program)}
/>
```

## 🚀 Exemple d'Intégration

```javascript
// Dans SkillTreeScreen.js
const renderNode = (program) => {
  const progress = userProgressData[program.id];
  const unlocked = checkPrerequisites(program, userProgressData);
  const completed = progress?.currentLevel === 7; // Level 7 = completed
  
  return (
    <SkillNode
      key={program.id}
      program={program}
      userProgress={progress}
      isUnlocked={unlocked}
      isCompleted={completed}
      onPress={() => navigation.navigate('ProgramDetail', { 
        program, 
        category: 'street',
        userProgress: progress 
      })}
    />
  );
};
```

## 🎯 Logique de Progression

```javascript
// Calcul du pourcentage de progression
const getProgressPercentage = () => {
  const totalLevels = program.levels.length;
  const currentLevel = userProgress.currentLevel || 1;
  return Math.min((currentLevel - 1) / totalLevels, 1);
};
```

## ✨ Features Avancées

1. **Shadow/Glow Effects :** Utilisation de shadowColor pour créer un effet lumineux
2. **Animations Fluides :** Transform avec useNativeDriver pour de meilleures performances
3. **Responsive :** S'adapte aux différentes tailles d'écran
4. **Accessibility :** TouchableOpacity avec feedback approprié
5. **State Management :** Gestion propre des différents états visuels

Le composant est prêt à être intégré dans l'arbre de compétences interactif ! 🚀
