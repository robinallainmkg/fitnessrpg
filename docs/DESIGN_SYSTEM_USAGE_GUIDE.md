# 🎨 Guide d'Utilisation - Système de Design Unifié

## 🎯 Vue d'ensemble

Le système de design FitnessRPG est maintenant **complètement unifié** autour d'une source unique: `rpgTheme.js`.

Tous les tokens de design (couleurs, spacing, typography, shadows) sont centralisés et réutilisables.

---

## 📦 Imports

### Couleurs
```javascript
import { colors, getProgramColor, PROGRAM_COLORS, TIER_COLORS } from '../theme/colors';

// Accès direct
const primaryColor = colors.primary;        // #4D9EFF
const successColor = colors.success;        // #00FF94
const bgColor = colors.background;          // #0A0E27

// Fonction helper pour les programmes
const programColor = getProgramColor('streetworkout');  // #4D9EFF
const programColor2 = getProgramColor('run10k');        // #00FF94
```

### Thème
```javascript
import { rpgTheme } from '../theme/rpgTheme';

// Spacing
rpgTheme.spacing.xs    // 4px
rpgTheme.spacing.sm    // 8px
rpgTheme.spacing.md    // 16px
rpgTheme.spacing.lg    // 24px
rpgTheme.spacing.xl    // 32px

// Border Radius
rpgTheme.borderRadius.sm    // 8px
rpgTheme.borderRadius.md    // 12px
rpgTheme.borderRadius.lg    // 16px

// Typography
rpgTheme.typography.weights.regular    // 400
rpgTheme.typography.weights.medium     // 500
rpgTheme.typography.weights.semibold   // 600
rpgTheme.typography.weights.bold       // 700

// Shadows
rpgTheme.effects.shadows.card    // Shadow standard
rpgTheme.effects.shadows.glow    // Glow neon
```

---

## 🎴 Composants de Cartes

### WorkoutCard - Quête d'entraînement

**Usage:**
```javascript
import { WorkoutCard } from '../components/cards';
import { getProgramColor } from '../theme/colors';

<WorkoutCard
  session={session}
  programColor={getProgramColor(session.programId)}
  onPreview={() => handlePreview(session)}
  onStart={() => handleStart(session)}
  disabled={false}
/>
```

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `session` | object | ❌ | `{}` | Données de session |
| `programColor` | string | ❌ | `#4D9EFF` | Couleur hex du programme |
| `onPreview` | function | ❌ | - | Callback aperçu |
| `onStart` | function | ❌ | - | Callback démarrage |
| `disabled` | boolean | ❌ | `false` | État désactivé |

**Session Object:**
```javascript
{
  skillName: 'Muscle-Up Strict',
  skillId: 'muscle-up-strict',
  levelNumber: 2,
  levelName: 'Negatives & Progressions',
  status: 'available',           // 'available', 'completed'
  xpReward: 150,
  programName: 'Street Workout',
  programIcon: '💪',
}
```

---

### ProgramCard - Programme actif

**Usage:**
```javascript
import { ProgramCard } from '../components/cards';

<ProgramCard
  program={program}
  onViewTree={() => navigation.navigate('SkillTree', { programId: program.id })}
/>
```

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `program` | object | ❌ | `{}` | Données du programme |
| `onViewTree` | function | ❌ | - | Callback arbre |
| `disabled` | boolean | ❌ | `false` | État désactivé |

**Program Object:**
```javascript
{
  id: 'streetworkout',
  name: 'Street Workout',
  icon: '💪',
  status: 'active',              // 'active', 'completed'
  completedSkills: 5,
  totalSkills: 23,
}
```

---

## 🎮 Composants de Boutons

### ActionButton - Bouton Primaire

**Usage:**
```javascript
import { ActionButton } from '../components/buttons';

<ActionButton
  onPress={handlePress}
  icon="play"
  color="primary"
  size="medium"
>
  Commencer
</ActionButton>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `onPress` | function | - | - |
| `icon` | string | `check-circle` | MaterialIcons |
| `disabled` | boolean | `false` | - |
| `loading` | boolean | `false` | - |
| `size` | string | `medium` | `small`, `medium`, `large` |
| `variant` | string | `default` | `default`, `success`, `warning` |

**Exemples:**
```javascript
// Bouton large
<ActionButton size="large" icon="play">
  Commencer maintenant
</ActionButton>

// Bouton success
<ActionButton variant="success" icon="check">
  Valider
</ActionButton>

