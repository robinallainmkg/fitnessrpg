# 🎨 RPG Theme - Guide Rapide d'Utilisation

## 📦 Import

```javascript
import { rpgTheme } from '../theme/rpgTheme';

// Ou avec helpers
import { 
  rpgTheme,
  getStatColor,
  getStatIcon,
  getRankColor,
  getRankIcon,
  addAlpha,
  createLinearGradient
} from '../theme/rpgTheme';
```

---

## 🎨 Couleurs

### Backgrounds
```javascript
rpgTheme.colors.background.primary    // '#0A0E27' - Noir spatial profond
rpgTheme.colors.background.secondary  // '#151B3B' - Bleu nuit
rpgTheme.colors.background.card       // '#1A2244' - Card background
rpgTheme.colors.background.overlay    // 'rgba(0, 0, 0, 0.6)'
```

### Néons
```javascript
rpgTheme.colors.neon.blue      // '#4D9EFF' - Bleu électrique principal
rpgTheme.colors.neon.purple    // '#7B61FF' - Violet néon
rpgTheme.colors.neon.cyan      // '#00E5FF' - Cyan brillant
rpgTheme.colors.neon.green     // '#00FF94' - Vert énergie
rpgTheme.colors.neon.pink      // '#FF2E97' - Rose vif
```

### Stats
```javascript
rpgTheme.colors.stats.strength     // '#FF6B6B' - Rouge
rpgTheme.colors.stats.endurance    // '#4ECDC4' - Cyan
rpgTheme.colors.stats.power        // '#FFD93D' - Jaune
rpgTheme.colors.stats.speed        // '#95E1D3' - Vert clair
rpgTheme.colors.stats.flexibility  // '#C77DFF' - Violet
```

### Status
```javascript
rpgTheme.colors.status.active       // '#00FF94' - Vert
rpgTheme.colors.status.locked       // '#6B7A99' - Gris
rpgTheme.colors.status.completed    // '#FFD700' - Or
rpgTheme.colors.status.inProgress   // '#4D9EFF' - Bleu
```

### Ranks
```javascript
rpgTheme.colors.ranks.beginner   // '#9E9E9E' - Gris
rpgTheme.colors.ranks.warrior    // '#4D9EFF' - Bleu
rpgTheme.colors.ranks.champion   // '#7B61FF' - Violet
rpgTheme.colors.ranks.master     // '#FF2E97' - Rose
rpgTheme.colors.ranks.legend     // '#FFD700' - Or
```

---

## 📏 Spacing

```javascript
rpgTheme.spacing.xs    // 4
rpgTheme.spacing.sm    // 8
rpgTheme.spacing.md    // 16
rpgTheme.spacing.lg    // 24
rpgTheme.spacing.xl    // 32
rpgTheme.spacing.xxl   // 48
```

**Utilisation :**
```javascript
padding: rpgTheme.spacing.md,
marginBottom: rpgTheme.spacing.lg,
```

---

## 🔲 Border Radius

```javascript
rpgTheme.borderRadius.sm    // 8
rpgTheme.borderRadius.md    // 12
rpgTheme.borderRadius.lg    // 16
rpgTheme.borderRadius.xl    // 24
rpgTheme.borderRadius.full  // 9999 (cercles)
```

**Utilisation :**
```javascript
borderRadius: rpgTheme.borderRadius.lg,
```

---

## ✍️ Typography

### Tailles
```javascript
rpgTheme.typography.sizes.title       // 28
rpgTheme.typography.sizes.heading     // 22
rpgTheme.typography.sizes.subheading  // 18
rpgTheme.typography.sizes.body        // 16
rpgTheme.typography.sizes.caption     // 14
rpgTheme.typography.sizes.small       // 12
```

### Poids
```javascript
rpgTheme.typography.weights.regular   // '400'
rpgTheme.typography.weights.medium    // '500'
rpgTheme.typography.weights.semibold  // '600'
rpgTheme.typography.weights.bold      // '700'
rpgTheme.typography.weights.heavy     // '800'
```

**Utilisation :**
```javascript
fontSize: rpgTheme.typography.sizes.heading,
fontWeight: rpgTheme.typography.weights.bold,
```

---

## 🌟 Effets (Shadows & Glows)

### Card Shadow
```javascript
...rpgTheme.effects.shadows.card
// Résultat :
// shadowColor: '#4D9EFF',
// shadowOffset: { width: 0, height: 4 },
// shadowOpacity: 0.3,
// shadowRadius: 8,
// elevation: 6,
```

### Glow Effect
```javascript
...rpgTheme.effects.shadows.glow
// Résultat :
// shadowColor: '#7B61FF',
// shadowOffset: { width: 0, height: 0 },
// shadowOpacity: 0.6,
// shadowRadius: 12,
// elevation: 8,
```

