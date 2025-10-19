# Guide de Développement Local - Hybrid RPG

## 🚀 Démarrage Rapide

### Lancer l'app en développement
```bash
npx expo start --clear
```

Options utiles :
- `--clear` : Vide le cache Metro (recommandé après gros changements)
- `--dev-client` : Force l'utilisation du development build
- `--android` : Lance directement sur émulateur Android
- `--no-dev` : Mode production local (pour tester perf)

### Scanner le QR Code
- **Android** : Utilise l'app Expo Go ou ton development build
- **Web** : Appuie sur `w` dans le terminal

## 🔧 Outils de Debug Disponibles

### 1. **React Developer Tools** (RECOMMANDÉ)

Installation globale :
```bash
npm install -g react-devtools
```

Lancer :
```bash
npx react-devtools
```

Features :
- ⚛️ Inspecter l'arbre de composants React
- 📊 Voir les props et state en temps réel
- 🔍 Profiler les performances
- 🎯 Identifier les re-renders inutiles

### 2. **Remote Debugging avec Chrome**

Dans le terminal Metro, appuie sur `j` pour ouvrir le debugger.

Features :
- 🐛 Breakpoints dans le code
- 📝 Console.log visible
- 🌐 Network tab pour voir les requêtes
- 💾 Redux DevTools (si on ajoute Redux)

### 3. **Flipper** (Debug Native + React)

Installation :
1. Télécharge Flipper : https://fbflipper.com/
2. Lance Flipper
3. L'app se connecte automatiquement

Features :
- 📱 Layout inspector
- 🌐 Network inspector
- 💾 Databases inspector (AsyncStorage, SQLite)
- 📊 Performance monitoring
- 🔥 Hermes debugger

### 4. **VS Code Debugging**

On peut debug directement dans VS Code ! Je vais créer la config :

## 📝 Logging Stratégique

### Niveaux de logs recommandés

```javascript
// Pour le développement
if (__DEV__) {
  console.log('[DEBUG]', 'Message de debug');
}

// Pour tracker le flow
console.log('🔵 [AUTH]', 'User logged in:', userId);
console.log('🟢 [WORKOUT]', 'Session started:', sessionId);
console.log('🟡 [FIRESTORE]', 'Fetching data...');

// Pour les erreurs
console.error('🔴 [ERROR]', 'Failed to load:', error);

// Pour les warnings
console.warn('🟠 [WARNING]', 'Deprecated function used');
```

### Logger automatique pour Firestore

Créons un wrapper de debug pour Firestore :

## 🧪 Tests en Local

### Test sur Android Physical Device
1. Active le mode développeur sur ton téléphone
2. Active le débogage USB
3. Connecte via USB
4. Dans terminal Metro, appuie sur `a`

### Test sur Android Emulator
1. Ouvre Android Studio
2. Lance un AVD (Android Virtual Device)
3. Dans terminal Metro, appuie sur `a`

### Test sur Web
- Appuie sur `w` dans le terminal Metro
- Ouvre http://localhost:8081
- ⚠️ Certaines features native ne marchent pas sur web

## 🔥 Hot Reload & Fast Refresh

**Fast Refresh** est activé par défaut !

- Sauvegarde un fichier → L'app se met à jour instantanément
- Préserve le state des composants
- Si ça plante, appuie sur `r` pour reload

**Force Reload :**
- Terminal : Appuie sur `r`
- Dans l'app : Secoue le téléphone → "Reload"

## 📊 Performance Monitoring

### Mesurer les performances

```javascript
// Dans n'importe quel composant
import { PerformanceObserver } from 'react-native';

// Mesurer le temps de rendu
console.time('HomeScreen render');
// ... code ...
console.timeEnd('HomeScreen render');
```

### React Profiler

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id, // "HomeScreen"
  phase, // "mount" ou "update"
  actualDuration, // Temps de rendu
  baseDuration, // Temps estimé sans memo
) {
  console.log(`${id} took ${actualDuration}ms`);
}

<Profiler id="HomeScreen" onRender={onRenderCallback}>
  <HomeScreen />
</Profiler>
```

## 🐛 Debug des Bugs Connus

### Bug #1: HomeScreen Infinite Loading

Ajouter des logs :
```javascript
// Dans HomeScreen.js, fonction loadAllData()
console.log('🔵 [HOME] Starting loadAllData');

const userStatsData = await loadUserStats();
console.log('🔵 [HOME] userStatsData:', userStatsData ? 'loaded' : 'null');

const lastSessionData = await loadLastSession();
console.log('🔵 [HOME] lastSessionData:', lastSessionData ? 'loaded' : 'null');

