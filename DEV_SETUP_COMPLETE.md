# 🚀 Environnement de Développement - READY!

## ✅ Configuration Terminée

### Outils de Debug Installés

1. **Logger Avancé** (`src/utils/debugHelper.js`)
   - Logs colorés par catégorie
   - Timers de performance
   - Compteurs
   - Inspection d'objets

2. **Écran de Diagnostic** (`src/screens/DevDiagnosticScreen.js`)
   - Test Firebase/Firestore
   - Inspection données utilisateur
   - Gestion AsyncStorage
   - Tests de performance

3. **VS Code Debug Config** (`.vscode/launch.json`)
   - Debug Android
   - Debug iOS
   - Attach to packager

4. **Logs dans HomeScreen**
   - Timers sur loadAllData
   - Tracking de chaque étape
   - Détection des erreurs Firestore

## 🎯 Comment Utiliser

### Lancer l'App

```bash
npx expo start --clear
```

**Options Metro :**
- `a` : Ouvrir sur Android
- `w` : Ouvrir sur Web
- `j` : Ouvrir Chrome Debugger
- `r` : Reload l'app
- `m` : Toggle menu dev

### Accéder au Diagnostic

En mode développement, un **bouton orange "🔧 DEBUG"** apparaît en haut à droite de l'écran d'accueil.

Clique dessus pour :
- ✅ Tester la connexion Firebase
- ✅ Vérifier Firestore
- ✅ Inspecter les données utilisateur
- ✅ Voir AsyncStorage
- ✅ Mesurer les performances
- ✅ Tester les logs

### Utiliser le Logger

```javascript
import { logger } from '../utils/debugHelper';

// Dans n'importe quel composant
logger.auth('User logged in', { userId: user.uid });
logger.firestore('Loading user data...');
logger.workout('Session started', { programId, skillId });
logger.error('Failed to load', error);
logger.success('Data loaded successfully');

// Mesurer performance
logger.startTimer('loadData');
await loadData();
logger.endTimer('loadData'); // Affiche : "⚡ [PERF] loadData: 234ms"

// Inspecter un objet
logger.inspect('User Data', userData);

// Créer des sections
logger.section('🔥 Starting Firebase Operations');
```

### Debug dans VS Code

1. Ouvre le panneau **Debug** (Ctrl+Shift+D)
2. Sélectionne "Debug Android"
3. Clique sur ▶️ Play
4. Place des breakpoints dans ton code (click gauche sur le n° de ligne)
5. L'app s'arrête sur les breakpoints

### Voir les Logs en Direct

**Dans le terminal Metro :**
Tous les `console.log()` et `logger.*()` s'affichent ici

**Dans Chrome DevTools :**
1. Appuie sur `j` dans Metro
2. Ouvre la Console
3. Utilise les filtres (Info, Warning, Error)

## 📊 Catégories de Logs

Les logs sont colorés automatiquement :

- 🔐 **AUTH** : Authentification
- 🔥 **FIRESTORE** : Opérations Firestore
- 💪 **WORKOUT** : Sessions d'entraînement
- 🧭 **NAV** : Navigation
- 🌐 **API** : Appels API
- 💾 **CACHE** : Cache & Storage
- ⚡ **PERF** : Performance
- 🎨 **UI** : Rendering
- 🔴 **ERROR** : Erreurs
- 🟡 **WARNING** : Avertissements
- 🟢 **SUCCESS** : Succès
- 🔵 **DEBUG** : Debug général

## 🐛 Débugger les Bugs Connus

### Bug #1: HomeScreen Infinite Loading

**Symptôme :** L'écran reste bloqué sur "Chargement de ton profil..."

**Debug :**
1. Va dans DevDiagnostic (bouton 🔧 DEBUG)
2. Check "User Data" - Le doc existe ?
3. Check "Firestore Access" - Accessible ?
4. Regarde les logs dans Metro :
   ```
   🔵 [DEBUG] 🔄 Starting loadAllData
   📊 User stats loaded: SUCCESS
   📝 Last session loaded: Found
   💪 Active programs and queue loaded
   ✅ loadAllData completed in XXXms
   ```

