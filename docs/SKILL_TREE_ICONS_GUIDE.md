# Guide Visuel - Icônes Lucide par Programme Street Workout

## 📋 Mapping Complet par Tier

### Tier 0 - Fondations Débutant (Vert #4CAF50)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `beginner-foundation` | Fondations Débutant | `Sprout` | 🌱 | Germination, début du parcours |

### Tier 1 - Bases (Bleu #2196F3)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `hanging-hollow` | Hanging Hollow Hold | `Target` | 🎯 | Précision et contrôle du corps |
| `strict-pullups` | Strict Pull-Ups | `Dumbbell` | 🏋️ | Force basique de traction |

### Tier 2 - Intermédiaire (Orange #FF9800)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `lsit-hold` | L-Sit Hold | `Triangle` | △ | Géométrie parfaite du L-sit |
| `pullup-negatives` | Pull-Up Negatives | `ArrowDown` | ⬇️ | Contrôle de la descente |

### Tier 3 - Intermédiaire+ (Rouge #F44336)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `chest-to-bar` | Chest-to-Bar Pull-Ups | `Crosshair` | ⊕ | Précision de la hauteur |
| `straight-bar-dips` | Straight Bar Dips | `Flame` | 🔥 | Intensité et puissance |
| `hanging-leg-raises` | Hanging Leg Raises | `MoveVertical` | ⬍ | Mouvement vertical contrôlé |

### Tier 4 - Avancé (Violet #9C27B0)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `muscleup-strict` | Muscle-Up Strict | `Zap` | ⚡ | Puissance explosive |
| `lsit-pullups` | L-Sit Pull-Ups | `Layers` | ≡ | Combinaison de compétences |

### Tier 5 - Avancé+ (Rouge-Orange #FF5722)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `toes-to-bar` | Toes-to-Bar | `Activity` | 📊 | Mouvement dynamique |
| `front-lever-beginner` | Front Lever Débutant | `Shield` | 🛡️ | Force statique défensive |
| `explosive-pullups` | Explosive Pull-Ups | `Sparkles` | ✨ | Explosivité brillante |

### Tier 6 - Expert (Rose #E91E63)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `highbar-muscleup` | Highbar Muscle-Up | `Rocket` | 🚀 | Élévation technique |
| `muscleup-advanced` | Muscle-Up Avancé | `Zap` | ⚡ | Double puissance |

### Tier 7 - Elite (Violet Foncé #8E24AA)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `front-lever-advanced` | Front Lever Avancé | `ShieldAlert` | 🛡️⚠️ | Force ultime + alerte |
| `back-lever` | Back Lever | `RotateCcw` | ↻ | Rotation inversée |
| `archer-pullups` | Archer Pull-Ups | `Target` | 🎯 | Précision unilatérale |

### Tier 8 - Légende (Bleu Profond #1976D2)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `typewriter-pullups` | Typewriter Pull-Ups | `Wind` | 🌬️ | Fluidité latérale |
| `hefesto` | Hefesto | `Crown` | 👑 | Royauté mythique |

### Tier 9 - Master (Or #FFD700)

| Programme ID | Nom | Icône Lucide | Symbole | Signification |
|--------------|-----|--------------|---------|---------------|
| `one-arm-pullup` | One-Arm Pull-Up | `Gem` | 💎 | Rareté absolue |
| `master-street` | Master Street | `Trophy` | 🏆 | Victoire finale |

---

## 🎨 États Visuels

### Icônes d'État Spéciales

| État | Icône Lucide | Usage |
|------|--------------|-------|
| `locked` | `Lock` | Node verrouillé (prérequis non remplis) |
| `completed` | `Star` | (Optionnel) Node complété |
| `available` | `Unlock` | (Optionnel) Node disponible |

### Rendu par État

#### 🔒 LOCKED (Verrouillé)
```
┌─────────────────────────┐
│  Background: #1E293B    │
│  Border: 2px #334155    │
│  Icon: <Lock> #4A5568   │
│  Size: 28px             │
│  Glow: Aucun            │
└─────────────────────────┘
```

#### 🆕 UNLOCKED (Débloqué - Nouveau)
```
┌─────────────────────────────────┐
│  Background: LinearGradient     │
│    #4D9EFF → #7B61FF            │
│  Border: 3px tierColor          │
│  Icon: <SkillIcon> #FFFFFF      │
│  Size: 32px                     │
│  Glow: tierColor, radius 20     │
│  Badge: "NOUVEAU" (vert)        │
│  Animation: Pulse continu       │
└─────────────────────────────────┘
```

