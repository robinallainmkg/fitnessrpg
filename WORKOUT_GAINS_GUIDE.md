# 🎁 Gains de Stats - Guide Complet

## Vue d'ensemble

Le système de gains de stats récompense les utilisateurs lorsqu'ils complètent des niveaux de compétences. Chaque programme dans `programs.json` définit des bonus de stats qui sont accordés lors de la validation d'un niveau.

## 🏗️ Architecture

### Structure des Données

#### Dans programs.json
```json
{
  "id": "beginner-foundation",
  "name": "Fondations Débutant",
  "statBonuses": {
    "strength": 3,     // +3 points de Force
    "endurance": 1,    // +1 point d'Endurance  
    "power": 2,        // +2 points de Puissance
    "speed": 0,        // Pas de bonus Vitesse
    "flexibility": 0   // Pas de bonus Flexibilité
  }
}
```

#### Dans la base de données utilisateur
```javascript
// Firestore: users/{userId}
{
  stats: {
    strength: 15,      // Cumulé au fil des compétences
    endurance: 8,
    power: 12,
    speed: 5,
    flexibility: 3
  },
  globalXP: 2500,      // XP global pour calcul du niveau
  programs: {
    "beginner-foundation": {
      xp: 300,
      level: 2,
      completedSkills: 1
    }
  }
}
```

## 🎯 Déclenchement des Gains

### Conditions Requises
1. **Niveau validé** : Score ≥ 800 points (80%)
2. **Programme avec statBonuses** : Le programme doit définir des bonus
3. **Utilisateur authentifié** : Pour sauvegarder les gains

### Calcul Automatique
```javascript
const calculateStatGains = async (levelCompleted) => {
  if (!levelCompleted) return null;
  
  // Récupérer le programme depuis programs.json
  const currentProgram = programs.categories
    .flatMap(cat => cat.programs)
    .find(p => p.id === program.id);
    
  // Extraire les bonus
  const gains = {
    strength: currentProgram.statBonuses.strength || 0,
    endurance: currentProgram.statBonuses.endurance || 0,
    power: currentProgram.statBonuses.power || 0,
    speed: currentProgram.statBonuses.speed || 0,
    flexibility: currentProgram.statBonuses.flexibility || 0
  };
  
  return gains;
};
```

## 🎨 Interface Utilisateur

### Section Gains de Stats
Affichée après le score principal, uniquement si niveau validé :

```jsx
{levelValidated && statGains && (
  <Animated.View style={{ opacity: gainsAnim }}>
    <Card style={styles.gainsCard}>
      <Card.Content>
        <Text style={styles.gainsTitle}>🎁 Gains de Stats</Text>
        <Text style={styles.gainsSubtitle}>
          Compétence maîtrisée - Tes caractéristiques augmentent !
        </Text>
        
        {/* Affichage par stat avec icône et valeur */}
        {Object.entries(statGains)
          .filter(([stat, value]) => value > 0)
          .map(([stat, value]) => (
            <StatGainRow key={stat} stat={stat} value={value} />
          ))}
      </Card.Content>
    </Card>
  </Animated.View>
)}
```

### Éléments Visuels
- **Icons thématiques** : 💪 Force, 🔋 Endurance, ⚡ Puissance, 💨 Vitesse, 🤸 Flexibilité
- **Couleurs cohérentes** : Chaque stat a sa couleur signature
- **Animation fade-in** : Apparition progressive après le score
- **Chips colorés** : Valeurs des gains mises en évidence

## 🚀 Level Up Global

### Déclenchement
- **Condition** : Franchir un palier de 1000 XP globaux
- **Calcul** : `niveau = Math.floor(globalXP / 1000) + 1`
- **Titres** : Attribution automatique selon le niveau

### Système de Titres
```javascript
const getTitleForLevel = (level) => {
  if (level >= 10) return "Légende";
  if (level >= 7) return "Champion";  
  if (level >= 4) return "Guerrier";
  if (level >= 2) return "Apprenti";
  return "Débutant";
};
```

### Interface Level Up
```jsx
{globalLevelUp && (
  <Animated.View style={{ opacity: levelUpAnim, transform: [{ scale: levelUpAnim }] }}>
    <Card style={styles.levelUpCard}>
      <Card.Content>
        <Text style={styles.levelUpIcon}>🎉</Text>
        <Text style={styles.levelUpTitle}>NIVEAU GLOBAL UP !</Text>
        <Text style={styles.levelUpMessage}>
          Tu es maintenant niveau {globalLevelUp.newLevel} - {globalLevelUp.newTitle} !
        </Text>
        <Chip icon="👑">{globalLevelUp.newTitle}</Chip>
      </Card.Content>
    </Card>
  </Animated.View>
)}
```

## 🎬 Séquence d'Animation

### Timeline Complète
1. **T+0ms** : Affichage du score principal
2. **T+1000ms** : Animation fade-in des gains de stats
3. **T+1800ms** : Animation spring du level up global (si applicable)