**Si loadAllData ne termine jamais :**
- Check si `setLoading(false)` est appelé
- Check si une promise hang (Firestore timeout)
- Regarde le timer : `⚡ [PERF] loadAllData: XXXms`

### Bug #2: Firestore Unavailable

**Symptôme :** Erreurs `firestore/unavailable` fréquentes

**Debug :**
1. DevDiagnostic → "Test Firestore"
2. Check le message d'erreur
3. Logs dans Metro :
   ```
   🟡 [FIRESTORE] Attempt 1/3
   🔴 [ERROR] firestore/unavailable - Backend didn't respond within 10s
   ```

**Solutions :**
- Check connexion internet
- Redémarre Metro : `npx expo start --clear`
- Check Firebase Console (quotas, règles)

## 📱 Tester sur Devices

### Android Physical Device

1. **Active Developer Options** sur ton téléphone :
   - Settings → About Phone
   - Tap "Build Number" 7 fois

2. **Active USB Debugging** :
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connecte via USB**

4. **Lance l'app** :
   ```bash
   npx expo start
   # Puis appuie sur 'a' dans le terminal
   ```

### Android Emulator

1. **Ouvre Android Studio**
2. **AVD Manager** → Lance un émulateur
3. **Dans Metro**, appuie sur `a`

L'app s'installe et se lance automatiquement.

## 🔥 Hot Reload

**Fast Refresh** est activé par défaut !

- Sauvegarde un fichier → L'app se met à jour
- Si erreur → Overlay rouge avec stack trace
- Pour forcer reload : Appuie sur `r` dans Metro

## 📈 Mesurer les Performances

```javascript
import { logger } from '../utils/debugHelper';

// Dans un composant
useEffect(() => {
  logger.startTimer('ComponentMount');
  
  // Load data...
  
  logger.endTimer('ComponentMount');
}, []);

// Pour les renders
logger.count('ComponentRender'); // Compte le nombre de renders
```

## 🧪 Ajouter des Tests

Crée un fichier `*.test.js` à côté du composant :

```javascript
import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('ACCUEIL')).toBeTruthy();
  });
});
```

Run tests :
```bash
npm test
```

## 📚 Ressources

### Documentation
- [React Native](https://reactnavigation.org/)
- [Expo](https://docs.expo.dev/)
- [Firebase](https://firebase.google.com/docs)

### Extensions VS Code Recommandées
- ES7+ React/Redux/React-Native snippets
- React Native Tools
- Prettier
- ESLint
- Error Lens
- GitLens

## 🆕 Développer une Nouvelle Feature

### Workflow Recommandé

1. **Créer une branche**
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```

2. **Créer la structure**
   ```
   src/features/ma-feature/
     components/
     screens/
     services/
     hooks/
   ```

3. **Développer avec Hot Reload**
   - Édite ton code
   - Sauvegarde
   - L'app se met à jour automatiquement

4. **Ajouter des logs**
   ```javascript
   logger.debug('Ma feature loaded');
   ```

5. **Tester sur device**
   - Physical device recommandé
   - Test plusieurs scénarios
   - Check les logs

6. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: Ma nouvelle feature"
   git push origin feature/ma-nouvelle-feature
   ```

## 🚨 Si Ça Plante

### Metro Won't Start

```bash
# Kill tout
Get-Process node | Stop-Process -Force

# Clear cache
npx expo start --clear
```

### App Crashes on Load

1. Check le terminal Metro pour l'erreur
2. Va dans DevDiagnostic
3. Regarde les logs :
   ```
   🔴 [ERROR] ...
   ```

### Can't Connect to Device

```bash
# Android
adb devices  # Check si détecté
adb reverse tcp:8081 tcp:8081  # Forward le port

# Si toujours pas
npx expo start --tunnel
```

## ✅ Checklist Avant de Commit

- [ ] Code fonctionne en local
- [ ] Pas d'erreurs dans Metro
- [ ] Testé sur au moins 1 device
- [ ] Logs de debug ajoutés si nécessaire
- [ ] Pas de `console.log()` sensible (mots de passe, tokens)
- [ ] Fast Refresh marche
- [ ] Pas de warnings React

---

**Happy Coding! 🎉**

Si tu vois un bug, lance DevDiagnostic et check les logs !
