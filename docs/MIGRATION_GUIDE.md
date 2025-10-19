# 🔄 Guide de Migration - Ancien → Nouveau Système de Design

## 📊 Statut de migration

- ✅ **Colours.js**: Unifié avec rpgTheme
- ✅ **Composants**: WorkoutCard, ProgramCard créés
- ✅ **Boutons**: ActionButton, OutlineButton créés
- ✅ **Badges**: StatBadge, StatusBadge créés
- 🔄 **À mettre à jour**: HomeScreen, MissionCard, ActiveProgramCard (ancien)

---

## 🔀 Migration pas à pas

### Étape 1: Remplacer les imports de couleurs

**Avant:**
```javascript
import { colors } from '../theme/colors';
const { primary, warning } = colors;
```

**Après:**
```javascript
import { rpgTheme } from '../theme/rpgTheme';
const primary = rpgTheme.colors.neon.blue;
const warning = rpgTheme.colors.neon.pink;
```

### Étape 2: Remplacer MissionCard par WorkoutCard

**Avant:**
```javascript
import MissionCard from '../components/MissionCard';

<MissionCard
  session={session}
  onPreview={handlePreview}
  onStart={handleStart}
/>
```

**Après:**
```javascript
import { WorkoutCard } from '../components';

<WorkoutCard
  session={session}
  programColor={getProgramColor(session.programId)}
  onPreview={handlePreview}
  onStart={handleStart}
/>
```

### Étape 3: Remplacer ActiveProgramCard par ProgramCard

**Avant:**
```javascript
import ActiveProgramCard from '../components/ActiveProgramCard';

<ActiveProgramCard
  program={program}
  onPress={handlePress}
/>
```

**Après:**
```javascript
import { ProgramCard } from '../components';

<ProgramCard
  program={program}
  onViewTree={handleViewTree}
/>
```

### Étape 4: Remplacer tous les boutons

**Avant:**
```javascript
import { Button } from 'react-native-paper';

<Button mode="contained" onPress={handle}>Commencer</Button>
```

**Après:**
```javascript
import { ActionButton, OutlineButton } from '../components';

<ActionButton onPress={handleStart} icon="play">
  Commencer
</ActionButton>

<OutlineButton onPress={handlePreview} icon="eye-outline">
  Aperçu
</OutlineButton>
```

### Étape 5: Remplacer les badges

**Avant:**
```javascript
<View style={{ backgroundColor: '#7B61FF', padding: 8 }}>
  <Text>+150 XP</Text>
</View>
```

**Après:**
```javascript
import { StatBadge, StatusBadge } from '../components';

<StatBadge icon="lightning-bolt" value={150} label="XP" />
<StatusBadge status="active" />
```

---

## 📝 Fichiers à mettre à jour

### 1. **HomeScreen.js** (Principal)
- Remplacer MissionCard par WorkoutCard
- Remplacer ActiveProgramCard par ProgramCard
- Remplacer tous les boutons par ActionButton/OutlineButton

### 2. **MissionCard.js** → À archiver
Remplacé par `WorkoutCard`

### 3. **ActiveProgramCard.js** → À archiver
Remplacé par `ProgramCard`

### 4. **ProgramProgressCard.js** (Si utilisé)
- Supprimer les styles hardcoded
- Utiliser les composants unifiés

### 5. **Tous les écrans utilisant des couleurs hardcoded**
```bash
# Chercher tous les fichiers avec des couleurs hardcoded
grep -r "#[0-9A-F]{6}" src/ --include="*.js" | grep -v "rpgTheme"
```

---

## ✅ Checklist de migration

### Phase 1: Preparation
- [ ] Lire ce guide complet
- [ ] Comprendre la nouvelle architecture
- [ ] Consulter le DESIGN_SYSTEM_GUIDE.md

### Phase 2: Composants de base
- [ ] ✅ WorkoutCard créé et testé
- [ ] ✅ ProgramCard créé et testé
- [ ] ✅ ActionButton créé et testé
- [ ] ✅ OutlineButton créé et testé
- [ ] ✅ StatBadge créé et testé
- [ ] ✅ StatusBadge créé et testé

### Phase 3: Integration HomeScreen
- [ ] Mettre à jour HomeScreen.js
- [ ] Tester les quêtes
- [ ] Tester les programmes
- [ ] Vérifier responsive

