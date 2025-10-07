# Migration vers le Thème RPG Centralisé

## ✅ Phase 1 : Fichier thème créé

Le fichier `src/theme/rpgTheme.js` a été créé avec succès et contient :
- ✅ Palette de couleurs complète (backgrounds, neons, gradients, textes, stats, status, ranks)
- ✅ Typographie (fonts, sizes, weights)
- ✅ Spacing system
- ✅ Border radius
- ✅ Shadows & Glows effects
- ✅ Animations presets
- ✅ Icons mappings
- ✅ Component styles predéfinis
- ✅ Helper functions (getStatColor, getRankColor, getStatIcon, getRankIcon, addAlpha)

## 📋 Phase 2 : Migration des Composants

### Ordre de priorité :

#### 1. **UserHeader** ✅ COMPLÉTÉ
**Statut** : Migration complète terminée
**Fichier** : `src/components/UserHeader.js`

**Modifications effectuées** :
- ✅ Import du thème RPG ajouté
- ✅ Fonction getTitleColor migrée vers rpgTheme.colors.ranks
- ✅ Tous les styles migrés vers rpgTheme
- ✅ Avatar avec glow effect (rpgTheme.effects.shadows.glow)
- ✅ Barre XP avec couleur néon bleue
- ✅ Badge streak avec couleur verte néon
- ✅ XP container avec couleur violette néon
- ✅ Spacing uniforme avec rpgTheme.spacing
- ✅ Typography avec rpgTheme.typography

**Résultat** :
- Card avec bordure néon bleue et glow effect
- Avatar circulaire avec bordure bleue lumineuse
- Barre de progression avec fond sombre et bordure
- Badge XP avec fond violet et bordure
- Streak badge vert avec effet néon

---

#### 2. **ActiveProgramCard** ✅ COMPLÉTÉ
**Statut** : Migration complète terminée
**Fichier** : `src/components/ActiveProgramCard.js`

**Modifications effectuées** :
- ✅ Import du thème RPG ajouté
- ✅ Couleurs de statut migrées (active, completed)
- ✅ Card avec bordure néon et shadow
- ✅ Status chip avec couleurs dynamiques
- ✅ Progress bar avec fond sombre
- ✅ Bouton "Gérer" avec style néon violet
- ✅ Tous les spacing migrés
- ✅ Typography uniforme

**Résultat** :
- Card avec bordure gauche colorée (4px)
- Badge de statut avec couleur verte (actif) ou dorée (terminé)
- Barre de progression avec couleur dynamique
- Bouton de gestion avec fond violet néon

---

#### 3. **SessionQueueCard** ✅ COMPLÉTÉ
**Statut** : Migration complète terminée
**Fichier** : `src/components/SessionQueueCard.js`

**Modifications effectuées** :
- ✅ Import du thème RPG ajouté
- ✅ Card avec bordure cyan néon
- ✅ Type chip avec couleur cyan
- ✅ XP badge avec couleur violette
- ✅ Bouton "Commencer" avec couleur bleue néon
- ✅ Message de complétion avec couleur dorée
- ✅ Tous les styles migrés vers rpgTheme
- ✅ Shadow effects ajoutés

**Résultat** :
- Card avec bordure cyan et shadow
- Chip de type avec fond cyan transparent
- Badge XP violet avec bordure
- Bouton bleu néon avec shadow
- Indicateur de complétion doré

---

#### 4. **ProgramProgressCard** 📝 TODO  
**Fichier** : `src/components/ProgramProgressCard.js`

**Modifications à prévoir** :
```javascript
import { rpgTheme, getStatColor, getStatIcon } from '../theme/rpgTheme';

// Utiliser getStatColor() pour les tags de stats (déjà partiellement fait)
// Migrer tous les styles vers rpgTheme
```

---

#### 5. **HomeScreen** 📝 TODO
**Fichier** : `src/screens/HomeScreen.js`

**Modifications à prévoir** :
```javascript
import { rpgTheme } from '../theme/rpgTheme';

// Styles à migrer :
- background : utiliser rpgTheme.colors.background.primary
- spacing : utiliser rpgTheme.spacing.*
- sections : utiliser rpgTheme.borderRadius.*
```

---

#### 6. **SkillTree** 📝 TODO
**Fichier** : `src/screens/SkillTreeScreen.js` (si existe)