// Bouton warning
<ActionButton variant="warning" icon="alert">
  Attention!
</ActionButton>
```

---

### OutlineButton - Bouton Secondaire

**Usage:**
```javascript
import { OutlineButton } from '../components/buttons';

<OutlineButton
  onPress={handlePress}
  icon="eye-outline"
  borderColor="#4D9EFF"
  size="medium"
>
  Aperçu
</OutlineButton>
```

**Props:**
| Prop | Type | Default |
|------|------|---------|
| `onPress` | function | - |
| `icon` | string | - |
| `borderColor` | string | `#4D9EFF` |
| `disabled` | boolean | `false` |
| `size` | string | `medium` |

---

## 🏷️ Composants de Badges

### StatBadge - Badge XP/Stats

**Usage:**
```javascript
import { StatBadge } from '../components/badges';

<StatBadge
  icon="lightning-bolt"
  value="+150"
  color="primary"
  size="small"
/>
```

**Props:**
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `icon` | string | - | MaterialCommunityIcons |
| `value` | string | - | Texte affiché |
| `color` | string | `primary` | `primary`, `success`, `warning` |
| `size` | string | `medium` | `small`, `medium`, `large` |
| `variant` | string | `filled` | `filled`, `outline` |

---

### StatusBadge - Badge Statut

**Usage:**
```javascript
import { StatusBadge } from '../components/badges';

<StatusBadge
  status="active"
  size="small"
  position="absolute"
/>
```

**Props:**
| Prop | Type | Options |
|------|------|---------|
| `status` | string | `active`, `completed`, `locked` |
| `size` | string | `small`, `medium` |
| `position` | string | `absolute`, `static` |

---

## 🎨 Couleurs et Programmes

### Utiliser les couleurs par programme

```javascript
import { getProgramColor, PROGRAM_COLORS } from '../theme/colors';

// Récupérer la couleur d'un programme
const color = getProgramColor('streetworkout');  // #4D9EFF
const color2 = getProgramColor('run10k');        // #00FF94

// Couleur fallback si programme inconnu
const color3 = getProgramColor('unknown', '#FF9800');  // #FF9800

// Accès aux données complètes
const programData = PROGRAM_COLORS['streetworkout'];
// {
//   id: 'streetworkout',
//   name: 'Street Workout',
//   color: '#4D9EFF',
//   hex: '#4D9EFF',
//   rgb: { r: 77, g: 158, b: 255 },
//   description: 'Dominance bleue - Pouvoir & électricité'
// }
```

### Ajouter un nouveau programme

**Dans `src/theme/colors.js`:**
```javascript
export const PROGRAM_COLORS = {
  'streetworkout': { ... },
  'run10k': { ... },
  // Nouveau programme
  'yoga': {
    id: 'yoga',
    name: 'Yoga Flow',
    color: '#FF6B35',           // Orange feu
    hex: '#FF6B35',
    rgb: { r: 255, g: 107, b: 53 },
    description: 'Dominance orange - Flexibilité & équilibre',
  },
};
```

Ensuite, utiliser directement:
```javascript
const yogaColor = getProgramColor('yoga');  // #FF6B35
```

---

## 📐 Spacing & Layout

### Principes de Spacing

Tous les composants utilisent `rpgTheme.spacing` pour la cohérence:

```javascript
import { rpgTheme } from '../theme/rpgTheme';

const styles = StyleSheet.create({
  container: {
    padding: rpgTheme.spacing.md,      // 16px
    marginBottom: rpgTheme.spacing.lg,  // 24px
  },
  item: {
    margin: rpgTheme.spacing.sm,       // 8px
  },
});
```

### Taille d'écran responsive

```javascript
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Les cartes s'adaptent automatiquement
// marges: md (16px) de chaque côté
// largeur utile: screenWidth - 32
```

---

## 🔤 Typography Hiérarchie

### Hiérarchie de texte standard

```javascript
import { rpgTheme } from '../theme/rpgTheme';

const styles = StyleSheet.create({
  // Titre card (H1)
  cardTitle: {
    fontSize: 18,
    fontWeight: rpgTheme.typography.weights.bold,
    color: colors.text,
  },
  
  // Label programme (H2)
  programLabel: {
    fontSize: 14,
    fontWeight: rpgTheme.typography.weights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Sous-titre (H3)
  subtitle: {
    fontSize: 12,
    fontWeight: rpgTheme.typography.weights.medium,
    color: colors.textSecondary,
  },
});
```

