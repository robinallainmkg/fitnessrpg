# 🎮 SkillTreeScreen Header - Redesign avec Image Background

## 📋 Vue d'ensemble

Le header du SkillTreeScreen a été redesigné pour utiliser l'**image de background du programme** avec un overlay élégant, créant une expérience immersive et visuellement impressionnante.

## ✨ Nouveau design

### Avant 🔴
- Gradient simple avec couleur unie
- Pas d'image de fond
- Moins immersif

### Après 🟢
- **Image de background du programme** (photo de street workout, running, etc.)
- **Overlay gradient sombre** pour la lisibilité du texte
- **Effets visuels améliorés** (shadows, borders, glassmorphism)
- Look beaucoup plus **gaming et professionnel**

## 🖼️ Structure du nouveau header

```
┌─────────────────────────────────────────┐
│  [IMAGE DE BACKGROUND DU PROGRAMME]     │
│  ┌───────────────────────────────────┐  │
│  │   OVERLAY GRADIENT SOMBRE         │  │
│  │                                   │  │
│  │         [ICÔNE 80x80]             │  │
│  │      💪 Street Workout            │  │
│  │     Arbre de progression          │  │
│  │                                   │  │
│  │  [Compét] [XP Total] [Tier Max]  │  │
│  │   3/12      1250       Tier 2     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🎨 Design features

### 1. **ImageBackground dynamique**
L'image change selon le programme :
- **Street Workout** : Photo de street workout (barres, parc)
- **Running** : Photo de course (runner)
- **Calisthenics** : Photo de calisthenics

```javascript
PROGRAM_BACKGROUND_IMAGES = {
  'assets/programmes/StreetWorkout.jpg': require('../../assets/programmes/StreetWorkout.jpg'),
  'assets/programmes/running-5.jpg': require('../../assets/programmes/running-5.jpg'),
}
```

### 2. **Overlay gradient à 3 niveaux**
Pour une transition douce et une excellente lisibilité :

```javascript
colors={[
  'rgba(0, 0, 0, 0.7)',      // Haut : 70% opacité
  'rgba(0, 0, 0, 0.85)',     // Milieu : 85% opacité
  'rgba(15, 23, 42, 0.95)'   // Bas : 95% opacité (fusion avec l'arbre)
]}
```

### 3. **Icône du programme améliorée**
- Taille : **80x80px**
- Background glassmorphism : `rgba(255, 255, 255, 0.15)`
- Bordure : **3px** blanc semi-transparent
- Shadow élégant pour la profondeur

### 4. **Typographie renforcée**
- **Titre** : 28px, weight 800, avec text shadow
- **Description** : 14px avec shadow subtil
- **Badges** : Labels en uppercase avec letterspacing

### 5. **Badges statistiques redesignés**
- Background : `rgba(255, 255, 255, 0.2)` (glassmorphism)
- Border : `rgba(255, 255, 255, 0.3)`
- Border radius : 16px (plus arrondi)
- Shadow pour la profondeur
- Labels uppercase avec letterspacing

## 🔧 Modifications techniques

### Fichier modifié
`src/screens/SkillTreeScreen.js`

### 1. Imports mis à jour
```javascript
import {
  // ...
  ImageBackground  // ⭐ AJOUTÉ
} from 'react-native';

// Mapping des images
const PROGRAM_BACKGROUND_IMAGES = {
  'assets/programmes/StreetWorkout.jpg': require('../../assets/programmes/StreetWorkout.jpg'),
  'assets/programmes/running-5.jpg': require('../../assets/programmes/running-5.jpg'),
};
```

### 2. Structure JSX
```javascript
<ImageBackground
  source={backgroundImage}
  style={styles.headerBackground}
  imageStyle={styles.headerBackgroundImage}
>
  <LinearGradient
    colors={[...]}
    style={styles.headerOverlay}
  >
    <View style={styles.headerContent}>
      {/* Contenu du header */}
    </View>
  </LinearGradient>
</ImageBackground>
```

### 3. Nouveaux styles
- `headerBackground` : Container de l'ImageBackground
- `headerBackgroundImage` : Style de l'image (cover)
- `headerOverlay` : Gradient overlay avec padding
- `headerContent` : Container du contenu centré
- Styles améliorés pour `badge`, `headerTitle`, `headerIcon`, etc.

## 🎯 Avantages du nouveau design

### UX/UI
✅ **Immersion** : L'image du programme crée une connexion émotionnelle
✅ **Identité visuelle** : Chaque programme a son propre look
✅ **Professionnel** : Look gaming moderne et élégant
✅ **Lisibilité** : Overlay gradient assure la lisibilité du texte
✅ **Cohérence** : Utilise la même image que dans HomeScreen et ProgramSelection

### Technique
✅ **Performance** : Image cachée, pas de re-render inutile
✅ **Responsive** : S'adapte à toutes les tailles d'écran
✅ **Fallback** : Image par défaut si backgroundImage manquant
✅ **Maintenable** : Mapping centralisé des images

## 📱 Responsive

Le design s'adapte automatiquement :
- **Padding** : 60px top, 24px horizontal, 24px bottom
- **Image** : Cover mode (remplissage complet)
- **Overlay** : Full width
- **Badges** : Responsive avec `minWidth` et `flex`

## 🎨 Exemples visuels

### Street Workout
```
Background : Photo de barres de street workout
Overlay : Gradient noir → dark blue
Icône : 💪
Titre : Street Workout
Couleur accent : Bleu (#4D9EFF)
```

### Running
```
Background : Photo de runner
Overlay : Gradient noir → dark blue
Icône : 🏃
Titre : Run 10k - 45min
Couleur accent : Orange (#FF6B35)
```

## 🚀 Améliorations futures

### Court terme
- [ ] Parallax effect léger au scroll
- [ ] Animation fade-in au chargement de l'image
- [ ] Effet blur sur l'image de background (optionnel)

### Moyen terme
- [ ] Vidéo en background (pour programmes premium)
- [ ] Badges animés (counter animation)
- [ ] Effet de particules sur l'icône

### Long terme
- [ ] Headers customisables par utilisateur
- [ ] Thèmes jour/nuit
- [ ] Headers saisonniers (Noël, Halloween, etc.)

## ✅ Checklist de validation

- [x] ImageBackground importé
- [x] Mapping PROGRAM_BACKGROUND_IMAGES créé
- [x] Header JSX restructuré avec ImageBackground + LinearGradient
- [x] Styles mis à jour (headerBackground, headerOverlay, etc.)
- [x] Text shadows ajoutés pour la lisibilité
- [x] Badges redesignés avec glassmorphism
- [x] Support de backgroundImage dynamique
- [x] Fallback vers image par défaut
- [x] Pas d'erreurs de compilation

## 📸 Captures d'écran

_À ajouter après test sur device_

---

**Note** : Ce redesign transforme complètement l'expérience du SkillTree ! L'image de background crée une immersion incroyable et donne un look gaming de très haute qualité. 🎮✨

Le header n'est plus un simple gradient mais une véritable **hero section** qui met en valeur chaque programme.
