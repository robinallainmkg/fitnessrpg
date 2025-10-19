# 🎨 Système de Design RPG - Guide Complet

## 📋 Table des matières
1. Palette de couleurs unifiée
2. Composants réutilisables
3. Typographie et hiérarchie
4. Spacing et layout
5. Shadows et glows
6. Exemples d'utilisation

---

## 1. 🌈 Palette de Couleurs Unifiée

### ✅ Source unique: `src/theme/rpgTheme.js`

```javascript
// Importer le thème
import { rpgTheme } from '../theme/rpgTheme';

// Utiliser les couleurs
const color = rpgTheme.colors.neon.blue;        // #4D9EFF
const text = rpgTheme.colors.text.primary;       // #FFFFFF
```

### Couleurs principales

| Nom | Hex | Utilisation |
|-----|-----|-------------|
| **Neon Blue** | `#4D9EFF` | Actions principales, bordures cards, Street Workout |
| **Neon Purple** | `#7B61FF` | Dégradés, XP badges, highlights |
| **Neon Cyan** | `#00E5FF` | Accents secondaires, bordures |
| **Neon Green** | `#00FF94` | Status "Actif", confirmations, Run 10K |
| **Neon Pink** | `#FF2E97` | Avertissements, urgence |

### Couleurs par programme

```javascript
import { getProgramColor } from '../theme/colors';

const streetWorkoutColor = getProgramColor('streetworkout');  // #4D9EFF
const run10kColor = getProgramColor('run10k');               // #00FF94
```

### Backgrounds

```javascript
rpgTheme.colors.background.primary   // #0A0E27 (fond principal)
rpgTheme.colors.background.secondary // #151B3B
rpgTheme.colors.background.card      // #1A2244
```

### Textes

```javascript
rpgTheme.colors.text.primary    // #FFFFFF (blanc pur)
rpgTheme.colors.text.secondary  // #B8C5D6 (gris clair)
rpgTheme.colors.text.muted      // #6B7A99 (gris moyen)
```

---

## 2. 🎮 Composants Réutilisables

### Boutons

#### ActionButton (Primaire avec gradient)
```javascript
import { ActionButton } from '../components/buttons';

<ActionButton
  onPress={handleStart}
  icon="play"
  color="primary"        // 'primary' | 'success' | 'warning'
  size="medium"          // 'small' | 'medium' | 'large'
  fullWidth={true}
>
  Commencer
</ActionButton>
```

#### OutlineButton (Secondaire avec bordure)
```javascript
import { OutlineButton } from '../components/buttons';

<OutlineButton
  onPress={handlePreview}
  icon="eye-outline"
  borderColor="#4D9EFF"
  size="medium"
>
  Aperçu
</OutlineButton>
```

### Badges

#### StatBadge (Récompenses XP, stats)
```javascript
import { StatBadge } from '../components/badges';

<StatBadge
  icon="lightning-bolt"
  value={150}
  label="XP"
  color="primary"        // 'primary' | 'success' | 'warning' | 'info'
  size="small"           // 'small' | 'medium' | 'large'
  variant="filled"       // 'filled' | 'outline' | 'ghost'
/>
```

#### StatusBadge (Statuts)
```javascript
import { StatusBadge } from '../components/badges';

<StatusBadge
  status="active"        // 'active' | 'completed' | 'locked' | 'inProgress'
  label="Actif"
  size="small"
  position="absolute"    // 'inline' | 'absolute' (top-right)
/>
```

### Cards

#### WorkoutCard (Quêtes unifiées)
```javascript
import { WorkoutCard } from '../components/cards';

<WorkoutCard
  session={{
    skillName: 'Fondations Débutant',
    levelNumber: 1,
    levelName: 'Initiation',
    programName: 'Street Workout',
    programIcon: '💪',
    status: 'available',
    xpReward: 150,
  }}
  programColor="#4D9EFF"
  onPreview={handlePreview}
  onStart={handleStart}
/>
```

#### ProgramCard (Programmes épurés)
```javascript
import { ProgramCard } from '../components/cards';

<ProgramCard
  program={{
    id: 'streetworkout',
    name: 'Street Workout',
    icon: '💪',
    status: 'active',
    completedSkills: 5,
    totalSkills: 23,
  }}
  onViewTree={handleViewTree}
/>
```

---

## 3. ✍️ Typographie et Hiérarchie

### Tailles

```javascript
rpgTheme.typography.sizes.title       // 28pt - Titres page
rpgTheme.typography.sizes.heading     // 22pt - H1
rpgTheme.typography.sizes.subheading  // 18pt - H2 / Card titles
rpgTheme.typography.sizes.body        // 16pt - Texte normal
rpgTheme.typography.sizes.caption     // 14pt - Boutons, labels
rpgTheme.typography.sizes.small       // 12pt - Petits labels
```

