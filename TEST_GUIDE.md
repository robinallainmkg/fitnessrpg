# 🧪 Guide de Test - Application Fitness Game

## 📱 Comment Tester l'Application

### Option 1: Navigateur Web (Recommandé)
✅ **ACTIF** - L'application est accessible sur : http://localhost:19006

**Avantages :**
- Test immédiat sans configuration
- DevTools pour debugging
- Hot reload automatique

### Option 2: Expo Go sur Mobile
📱 **Scannez le QR Code** affiché dans le terminal avec :
- **Android** : App Expo Go
- **iOS** : App Camera (intégrée)

**Avantages :**
- Test sur vraie interface mobile
- Notifications et gestes natifs
- Performance réaliste

### Option 3: Émulateur Android (Optionnel)
🔧 **Configuration requise** : Android Studio + AVD
Suivre le guide : `ANDROID_SETUP_GUIDE.md`

## 🎯 Fonctionnalités à Tester

### 1. **Flux Complet de Workout**
```
HomeScreen → ProgramDetail → WorkoutSession → WorkoutSummary
```

**Test Niveau Standard (1-5) :**
- Sélectionner "Muscle-Up Master"
- Choisir Niveau 1 ou 2  
- Compléter avec score >= 800
- ✅ Vérifier : Message "Niveau validé", bouton "Niveau suivant"

**Test Complétion Programme (Niveau 6) :**
- Aller au Niveau 6 (si débloqué)
- Compléter avec score >= 800
- ✅ Vérifier : 
  - Card "🎉 PROGRAMME COMPLÉTÉ !"
  - Section programmes débloqués
  - Bouton partage
  - Animation d'apparition

### 2. **Informations de Prérequis**
```
HomeScreen → ProgramDetail
```
- ✅ Vérifier sections :
  - **Informations** : Catégorie, difficulté, durée
  - **Prérequis** : Programmes requis avec statut
  - **Débloque** : Programmes débloqués après complétion

### 3. **Système de Progression**
```
Données Firebase (simulées localement)
```
- ✅ Vérifier calcul des scores
- ✅ Vérifier progression des niveaux
- ✅ Vérifier déverrouillage automatique

## 🐛 Problèmes Connus

### Warnings Non-Critiques
```
WARNING: '@react-native-vector-icons/material-design-icons'
ERROR: Unsupported MIME type: audio/mpeg
```
**Impact :** Icônes de fallback + pas d'audio
**Solution :** Application fonctionnelle, warnings cosmétiques

### Firebase en Mode Hors-Ligne
**Statut :** Données simulées localement
**Test :** Fonctionnalités de progression peuvent être limitées

## ✅ Checklist de Validation

### Interface Utilisateur
- [ ] HomeScreen affiche les programmes
- [ ] ProgramDetail affiche prérequis et informations
- [ ] WorkoutSession fonctionne avec timer et saisie
- [ ] WorkoutSummary affiche résultats et déverrouillages

### Logique Métier
- [ ] Calcul de score correct (exercices + performance)
- [ ] Progression de niveau (currentLevel++)
- [ ] Complétion programme (niveau 6 + score >= 800)
- [ ] Déverrouillage automatique (program.unlocks)

### Animations & UX
- [ ] Animations smooth sur complétion programme
- [ ] Boutons adaptatifs selon contexte
- [ ] Navigation cohérente
- [ ] Messages de félicitations appropriés

## 🚀 Test Rapide

**1 minute de test :**
1. Ouvrir http://localhost:19006
2. Cliquer sur "Muscle-Up Master"
3. Vérifier les sections prérequis
4. Lancer "Test Niveau 1"
5. Saisir des valeurs élevées (ex: 10/5 reps)
6. Terminer la séance
7. Vérifier WorkoutSummary

**Résultat attendu :** Interface cohérente, navigation fluide, calculs corrects

---

🎉 **L'application est prête pour les tests !**
Toutes les fonctionnalités de complétion et déverrouillage sont implémentées.