---

## ✅ Checklist de Migration

Si vous migrez un ancien composant:

- [ ] ❌ Remplacer `hardcoded colors` par `colors.xxx`
- [ ] ❌ Remplacer `margin/padding números` par `rpgTheme.spacing`
- [ ] ❌ Remplacer `borderRadius números` par `rpgTheme.borderRadius`
- [ ] ❌ Remplacer `shadows` par `rpgTheme.effects.shadows`
- [ ] ❌ Utiliser `getProgramColor()` pour les couleurs de programme
- [ ] ❌ Importer depuis les index centralisés (buttons/, cards/, badges/)

---

## 🧪 Testing

Voir `DesignSystemTest.js` pour des exemples complets de test:

```bash
# Dans le Terminal, naviguer vers DevDiagnostic
# Puis appuyer sur "Design System Test"
```

---

## 🚀 Performance

- ✅ Les composants sont mémoïsés avec `React.memo`
- ✅ Les StyleSheets sont créés une fois
- ✅ Pas de re-renders inutiles lors des changements de thème
- ✅ Les couleurs sont des strings (pas d'objets) pour légèreté

---

## 🔧 Debugging

### Vérifier les imports
```javascript
// ❌ MAUVAIS
import { colors } from '../theme/colors';  // Ne charge pas rpgTheme

// ✅ BON
import { colors, getProgramColor } from '../theme/colors';  // Complet
```

### Vérifier les couleurs
```javascript
import { colors, PROGRAM_COLORS } from '../theme/colors';

console.log('Available colors:', colors);
console.log('Available programs:', Object.keys(PROGRAM_COLORS));
```

### Vérifier le spacing
```javascript
import { rpgTheme } from '../theme/rpgTheme';

console.log('Available spacing:', rpgTheme.spacing);
```

---

## 📚 Ressources

- `src/theme/rpgTheme.js` - Source de vérité (tokens)
- `src/theme/colors.js` - Couleurs et helpers
- `src/components/cards/` - Composants de cartes
- `src/components/buttons/` - Composants de boutons
- `src/components/badges/` - Composants de badges
- `src/screens/DesignSystemTest.js` - Exemples de test
- `docs/DESIGN_MIGRATION_COMPLETE.md` - Documentation complète

---

## ❓ FAQ

**Q: Où mettre les couleurs hardcoded?**  
A: Jamais! Utiliser toujours `colors.xxx` ou `rpgTheme.colors.xxx`

**Q: Comment ajouter une nouvelle couleur?**  
A: Ajouter dans `rpgTheme.colors` ou `PROGRAM_COLORS` selon l'usage

**Q: Le spacing ne s'ajuste pas sur les petits écrans?**  
A: Utiliser `Dimensions.get('window')` et calculer les marges dynamiques

**Q: Comment créer un variant de bouton?**  
A: Utiliser le prop `variant` ou créer un wrapper spécialisé

---

## 📝 Exemples Complets

### Exemple 1: Afficher une quête
```javascript
import { WorkoutCard } from '../components/cards';
import { getProgramColor } from '../theme/colors';

const session = {
  skillName: 'L-Sit Hold',
  skillId: 'l-sit',
  levelNumber: 1,
  levelName: 'Fondations',
  status: 'available',
  xpReward: 100,
  programName: 'Street Workout',
  programIcon: '💪',
};

<WorkoutCard
  session={session}
  programColor={getProgramColor('streetworkout')}
  onPreview={() => console.log('Preview')}
  onStart={() => console.log('Start')}
/>
```

### Exemple 2: Afficher un programme
```javascript
import { ProgramCard } from '../components/cards';

const program = {
  id: 'streetworkout',
  name: 'Street Workout',
  icon: '💪',
  status: 'active',
  completedSkills: 3,
  totalSkills: 23,
};

<ProgramCard
  program={program}
  onViewTree={() => navigation.navigate('SkillTree')}
/>
```

### Exemple 3: Boutons uniformisés
```javascript
import { ActionButton, OutlineButton } from '../components/buttons';

<View style={{ gap: 8 }}>
  <OutlineButton onPress={onPreview} icon="eye-outline">
    Aperçu
  </OutlineButton>
  <ActionButton onPress={onStart} icon="play">
    Commencer
  </ActionButton>
</View>
```

---

**Version**: 1.0  
**Last Updated**: October 19, 2025  
**Author**: Design System Migration  
**Status**: ✅ Production Ready

