# 🎮 MissionCard - Redesign Gaming/RPG

## 📋 Vue d'ensemble

Le composant `MissionCard` a été complètement redesigné pour correspondre au thème gaming/RPG de l'application avec un style moderne et immersif.

## ✨ Nouvelles fonctionnalités

### 1. **Section renommée**
- ~~"Missions disponibles"~~ → **"⚔️ Quêtes disponibles"**

### 2. **Affichage du programme/catégorie**
Chaque carte affiche maintenant clairement le programme auquel elle appartient :
- **Icône** (emoji) grande et visible
- **Nom du programme** avec la couleur du programme
- **Niveau** (Niveau 1, 2, 3...)

### 3. **Design gaming moderne**

#### 🌈 Glassmorphism
- Fond semi-transparent avec gradient
- Bordure néon colorée selon la couleur du programme
- Effet de glow/shadow autour de la carte

#### 💎 Effets visuels
- **Badge programme** : Fond teinté avec la couleur du programme (15% opacity)
- **Badge XP** : Gradient violet avec icône éclair et effet glow
- **Bordures dynamiques** : Couleur adaptée au programme (bleu pour Street Workout, orange pour Running, etc.)
- **Corner accent** : Détail décoratif gaming dans le coin supérieur droit

#### 🎨 Hiérarchie visuelle
1. **Titre de la mission** (20px, bold, blanc)
2. **Badge programme** (icône 28px + texte uppercase)
3. **Niveau & XP** (badges proéminents)
4. **Boutons d'action** (gradients et effets)

### 4. **Boutons redesignés**

#### 👁️ Bouton Aperçu (outline)
- Bordure colorée selon le programme
- Icône "eye-outline"
- Transparent avec bordure de 2px

#### ▶️ Bouton Commencer (filled)
- Gradient bleu (#4D9EFF → #3B82F6)
- Icône "play"
- Effet glow bleu

### 5. **État "Complété"**
- Badge checkmark vert avec glow
- Overlay vert semi-transparent
- Texte "Quête accomplie" en uppercase

## 🎨 Palette de couleurs

### Thème général
- **Background principal** : `#0F172A` (dark blue)
- **Background secondaire** : `#1E293B` (slate)
- **Accent primary** : `#4D9EFF` (blue neon)
- **Accent secondary** : `#7B61FF` (purple)
- **Success** : `#00FF94` (green neon)
- **Text primary** : `#FFFFFF`
- **Text secondary** : `#94A3B8` (slate gray)

### Couleurs dynamiques (selon programme)
- **Street Workout** : `#4D9EFF` (bleu)
- **Running** : `#FF6B35` (orange)
- **Calisthenics** : `#10B981` (vert)
- etc.

## 📐 Structure des props

```javascript
<MissionCard
  session={{
    // Identification
    id: "street-pullups-1",
    programId: "street",
    skillId: "pullups",
    
    // Affichage
    skillName: "Tractions",           // Titre principal
    levelNumber: 1,                   // Numéro du niveau
    levelName: "Initiation",          // Nom du niveau (optionnel)
    
    // Programme (NOUVEAU ⭐)
    programName: "Street Workout",    // Nom du programme
    programIcon: "💪",                // Emoji du programme
    programColor: "#4D9EFF",          // Couleur du programme (HEX)
    
    // Progression
    xpReward: 100,                    // XP gagnés
    status: "available",              // "available" | "completed" | "locked"
    
    // Exercices
    exercises: [...],
    totalLevels: 5,
  }}
  onPreview={() => handlePreview()}   // Callback aperçu
  onStart={() => handleStart()}       // Callback démarrer
  disabled={false}                    // État désactivé
/>
```

## 🔧 Modifications techniques

### Fichiers modifiés

#### 1. `src/components/MissionCard.js`
- Redesign complet du composant
- Ajout de la section programme avec badge
- Nouveaux styles gaming (glassmorphism, glow, etc.)
- Support de `programColor` dynamique

#### 2. `src/screens/HomeScreen.js`
- Titre changé : "⚔️ Quêtes disponibles"

#### 3. `src/services/sessionQueueService.js`
- Ajout de `programColor` dans `generateInitialQueue()`
- Ajout de `programColor` dans `generateAvailableSessions()`

### Dépendances
- `expo-linear-gradient` (déjà installé)
- `react-native-vector-icons` (déjà installé)
- `react-native-paper` (déjà installé)

## 🎯 Design patterns utilisés

### Glassmorphism
```javascript
<LinearGradient
  colors={[
    'rgba(15, 23, 42, 0.95)',
    'rgba(30, 41, 59, 0.85)',
    'rgba(15, 23, 42, 0.95)',
  ]}
  style={[
    styles.cardGradient,
    { borderColor: programColor }
  ]}
/>
```

### Glow effect
```javascript
shadowColor: borderColor,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 12,
elevation: 8,
```

### Dynamic tinting
```javascript
backgroundColor: `${programColor}15` // 15% opacity
color: programColor
```

## 🚀 Améliorations futures

### Court terme
- [ ] Animations au press (scale, opacity)
- [ ] Badge "NOUVEAU" pour nouvelles quêtes
- [ ] Shimmer effect pendant le chargement

### Moyen terme
- [ ] Parallax effect au scroll
- [ ] Particle effects lors de la complétion
- [ ] Sons de feedback (optionnel)

### Long terme
- [ ] Thèmes customisables par utilisateur
- [ ] Variantes de cartes (rareté : commune, rare, épique, légendaire)
- [ ] Animations Lottie pour les états

## 📱 Responsive

Le design s'adapte automatiquement :
- **Padding** : 20px constant
- **Icônes** : Tailles fixes (28px pour programme, 14-16px pour actions)
- **Texte** : Ellipsis avec `numberOfLines` pour éviter les débordements
- **Boutons** : `flex: 1` pour répartir l'espace équitablement

## 🎨 Inspiration

Design inspiré de :
- **Genshin Impact** : Cartes élégantes, glassmorphism
- **Valorant** : Néons, bordures lumineuses
- **League of Legends** : Gradients vibrants, badges XP
- **Mobile Legends** : Effets de glow, hierarchy claire

## ✅ Checklist de validation

- [x] Affichage du programme avec icône, nom et couleur
- [x] Badge XP avec gradient et glow
- [x] Bordures néon colorées dynamiquement
- [x] Titre "Quêtes disponibles" avec emoji
- [x] Boutons redesignés (outline + gradient)
- [x] État "complété" avec style distinct
- [x] Glassmorphism et effets visuels
- [x] Hiérarchie visuelle claire
- [x] Support de `programColor` dans le service
- [x] Compatible avec la structure de données existante

## 📸 Captures d'écran

_À ajouter après test sur device_

---

**Note** : Ce redesign transforme complètement l'expérience utilisateur en apportant un look gaming moderne qui donne vraiment envie de cliquer sur les quêtes ! 🎮✨
