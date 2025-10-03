# 📊 UserStatsCard - Documentation

## Vue d'ensemble

Le composant `UserStatsCard` affiche visuellement les 5 caractéristiques utilisateur sous forme de barres de progression avec des couleurs et icônes distinctives.

## 🎯 Fonctionnalités

- **Affichage visuel** : Barres de progression colorées pour chaque stat
- **Icônes intuitives** : Emoji représentant chaque caractéristique
- **Responsive** : S'adapte à tous les écrans
- **Dark mode** : Compatible avec les thèmes sombre/clair
- **Gestion d'erreurs** : Valeurs par défaut si stats manquantes

## 📋 Props

```javascript
{
  stats: {
    strength: number,     // Force (0-100)
    endurance: number,    // Endurance (0-100)
    power: number,        // Puissance (0-100)
    speed: number,        // Vitesse (0-100)
    flexibility: number   // Souplesse (0-100)
  }
}
```

### Props Optionnelles
- `stats` peut être `undefined` ou `{}` → affiche 0 partout
- Chaque stat peut être `undefined` → affiche 0 pour cette stat
- Valeurs hors limites sont automatiquement bridées (min: 0, max: 100)

## 🎨 Design

### Mapping Stats → Apparence

| Stat | Icon | Label | Couleur | Usage |
|------|------|-------|---------|-------|
| `strength` | 💪 | Force | #FF6B6B | Exercices de force, tractions |
| `endurance` | 🔋 | Endurance | #4CAF50 | Cardio, résistance |
| `power` | ⚡ | Puissance | #FFD700 | Explosivité, plyo |
| `speed` | 🚀 | Vitesse | #2196F3 | Vitesse, agilité |
| `flexibility` | 🧘 | Souplesse | #9C27B0 | Étirements, mobilité |

### Structure Visuelle
```
┌─────────────────────────────────────────┐
│              Caractéristiques            │
├─────────────────────────────────────────┤
│ 💪  Force      ████████░░  45          │
│ 🔋  Endurance  ██████░░░░  32          │
│ ⚡  Puissance  ████░░░░░░  25          │
│ 🚀  Vitesse    ██░░░░░░░░  12          │
│ 🧘  Souplesse  █░░░░░░░░░   8          │
└─────────────────────────────────────────┘
```

## 🔧 Utilisation

### Import
```javascript
import UserStatsCard from '../components/UserStatsCard';
```

### Utilisation Basique
```javascript
const stats = {
  strength: 45,
  endurance: 32,
  power: 25,
  speed: 12,
  flexibility: 8
};

return <UserStatsCard stats={stats} />;
```

### Avec Context Auth
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user } = useAuth();
  
  return (
    <UserStatsCard 
      stats={user?.stats || {}} 
    />
  );
};
```

### Avec Hook useUserStats
```javascript
import { useUserStats } from '../hooks/useUserStats';

const MyComponent = () => {
  const { stats, isLoading } = useUserStats();
  
  if (isLoading) return <Loading />;
  
  return <UserStatsCard stats={stats} />;
};
```

## 🎛️ Variations

### 1. Avec Stats Calculées
```javascript
import { useStatsFromSkills } from '../hooks/useUserStats';

const SkillStatsCard = ({ completedSkills }) => {
  const { stats } = useStatsFromSkills(completedSkills);
  
  return <UserStatsCard stats={stats} />;
};
```

### 2. Avec Loading State
```javascript
const LoadingStatsCard = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>⏳ Chargement...</Text>
        </Card.Content>
      </Card>
    );
  }
  
  return <UserStatsCard stats={stats} />;
};
```

### 3. Comparaison Avant/Après
```javascript
const StatsComparison = ({ beforeStats, afterStats }) => (
  <View style={styles.comparison}>
    <Text>Avant</Text>
    <UserStatsCard stats={beforeStats} />
    
    <Text>Après</Text>
    <UserStatsCard stats={afterStats} />
  </View>
);
```

## 🧪 Tests & Débogage

### Composant de Test
Le fichier `UserStatsCardTest.js` fournit :
- Interface de test interactive
- Profils prédéfinis (débutant → élite)
- Tests de cas limites
- Validation des valeurs extrêmes

### Utilisation du Test
```javascript
import UserStatsCardTest from '../components/UserStatsCardTest';

