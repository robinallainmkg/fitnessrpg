# Images de Fond - Intégration HomeScreen et ProgramSelectionScreen

## 🖼️ Images Utilisées

### Assets Intégrés
- **Home-BG-1.jpg** : Fond pour utilisateurs existants (HomeScreen principal)
- **Home-BG-2.jpg** : Fond pour onboarding (OnboardingView + ProgramSelectionScreen)

## 📱 Implémentation

### HomeScreen.js
#### Utilisateurs Existants (Image 1)
```javascript
<ImageBackground 
  source={require('../../assets/Home-BG-1.jpg')} 
  style={styles.container}
  resizeMode="cover"
>
  <View style={styles.backgroundOverlay} />
  <ScrollView style={styles.scrollContainer}>
    {/* Contenu principal */}
  </ScrollView>
</ImageBackground>
```

#### Nouveaux Utilisateurs - OnboardingView (Image 2)
```javascript
<ImageBackground 
  source={require('../../assets/Home-BG-2.jpg')} 
  style={styles.onboardingContainer}
  resizeMode="cover"
>
  <View style={styles.backgroundOverlay} />
  {/* Contenu onboarding */}
</ImageBackground>
```

### ProgramSelectionScreen.js (Image 2)
```javascript
<ImageBackground 
  source={require('../../assets/Home-BG-2.jpg')} 
  style={styles.backgroundImage}
  resizeMode="cover"
>
  <View style={styles.backgroundOverlay} />
  <ScrollView style={styles.container}>
    {/* Sélection programmes */}
  </ScrollView>
</ImageBackground>
```

## 🎨 Améliorations Visuelles

### Overlay Semi-Transparent
```javascript
backgroundOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.75)', // Opacity 75% sur tous les screens
}
```

### Text Shadow pour Lisibilité
```javascript
textShadowColor: 'rgba(0, 0, 0, 0.75)',
textShadowOffset: { width: 0, height: 2 },
textShadowRadius: 4,
```

## 🔄 Logique de Sélection d'Images

### HomeScreen
```javascript
// Si nouvel utilisateur (globalXP === 0)
if (isNewUser) {
  return <OnboardingView />; // → Home-BG-2.jpg
}

// Si utilisateur existant
return (
  <ImageBackground source={Home-BG-1.jpg}> // → Home-BG-1.jpg
    {/* Interface principale */}
  </ImageBackground>
);
```

### ProgramSelectionScreen
- **Toujours Home-BG-2.jpg** (cohérence avec onboarding)
- Utilisé pour nouveaux utilisateurs ET gestion programmes existants

## 🎯 Cohérence Visuelle

### Même Image pour Onboarding
- **OnboardingView** : Home-BG-2.jpg
- **ProgramSelectionScreen** : Home-BG-2.jpg
- **Expérience unifiée** : Transition fluide onboarding → sélection programmes

### Différenciation Utilisateurs
- **Nouveaux** : Image 2 (plus accueillante, focus découverte)
- **Existants** : Image 1 (plus mature, focus performance)

## 🛠️ Modifications Techniques

### Structure Modifiée
1. **Import ImageBackground** ajouté aux deux screens
2. **Overlay ajouté** pour contraste texte/image
3. **Text shadows** pour améliorer lisibilité
4. **Styles restructurés** pour accommoder les backgrounds

### Performance
- **Images locales** : Chargement rapide, pas de dépendance réseau
- **resizeMode="cover"** : Adaptation automatique aux différentes tailles d'écran
- **Overlay léger** : Impact minimal sur performance

## 📋 Styles Ajoutés

```javascript
// Styles communs aux deux screens
backgroundImage: {
  flex: 1,
},
backgroundOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.75)', // Opacité unifiée à 75%
},

// Text shadows pour lisibilité
textShadowColor: 'rgba(0, 0, 0, 0.75)',
textShadowOffset: { width: 0, height: 2 },
textShadowRadius: 4,
```

## 🎮 Expérience Utilisateur Améliorée

### Immersion Visuelle
- **Fond dynamique** vs couleur unie
- **Atmosphère gaming** renforcée
- **Différenciation visuelle** onboarding/app principale

### Lisibilité Maintenue
- **Overlay sombre** pour contraste
- **Text shadows** sur tous les textes importants
- **Couleurs texte** adaptées au nouveau contexte

### Cohérence Design
- **Même image** pour parcours onboarding complet
- **Transition naturelle** entre écrans
- **Harmonie visuelle** avec le thème sombre de l'app