### Paramètres d'Animation
```javascript
// Gains de stats - Fade in
Animated.timing(gainsAnim, {
  toValue: 1,
  duration: 600,
  useNativeDriver: true,
}).start();

// Level up - Spring avec scale
Animated.spring(levelUpAnim, {
  toValue: 1,
  tension: 50,
  friction: 4,
  useNativeDriver: true,
}).start();
```

## 📊 Exemples Concrets

### Exemple 1 : Fondations Débutant
```json
{
  "statBonuses": {
    "strength": 3,
    "power": 2, 
    "endurance": 1
  }
}
```
**Résultat** : +3 💪 Force, +2 ⚡ Puissance, +1 🔋 Endurance

### Exemple 2 : Boxing Basics
```json
{
  "statBonuses": {
    "power": 4,
    "speed": 3,
    "endurance": 2
  }
}
```
**Résultat** : +4 ⚡ Puissance, +3 💨 Vitesse, +2 🔋 Endurance

### Exemple 3 : Yoga Flow
```json
{
  "statBonuses": {
    "flexibility": 5,
    "strength": 1,
    "endurance": 2
  }
}
```
**Résultat** : +5 🤸 Flexibilité, +1 💪 Force, +2 🔋 Endurance

## 🔧 Configuration

### Ajout de Bonus à un Programme
1. **Ouvrir** `src/data/programs.json`
2. **Localiser** le programme à modifier
3. **Ajouter** la section `statBonuses`
4. **Définir** les valeurs pour chaque stat

```json
{
  "id": "mon-nouveau-programme",
  "name": "Mon Programme",
  "statBonuses": {
    "strength": 2,
    "endurance": 3,
    "power": 1,
    "speed": 0,
    "flexibility": 1
  }
}
```

### Recommandations de Valeurs
- **Programmes Débutant** : Total 3-6 points (ex: 3+2+1)
- **Programmes Intermédiaire** : Total 6-9 points (ex: 4+3+2)  
- **Programmes Avancé** : Total 9-12 points (ex: 5+4+3)
- **Programmes Spécialisés** : Concentration sur 1-2 stats principales

## 🐛 Gestion d'Erreur

### Cas d'Erreur Couverts
1. **Programme sans statBonuses** : Pas d'affichage gains
2. **Utilisateur non connecté** : Pas de calcul level up
3. **Erreur Firestore** : Log erreur, pas d'arrêt du flow
4. **Données manquantes** : Valeurs par défaut (0)

### Debug
```javascript
// Activer les logs détaillés
console.log('Gains calculés:', statGains);
console.log('Level up détecté:', globalLevelUp);
console.log('XP avant/après:', previousXP, newXP);
```

## 🧪 Tests

### Test Manuel
1. **Utiliser** `WorkoutSummaryScreenTest.js`
2. **Sélectionner** un scénario de test
3. **Vérifier** l'affichage des gains
4. **Valider** les animations

### Scénarios de Test
- ✅ **Niveau validé + gains** : Score ≥ 800, affichage gains
- 🏆 **Programme complété + level up** : Bonus programme + level up global
- ❌ **Niveau échoué** : Score < 800, pas de gains
- 🔄 **Edge cases** : Données manquantes, erreurs réseau

## 📈 Métriques d'Engagement

### KPIs Attendus
- **Motivation completion** : +30% de taux de completion des niveaux
- **Rétention** : +25% de sessions récurrentes  
- **Engagement visuel** : +40% de temps passé sur WorkoutSummary
- **Satisfaction** : +50% de feedback positif sur les récompenses

### Tracking Analytics
```javascript
// Events à tracker
analytics.track('stat_gains_received', {
  programId: program.id,
  gains: statGains,
  totalGains: Object.values(statGains).reduce((a, b) => a + b, 0)
});

analytics.track('global_level_up', {
  newLevel: globalLevelUp.newLevel,
  newTitle: globalLevelUp.newTitle,
  totalXP: newGlobalXP
});
```

## 🔄 Évolutions Futures

### Améliorations Prévues
- [ ] **Comparaison avant/après** : Affichage des stats précédentes
- [ ] **Graphiques progression** : Courbes d'évolution par stat
- [ ] **Achievements spéciaux** : Badges pour certains seuils
- [ ] **Récompenses bonus** : XP supplémentaire pour streaks
- [ ] **Partage social** : Partage des level ups sur réseaux

### Optimisations Techniques
- [ ] **Caching** : Mise en cache des calculs de stats
- [ ] **Batch updates** : Mise à jour groupée des stats en base
- [ ] **Animation GPU** : Optimisation des performances d'animation
- [ ] **Lazy loading** : Chargement différé des données non critiques

---

## 🎯 Points Clés

1. **Automatique** : Les gains se calculent automatiquement lors de la validation
2. **Visuel** : Interface attrayante avec animations séquentielles  
3. **Motivant** : Récompenses immédiates pour encourager la progression
4. **Flexible** : Configuration simple dans programs.json
5. **Robuste** : Gestion d'erreur complète pour éviter les crashes

Le système de gains de stats transforme chaque victoire en progression tangible, créant un cycle de motivation continue pour les utilisateurs ! 🚀