// Dans une screen de développement
return <UserStatsCardTest />;
```

### Cas de Test Couverts
- ✅ Stats normales (0-100)
- ✅ Stats undefined/null
- ✅ Props manquantes
- ✅ Valeurs négatives (converties en 0)
- ✅ Valeurs > 100 (bridées à 100)
- ✅ Objets stats vides `{}`

## 🔗 Intégrations

### Avec Firebase/Firestore
```javascript
// Structure attendue dans Firestore
user: {
  stats: {
    strength: 25,
    endurance: 18,
    power: 15,
    speed: 8,
    flexibility: 5
  }
}
```

### Avec Système de Récompenses
```javascript
// Après completion d'une compétence
const addStatBonus = (currentStats, skillBonus) => ({
  strength: (currentStats.strength || 0) + (skillBonus.strength || 0),
  endurance: (currentStats.endurance || 0) + (skillBonus.endurance || 0),
  // ...
});
```

### Avec Context Workout
```javascript
// Mise à jour des stats après entraînement
const updateUserStats = async (skillId, statBonuses) => {
  const newStats = {
    ...user.stats,
    strength: user.stats.strength + statBonuses.strength
  };
  
  await updateDoc(userRef, { stats: newStats });
};
```

## 🎨 Personnalisation

### Couleurs Personnalisées
```javascript
const customStatsConfig = [
  { key: 'strength', label: 'Force', icon: '💪', color: '#FF4444' },
  // ... autres configs
];

// Modifier dans UserStatsCard.js
```

### Échelle Personnalisée
```javascript
// Pour une échelle 0-50 au lieu de 0-100
<ProgressBar 
  progress={(stats[stat.key] || 0) / 50} 
  color={stat.color}
/>
```

### Icons Personnalisées
```javascript
// Remplacer les emojis par des icons Material
import Icon from 'react-native-vector-icons/MaterialIcons';

<Icon name="fitness-center" size={24} color={stat.color} />
```

## 📱 Responsive Design

### Styles Adaptatifs
- **Mobile** : Layout vertical compact
- **Tablet** : Spacing élargi
- **Écrans larges** : Possibilité de layout horizontal

### Breakpoints
```javascript
const isTablet = Dimensions.get('window').width > 768;
const cardStyle = isTablet ? styles.tabletCard : styles.mobileCard;
```

## 🐛 Dépannage

### Problèmes Courants

1. **Stats non affichées**
   - Vérifier que `stats` n'est pas `null`
   - Console.log les props reçues

2. **Couleurs incorrectes**
   - Vérifier l'import du theme `colors`
   - Tester en mode light/dark

3. **Performance lente**
   - Mémoriser les stats avec `useMemo`
   - Éviter les re-renders inutiles

### Debug Mode
```javascript
const UserStatsCard = ({ stats, debug = false }) => {
  if (debug) {
    console.log('UserStatsCard props:', { stats });
  }
  // ...
};
```

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- [ ] Animation des barres de progression
- [ ] Tooltips explicatifs
- [ ] Graphiques circulaires alternatifs
- [ ] Export des stats en image
- [ ] Comparaison temporelle
- [ ] Notifications de progression

### Amélioration Performance
- [ ] Lazy loading des animations
- [ ] Memoization optimisée
- [ ] Render conditionnel avancé

---

## 📞 Support

Pour questions ou améliorations :
- Consulter `UserStatsCardTest.js` pour exemples
- Utiliser `useUserStats.js` pour logique avancée
- Vérifier `UserStatsCardExamples.js` pour patterns d'usage
