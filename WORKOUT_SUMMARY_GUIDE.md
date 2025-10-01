# Guide WorkoutSummaryScreen - Programmes Débloqués

## Modifications apportées

### 🎯 Nouvelles Fonctionnalités

**1. Détection de Complétion de Programme**
- Utilise `sessionData.programCompleted` du WorkoutContext
- Active les animations et affichages spéciaux
- Gère les programmes débloqués via `sessionData.unlockedPrograms`

**2. Card de Complétion Spéciale**
- Background gradient avec couleur `colors.success`
- Animation d'apparition (fade in + scale)
- Titre "🎉 PROGRAMME COMPLÉTÉ !"
- Message personnalisé avec nom du programme
- Affichage du bonus XP (+500)
- Bouton de partage natif

**3. Section Programmes Débloqués**
- Apparaît uniquement si `unlockedPrograms.length > 0`
- ScrollView horizontal avec cards individuelles
- Animation fade in
- Bouton "Découvrir" qui redirige vers HomeScreen

**4. Boutons Adaptatifs**
- **Programme complété** :
  - "Retour à l'accueil" (principal)
  - "Voir les nouveaux programmes" (secondaire, si applicable)
- **Progression normale** :
  - "Niveau suivant" (si débloqué)
  - "Réessayer" (si échec)
  - "Retour à l'accueil"

### 🎨 Animations

```javascript
// Animation de la card de complétion
Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true,
  }),
  Animated.spring(scaleAnim, {
    toValue: 1,
    tension: 50,
    friction: 3,
    useNativeDriver: true,
  }),
]).start();
```

### 📱 Partage Natif

```javascript
const shareSuccess = async () => {
  await Share.share({
    message: `Je viens de compléter le programme ${program.name} sur Fitness Game ! 💪`,
    title: 'Ma réussite Fitness Game'
  });
};
```

### 🧭 Navigation Améliorée

**Retour à l'accueil avec reset :**
```javascript
navigation.reset({
  index: 0,
  routes: [{ name: 'Main', params: { screen: 'Home' } }],
});
```

### 📊 Structure des Données Attendues

Le `sessionData` retourné par `completeWorkout()` doit contenir :

```javascript
{
  sessionId: string,
  score: number,
  levelCompleted: boolean,    // Nouveau
  programCompleted: boolean,  // Nouveau
  unlockedPrograms: string[], // Nouveau - noms des programmes
  xpEarned: number,
  // ... autres données de session
}
```

### 🎨 Styles Principaux

- **Completion Card** : Elevation 8, gradient success, bordure warning
- **Unlocked Cards** : Cards horizontales avec icônes et animations
- **Boutons** : Couleurs adaptatives selon le contexte
- **Animations** : Smooth et naturelles avec spring physics

### 🔧 Logique Conditionnelle

1. `programCompleted === true` → Affichage spécial complet
2. `unlockedPrograms.length > 0` → Section programmes débloqués
3. Boutons adaptatifs selon l'état de complétion
4. Animations déclenchées automatiquement

### ✅ Tests Recommandés

1. **Complétion niveau normal** (niveau 1-5, score >= 800)
2. **Complétion programme** (niveau 6, score >= 800)
3. **Échec de niveau** (score < 800)
4. **Programme sans unlock** (unlocks array vide)
5. **Programme avec multiples unlocks**

L'écran s'adapte automatiquement à tous ces scénarios !