### Phase 4: Cleanup
- [ ] Archiver MissionCard.js
- [ ] Archiver ActiveProgramCard.js
- [ ] Supprimer les styles hardcoded
- [ ] Documenter les changements

### Phase 5: Test & Validation
- [ ] Tester sur écran petite résolution
- [ ] Tester sur écran grande résolution
- [ ] Vérifier contraste des textes (WCAG AA)
- [ ] Vérifier fonctionnement des boutons
- [ ] Tester mode sombre

---

## 🎨 Exemples de transformation

### Exemple 1: Card quête simple

**Ancien code (MissionCard):**
```javascript
<MissionCard
  session={{
    skillName: 'Pull-ups Stricts',
    levelNumber: 2,
    levelName: 'Progression',
    programName: 'Street Workout',
    programIcon: '💪',
    status: 'available',
    xpReward: 100,
  }}
  onPreview={() => console.log('Preview')}
  onStart={() => console.log('Start')}
/>
```

**Nouveau code (WorkoutCard):**
```javascript
<WorkoutCard
  session={{
    skillName: 'Pull-ups Stricts',
    levelNumber: 2,
    levelName: 'Progression',
    programName: 'Street Workout',
    programIcon: '💪',
    status: 'available',
    xpReward: 100,
  }}
  programColor={getProgramColor('streetworkout')} // #4D9EFF
  onPreview={() => console.log('Preview')}
  onStart={() => console.log('Start')}
/>
```

### Exemple 2: Card programme avec boutons

**Ancien code:**
```javascript
<ActiveProgramCard program={program} onPress={handleViewTree} />
```

**Nouveau code:**
```javascript
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

### Exemple 3: Utiliser les couleurs programmatiquement

**Ancien approche (hardcoded):**
```javascript
const borderColor = program.id === 'streetworkout' ? '#4D9EFF' : '#00FF94';

<View style={{ borderColor, borderWidth: 2 }}>
  {/* contenu */}
</View>
```

**Nouvelle approche (centralisée):**
```javascript
import { getProgramColor } from '../theme/colors';

const borderColor = getProgramColor(program.id);

<View style={{ borderColor, borderWidth: 2 }}>
  {/* contenu */}
</View>
```

---

## 🧪 Testing après migration

### Unit Tests
```javascript
describe('WorkoutCard', () => {
  it('renders with program color', () => {
    render(
      <WorkoutCard
        session={mockSession}
        programColor="#4D9EFF"
        onPreview={jest.fn()}
        onStart={jest.fn()}
      />
    );
    // assert render
  });

  it('calls onStart when button pressed', () => {
    const onStart = jest.fn();
    render(
      <WorkoutCard
        session={mockSession}
        programColor="#4D9EFF"
        onPreview={jest.fn()}
        onStart={onStart}
      />
    );
    fireEvent.press(screen.getByText('Commencer'));
    expect(onStart).toHaveBeenCalled();
  });
});
```

### Visual Tests (Screenshot comparison)
```bash
# Prendre des screenshots de référence
npm run test -- --updateSnapshot

# Puis comparer les changements
npm run test -- --watch
```

---

## 📞 Troubleshooting

### Problème: Couleurs incorrectes après migration

**Solution:**
```javascript
// Vérifier que rpgTheme est importé correctement
import { rpgTheme } from '../theme/rpgTheme';

// Utiliser rpgTheme.colors au lieu de colors
const color = rpgTheme.colors.neon.blue; // ✅ Correct
```

### Problème: Boutons ne réagissent pas au press

**Solution:**
```javascript
// S'assurer que disabled n'est pas true
<ActionButton
  onPress={handlePress}
  disabled={false}  // ✅ Doit être false
>
  Texte
</ActionButton>
```

### Problème: Cards ne s'affichent pas correctement

**Solution:**
```javascript
// WorkoutCard et ProgramCard utilisent marginHorizontal
// S'assurer qu'il y a de la place sur les côtés
<ScrollView style={{ paddingHorizontal: 0 }}>
  {/* Les cards gèrent leur propre margin */}
  <WorkoutCard ... />
</ScrollView>
```

---

## 📚 Ressources

- [Design System Guide](./DESIGN_SYSTEM_GUIDE.md)
- [rpgTheme Documentation](../theme/rpgTheme.js)
- [Color System](../theme/colors.js)

---

**Dernier update:** Oct 19, 2025