#### ⏳ IN_PROGRESS (En cours)
```
┌─────────────────────────────────┐
│  Background: LinearGradient     │
│    #4D9EFF → #7B61FF            │
│  Border: 3px #FFD700 (or)       │
│  Icon: <SkillIcon> #FFFFFF      │
│  Size: 32px                     │
│  Glow: #FFD700, radius 20       │
│  Badge: "En cours" (orange)     │
│  Progress: Barre circulaire     │
│  Text: "2/4" (niveau/total)     │
└─────────────────────────────────┘
```

#### ✅ COMPLETED (Complété)
```
┌─────────────────────────────────┐
│  Background: LinearGradient     │
│    #4D9EFF → #7B61FF            │
│  Border: 3px #4CAF50 (vert)     │
│  Icon: <SkillIcon> #FFFFFF      │
│  Size: 32px                     │
│  Glow: #4CAF50, radius 20       │
│  Badge: "✅ Complété" (vert)    │
│  XP: "+300 XP" (or)             │
└─────────────────────────────────┘
```

---

## 📐 Spécifications Techniques

### Dimensions
- **Container**: 100px width
- **Node circle**: 80×80px (borderRadius: 40)
- **Glow effect**: 90×90px (5px overflow)
- **Icons**: 32px (unlocked), 28px (locked)
- **Modal icon**: 40px dans container 72×72px

### Colors
```javascript
// Gradient principal (débloqué)
colors={['#4D9EFF', '#7B61FF']}

// Background locked
backgroundColor: '#1E293B'
borderColor: '#334155'

// Couleurs d'état
IN_PROGRESS: '#FFD700' // Or
COMPLETED: '#4CAF50'   // Vert
```

### Glow Effect
```javascript
shadowColor: tierColor,
shadowOffset: { width: 0, height: 0 },
shadowOpacity: 0.8,
shadowRadius: 20,
elevation: 10,
```

### Stroke Width
- Icons unlocked: `strokeWidth={2.5}`
- Icons locked: `strokeWidth={2.5}`

---

## 🔧 Utilisation dans le Code

### Récupérer une icône pour un programme
```javascript
import { getSkillIcon } from '../utils/skillIcons';

const IconComponent = getSkillIcon('beginner-foundation');
// Returns: Sprout component

<IconComponent 
  size={32} 
  color="#FFFFFF" 
  strokeWidth={2.5} 
/>
```

### Récupérer la couleur d'un tier
```javascript
import { getTierColor } from '../theme/colors';

const tierColor = getTierColor(program.position?.tier, fallback);
// Returns: '#4CAF50' pour tier 0
```

### Rendu conditionnel avec gradient
```javascript
{shouldUseGradient() ? (
  <LinearGradient colors={['#4D9EFF', '#7B61FF']} style={styles.gradientCircle}>
    <IconComponent size={32} color="#FFFFFF" strokeWidth={2.5} />
  </LinearGradient>
) : (
  <Lock size={28} color="#4A5568" strokeWidth={2.5} />
)}
```

---

## 📊 Distribution des Icônes

### Par Catégorie d'Icône

**Mouvement/Action** (9 icônes):
- `Dumbbell`, `Flame`, `Zap` (x2), `Activity`, `Sparkles`, `Rocket`, `Wind`, `MoveVertical`

**Contrôle/Précision** (3 icônes):
- `Target` (x2), `Crosshair`

**Force/Défense** (3 icônes):
- `Shield`, `ShieldAlert`, `RotateCcw`

**Géométrie/Structure** (2 icônes):
- `Triangle`, `Layers`

**Direction** (1 icône):
- `ArrowDown`

**Récompense** (3 icônes):
- `Crown`, `Gem`, `Trophy`

**Progression** (2 icônes):
- `Sprout`, `Lock` (état)

### Icônes les Plus Utilisées
1. `Target` - 2× (hanging-hollow, archer-pullups)
2. `Zap` - 2× (muscleup-strict, muscleup-advanced)
3. Autres - 1× chacune

---

**Version**: 1.0.0  
**Date**: 4 octobre 2025  
**Lucide React Native**: 0.544.0