setLoading(false);
console.log('🟢 [HOME] Loading complete');
```

### Bug #2: Firestore Unavailable

Ajouter retry logs :
```javascript
// Dans firestoreRetry.js
console.log(`🟡 [FIRESTORE] Attempt ${attempt}/${maxRetries}`);
console.log(`🔴 [FIRESTORE] Error: ${error.code} - ${error.message}`);
```

## 🔍 Inspecter Firestore

### Voir les données en temps réel

```javascript
// Créer un screen de diagnostic
import { collection, getDocs } from 'firebase/firestore';

const DiagnosticScreen = () => {
  const [data, setData] = useState(null);
  
  const checkFirestore = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      console.log('📊 Total users:', snapshot.size);
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
      setData(snapshot.docs.map(d => d.data()));
    } catch (error) {
      console.error('🔴 Firestore error:', error);
    }
  };
  
  return (
    <View>
      <Button title="Check Firestore" onPress={checkFirestore} />
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
};
```

## 📱 Debug Menu In-App

React Native a un menu de debug intégré :

**Ouvrir le menu :**
- Android Physical : Secouer le téléphone
- Android Emulator : `Ctrl+M` (Windows) ou `Cmd+M` (Mac)
- iOS Simulator : `Cmd+D`

**Options disponibles :**
- Reload
- Debug with Chrome
- Show Perf Monitor
- Show Inspector
- Enable Fast Refresh
- Enable Remote JS Debugging

## 🎯 Workflow de Développement Recommandé

### 1. **Feature Branch**
```bash
git checkout -b feature/nouvelle-feature
```

### 2. **Développement avec Hot Reload**
- Édite le code
- Sauvegarde
- L'app se met à jour automatiquement
- Teste

### 3. **Debug si problème**
- Ajoute des `console.log`
- Utilise React DevTools
- Inspecte avec Flipper
- Check les erreurs dans Metro terminal

### 4. **Test sur plusieurs devices**
- Émulateur Android (API 28, 30, 33)
- Téléphone physique
- Web (si applicable)

### 5. **Commit & Push**
```bash
git add .
git commit -m "feat: Description de la feature"
git push origin feature/nouvelle-feature
```

## 🚨 Commandes de Secours

### Si l'app ne démarre pas

```bash
# 1. Clear tout
npx expo start --clear

# 2. Si ça marche toujours pas
rm -rf node_modules
npm install
npx expo start --clear

# 3. Si VRAIMENT ça marche pas
npx expo prebuild --clean
npx expo start --clear
```

### Si Metro est bloqué

```bash
# Tuer tous les process Metro
# Windows PowerShell :
Get-Process node | Stop-Process -Force

# Puis relancer
npx expo start --clear
```

### Si le cache est corrompu

```bash
# Clear cache npm
npm cache clean --force

# Clear cache Expo
npx expo start --clear

# Clear cache Android (si build natif)
cd android
.\gradlew clean
cd ..
```

## 📚 Resources Utiles

### Documentation
- React Native : https://reactnavigation.org/
- Expo : https://docs.expo.dev/
- Firebase : https://firebase.google.com/docs

### Debugging
- React DevTools : https://react-devtools-tutorial.vercel.app/
- Flipper : https://fbflipper.com/docs/features/
- Chrome DevTools : https://developer.chrome.com/docs/devtools/

### Extensions VS Code Recommandées
- ES7+ React/Redux/React-Native snippets
- React Native Tools
- Prettier - Code formatter
- ESLint
- Error Lens (affiche les erreurs inline)
- GitLens (pour voir l'historique Git)

## 🎨 Développer de Nouvelles Features

### Template de Feature

Exemple : Ajouter un système de notifications

1. **Créer la structure**
```
src/
  features/
    notifications/
      components/
        NotificationCard.js
      screens/
        NotificationsScreen.js
      services/
        notificationService.js
      hooks/
        useNotifications.js
```

2. **Service (logic métier)**
```javascript
// notificationService.js
export const sendNotification = async (userId, message) => {
  // Logic
};
```

3. **Hook (état réactif)**
```javascript
// useNotifications.js
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  // Logic
  return { notifications };
};
```

4. **Composant (UI)**
```javascript
// NotificationCard.js
export const NotificationCard = ({ notification }) => {
  return <View>...</View>;
};
```

5. **Screen (intégration)**
```javascript
// NotificationsScreen.js
export const NotificationsScreen = () => {
  const { notifications } = useNotifications();
  return <FlatList data={notifications} ... />;
};
```

6. **Ajouter à la navigation**
```javascript
// Navigation.js
<Stack.Screen name="Notifications" component={NotificationsScreen} />
```

---

**Happy Coding! 🚀**

Besoin d'aide ? Ajoute des logs et check le terminal Metro !
