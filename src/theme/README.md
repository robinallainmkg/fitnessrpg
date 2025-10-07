# Theme System

Ce dossier contient tous les fichiers de configuration du thème visuel de l'application.

## Fichiers

### `colors.js` ⚠️ LEGACY
- Ancien système de couleurs
- **À REMPLACER progressivement** par `rpgTheme.js`
- Conservé pour compatibilité arrière

### `rpgTheme.js` ✨ NOUVEAU
- **Configuration centralisée du thème RPG/Manga**
- Palette complète de couleurs néon
- Système de spacing, typography, shadows
- Helpers pour stats, ranks, gradients
- **À UTILISER pour tous les nouveaux composants**

## Migration

Pour migrer un composant vers le nouveau thème :

```javascript
// Avant
import { colors } from '../theme/colors';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A2244',
    padding: 16,
  },
});

// Après
import { rpgTheme } from '../theme/rpgTheme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: rpgTheme.colors.background.card,
    padding: rpgTheme.spacing.md,
    ...rpgTheme.effects.shadows.glow,
  },
});
```

## Documentation

- **Guide complet** : `docs/RPG_THEME_GUIDE.md`
- **Plan de migration** : `docs/RPG_THEME_MIGRATION.md`
- **Composant de test** : `src/components/RpgThemeTest.js`