### Poids

```javascript
rpgTheme.typography.weights.regular    // 400
rpgTheme.typography.weights.medium     // 500
rpgTheme.typography.weights.semibold   // 600
rpgTheme.typography.weights.bold       // 700
rpgTheme.typography.weights.heavy      // 800
```

### Hiérarchie recommandée

1. **Titre page**: 28pt, bold, blanc
2. **Titre card**: 18pt, semibold, blanc
3. **Texte normal**: 16pt, regular, blanc
4. **Étiquette**: 14pt, medium, gris secondary
5. **Petit label**: 12pt, regular, gris muted

---

## 4. 📏 Spacing

```javascript
rpgTheme.spacing.xs    // 4px  - Micro espacements
rpgTheme.spacing.sm    // 8px  - Petits gaps
rpgTheme.spacing.md    // 16px - Standard (cards, sections)
rpgTheme.spacing.lg    // 24px - Large gaps
rpgTheme.spacing.xl    // 32px - Extra large
rpgTheme.spacing.xxl   // 48px - Section dividers
```

### Bonnes pratiques

- **Card padding**: `md` (16px)
- **Gap entre éléments**: `sm` (8px)
- **Margin cards**: `md` horizontal, `md` vertical
- **Padding boutons**: `vertical: 12px, horizontal: 20px`

---

## 5. ✨ Shadows et Glows

### Présets disponibles

```javascript
rpgTheme.effects.shadows.card       // Shadow standard pour cards
rpgTheme.effects.shadows.glow       // Glow violet (XP badges)
rpgTheme.effects.shadows.heavy      // Shadow robuste
```

### Utilisation

```javascript
// Shadow standard
...rpgTheme.effects.shadows.card,

// Glow customisé
{
  shadowColor: rpgTheme.colors.neon.blue,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 8,
  elevation: 6,
}
```

---

## 6. 📐 Border Radius

```javascript
rpgTheme.borderRadius.sm    // 8px  - Boutons, petits éléments
rpgTheme.borderRadius.md    // 12px - Badges
rpgTheme.borderRadius.lg    // 16px - Cards principales
rpgTheme.borderRadius.xl    // 24px - Large containers
rpgTheme.borderRadius.full  // 9999 - Cercles (avatars)
```

---

## 7. 🎯 Exemples complets

### Écran HomeScreen refactorisé

```javascript
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { WorkoutCard } from '../components/cards';
import { ProgramCard } from '../components/cards';
import { rpgTheme } from '../theme/rpgTheme';

export default function HomeScreen() {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: rpgTheme.colors.background.primary,
      }}
    >
      <View style={{ padding: rpgTheme.spacing.md }}>
        {/* Titre */}
        <Text
          style={{
            fontSize: rpgTheme.typography.sizes.heading,
            fontWeight: rpgTheme.typography.weights.bold,
            color: rpgTheme.colors.text.primary,
            marginBottom: rpgTheme.spacing.lg,
          }}
        >
          Quêtes disponibles
        </Text>

        {/* Quêtes */}
        {sessions.map(session => (
          <WorkoutCard
            key={session.skillId}
            session={session}
            onPreview={() => handlePreview(session)}
            onStart={() => handleStart(session)}
          />
        ))}

        {/* Programmes */}
        <Text
          style={{
            fontSize: rpgTheme.typography.sizes.heading,
            fontWeight: rpgTheme.typography.weights.bold,
            color: rpgTheme.colors.text.primary,
            marginTop: rpgTheme.spacing.xl,
            marginBottom: rpgTheme.spacing.lg,
          }}
        >
          Mes Programmes
        </Text>

        {programs.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            onViewTree={() => handleViewTree(program)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
```

---

## ✅ Checklist de migration

- [ ] Remplacer tous les hardcoded colors par `rpgTheme`
- [ ] Utiliser `WorkoutCard` au lieu de `MissionCard`
- [ ] Utiliser `ProgramCard` au lieu de `ActiveProgramCard`
- [ ] Utiliser `ActionButton` et `OutlineButton` pour tous les boutons
- [ ] Utiliser `StatBadge` et `StatusBadge` pour les badges
- [ ] Vérifier les contrastes (WCAG AA)
- [ ] Tester sur écrans petits/grands
- [ ] Vérifier le glow/shadow sur UI sombre
- [ ] Documenter les couleurs par programme en production

---

## 📞 Support

Pour ajouter une nouvelle couleur de programme:

```javascript
// Dans src/theme/colors.js
export const PROGRAM_COLORS = {
  'newprogram': {
    id: 'newprogram',
    name: 'New Program',
    color: '#YOURCOLOR',
  },
};
```

Puis utiliser: `getProgramColor('newprogram')` partout.

---

**Version**: 1.0  
**Dernière mise à jour**: Oct 19, 2025