**Modifications à prévoir** :
```javascript
import { rpgTheme } from '../theme/rpgTheme';

// Styles à migrer :
- nodes : utiliser rpgTheme.colors.status (active, locked, completed)
- connections : utiliser rpgTheme.colors.neon.blue
- node borders : utiliser rpgTheme.effects.shadows.glow
```

---

## 🔧 Helpers disponibles

### Couleurs de stats
```javascript
import { getStatColor, getStatIcon } from '../theme/rpgTheme';

const color = getStatColor('strength'); // '#FF6B6B'
const icon = getStatIcon('force'); // '💪'
```

### Couleurs de ranks
```javascript
import { getRankColor, getRankIcon } from '../theme/rpgTheme';

const color = getRankColor('débutant'); // '#9E9E9E'
const icon = getRankIcon('legend'); // '⭐'
```

### Gradients
```javascript
import { createLinearGradient, rpgTheme } from '../theme/rpgTheme';

const gradientConfig = createLinearGradient(
  rpgTheme.colors.gradients.primary, 
  'horizontal'
);

// Utiliser avec react-native-linear-gradient
<LinearGradient {...gradientConfig}>
```

### Transparence
```javascript
import { addAlpha } from '../theme/rpgTheme';

const transparentBlue = addAlpha('#4D9EFF', 0.3); // '#4D9EFF4D'
```

---

## ✅ Checklist de validation

Pour chaque composant migré :

- [ ] Import du thème RPG ajouté
- [ ] Toutes les couleurs hard-codées remplacées par rpgTheme.colors.*
- [ ] Tous les spacing hard-codés remplacés par rpgTheme.spacing.*
- [ ] Tous les borderRadius hard-codés remplacés par rpgTheme.borderRadius.*
- [ ] Shadows/glows ajoutés via rpgTheme.effects.shadows.*
- [ ] Component testé visuellement sur émulateur
- [ ] Pas de régression visuelle
- [ ] Cohérence avec les autres composants migrés

---

## 🎨 Exemples d'utilisation

### Exemple 1 : Card avec glow
```javascript
import { rpgTheme } from '../theme/rpgTheme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: rpgTheme.colors.background.card,
    borderRadius: rpgTheme.borderRadius.lg,
    padding: rpgTheme.spacing.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue + '60',
    ...rpgTheme.effects.shadows.glow,
  },
});
```

### Exemple 2 : Badge de rank
```javascript
import { rpgTheme, getRankColor, getRankIcon } from '../theme/rpgTheme';

const RankBadge = ({ rank }) => {
  const color = getRankColor(rank);
  const icon = getRankIcon(rank);
  
  return (
    <View style={[styles.badge, { backgroundColor: color + '30', borderColor: color }]}>
      <Text style={{ color }}>{icon} {rank}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    ...rpgTheme.components.badge,
    borderWidth: 1,
  },
});
```

### Exemple 3 : Button avec effet néon
```javascript
const styles = StyleSheet.create({
  button: {
    ...rpgTheme.components.buttonPrimary,
    backgroundColor: rpgTheme.colors.neon.purple,
  },
  buttonText: {
    color: rpgTheme.colors.text.primary,
    fontSize: rpgTheme.typography.sizes.body,
    fontWeight: rpgTheme.typography.weights.bold,
  },
});
```

---

## 🚀 Prochaines étapes

1. **Terminer UserHeader** (ajouter les styles RPG complets)
2. **Migrer ActiveProgramCard**
3. **Migrer SessionQueueCard**  
4. **Migrer HomeScreen**
5. **Migrer tous les autres screens**
6. **Test global de cohérence visuelle**
7. **Optimisation des performances**

---

## 📝 Notes importantes

- ⚠️ Ne PAS supprimer `src/theme/colors.js` pour l'instant (compatibilité)
- ⚠️ Tester chaque composant après migration
- ⚠️ Vérifier que les gradients fonctionnent correctement
- ✅ Le thème est déjà en mode dark par défaut
- ✅ Tous les helpers sont typés avec JSDoc

---

## 🎯 Objectif final

Avoir une app avec un style **RPG/Manga cohérent** partout :
- Couleurs néon (bleu, violet, cyan, vert, rose)
- Effets de glow sur les cards et buttons
- Bordures lumineuses
- XP bars avec gradients
- Badges de rank avec couleurs thématiques
- Typographie claire et lisible
- Spacing uniforme