### Heavy Shadow
```javascript
...rpgTheme.effects.shadows.heavy
```

---

## 🎯 Helpers Functions

### getStatColor(statName)
```javascript
const color = getStatColor('strength');  // '#FF6B6B'
const color = getStatColor('force');     // '#FF6B6B' (FR support)
```

### getStatIcon(statName)
```javascript
const icon = getStatIcon('strength');  // '💪'
const icon = getStatIcon('force');     // '💪'
const icon = getStatIcon('speed');     // '🚀'
```

### getRankColor(rank)
```javascript
const color = getRankColor('legend');    // '#FFD700'
const color = getRankColor('débutant');  // '#9E9E9E' (FR support)
```

### getRankIcon(rank)
```javascript
const icon = getRankIcon('legend');   // '⭐'
const icon = getRankIcon('warrior');  // '⚔️'
```

### addAlpha(hexColor, opacity)
```javascript
const transparent = addAlpha('#4D9EFF', 0.3);  // '#4D9EFF4D'
```

---

## 📦 Styles de Composants Prédéfinis

### Card
```javascript
import { componentStyles } from '../theme/rpgTheme';

const styles = StyleSheet.create({
  card: {
    ...componentStyles.card,
    // Autres styles personnalisés
  },
});
```

### Button Primary
```javascript
const styles = StyleSheet.create({
  button: {
    ...componentStyles.buttonPrimary,
  },
});
```

### XP Bar
```javascript
const styles = StyleSheet.create({
  xpBar: {
    ...componentStyles.xpBar,
  },
});
```

### Avatar Border
```javascript
const styles = StyleSheet.create({
  avatar: {
    ...componentStyles.avatarBorder,
  },
});
```

### Badge
```javascript
const styles = StyleSheet.create({
  badge: {
    ...componentStyles.badge,
  },
});
```

---

## 💡 Exemples Pratiques

### Exemple 1 : Card avec Glow Effect
```javascript
const styles = StyleSheet.create({
  programCard: {
    backgroundColor: rpgTheme.colors.background.card,
    borderRadius: rpgTheme.borderRadius.lg,
    padding: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue + '60',
    ...rpgTheme.effects.shadows.glow,
  },
});
```

### Exemple 2 : Badge de Stat
```javascript
const StatBadge = ({ stat }) => {
  const color = getStatColor(stat);
  const icon = getStatIcon(stat);
  
  return (
    <View style={[styles.badge, { 
      backgroundColor: addAlpha(color, 0.2),
      borderColor: color
    }]}>
      <Text style={[styles.badgeText, { color }]}>
        {icon} {stat}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: rpgTheme.spacing.xs,
    paddingHorizontal: rpgTheme.spacing.md,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
  },
  badgeText: {
    fontSize: rpgTheme.typography.sizes.small,
    fontWeight: rpgTheme.typography.weights.bold,
  },
});
```

### Exemple 3 : Avatar avec Border Glow
```javascript
const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: rpgTheme.borderRadius.full,
    backgroundColor: addAlpha(rpgTheme.colors.neon.blue, 0.2),
    borderWidth: 3,
    borderColor: rpgTheme.colors.neon.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...rpgTheme.effects.shadows.glow,
  },
  avatarText: {
    fontSize: rpgTheme.typography.sizes.heading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.neon.blue,
  },
});
```

### Exemple 4 : Button avec Neon Effect
```javascript
const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: rpgTheme.colors.neon.purple,
    borderRadius: rpgTheme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: rpgTheme.spacing.lg,
    ...rpgTheme.effects.shadows.glow,
  },
  buttonText: {
    color: rpgTheme.colors.text.primary,
    fontSize: rpgTheme.typography.sizes.body,
    fontWeight: rpgTheme.typography.weights.bold,
    textAlign: 'center',
  },
});
```

---

## ⚡ Bonnes Pratiques

1. **Toujours utiliser les valeurs du thème** au lieu de valeurs hard-codées
2. **Utiliser les helpers** pour les couleurs dynamiques (stats, ranks)
3. **Appliquer les effets de glow** sur les éléments importants (cards, buttons, avatars)
4. **Respecter le spacing system** pour une cohérence visuelle
5. **Tester sur plusieurs tailles d'écran** après migration

---

## 🧪 Tester le Thème

Pour tester visuellement tous les éléments du thème :

```javascript
import RpgThemeTest from './components/RpgThemeTest';

// Dans votre navigation ou écran de dev
<RpgThemeTest />
```

Ce composant affiche tous les éléments du thème (couleurs, spacing, typography, shadows, etc.)

---

## 📚 Ressources

- **Fichier thème** : `src/theme/rpgTheme.js`
- **Guide de migration** : `docs/RPG_THEME_MIGRATION.md`
- **Composant de test** : `src/components/RpgThemeTest.js`
