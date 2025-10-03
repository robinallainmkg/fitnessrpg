# 🎯 UserHeader - Documentation

## Vue d'ensemble

Le composant `UserHeader` affiche l'en-tête utilisateur dans HomeScreen avec informations de progression, niveau global, et barre de progression vers le niveau suivant.

## 🎨 Design

### Structure Visuelle
```
┌─────────────────────────────────────────────────────┐
│  [Avatar] Robin Allain           🔥12    [XP Total] │
│           [Champion]                     [15,000]   │
│           Niveau 7                                  │
│           ████████░░ 1,200 / 2,500 XP               │
└─────────────────────────────────────────────────────┘
```

### Éléments
- **Avatar circulaire** : Initiales de l'utilisateur (60x60px)
- **Nom d'utilisateur** : Nom complet ou email
- **Badge streak** : Série de jours actifs (si > 0)
- **Chip titre** : Badge coloré selon le niveau
- **Niveau global** : "Niveau X"
- **Barre de progression** : Vers le prochain niveau
- **XP Total** : Points d'expérience accumulés

## 📋 Props

```javascript
{
  username: string,        // Nom de l'utilisateur
  globalLevel: number,     // Niveau global (0+)
  globalXP: number,        // XP total accumulé
  title: string,           // Titre utilisateur
  streak?: number          // Série de jours (optionnel)
}
```

### Props par Défaut
```javascript
{
  username: 'Utilisateur',
  globalLevel: 0,
  globalXP: 0,
  title: 'Débutant',
  streak: 0
}
```

## 🎨 Système de Couleurs des Titres

| Niveau | Titre | Couleur | Hex |
|--------|-------|---------|-----|
| 0-2 | Débutant | Gris | #9E9E9E |
| 3-6 | Guerrier | Vert | #4CAF50 |
| 7-11 | Champion | Bronze | #CD7F32 |
| 12-19 | Maître | Argent | #C0C0C0 |
| 20+ | Légende | Or | #FFD700 |

## 🔢 Calculs de Progression

### Formule XP par Niveau
```javascript
// XP requis pour atteindre le niveau N
const xpForLevel = (level) => Math.pow(level, 2) * 100;

// XP pour le prochain niveau
const nextLevelXP = Math.pow(globalLevel + 1, 2) * 100;

// Progression actuelle
const progress = (globalXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
```

### Exemples de Niveaux
| Niveau | XP Requis | XP Total | Progression |
|--------|-----------|----------|-------------|
| 1 | 100 | 100 | - |
| 2 | 400 | 500 | 300 XP |
| 5 | 2,500 | 5,500 | 900 XP |
| 10 | 10,000 | 38,500 | 2,100 XP |

## 🔧 Utilisation

### Import
```javascript
import UserHeader from '../components/UserHeader';
```

### Utilisation Basique
```javascript
<UserHeader
  username="Robin Allain"
  globalLevel={7}
  globalXP={5200}
  title="Champion"
  streak={12}
/>
```

### Avec Hook useUserHeader (Recommandé)
```javascript
import { useUserHeader } from '../hooks/useUserHeader';

const MyScreen = () => {
  const headerData = useUserHeader();
  
  return (
    <UserHeader
      username={headerData.username}
      globalLevel={headerData.globalLevel}
      globalXP={headerData.globalXP}
      title={headerData.title}
      streak={headerData.streak}
    />
  );
};
```

### Avec Context Auth Direct
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyScreen = () => {
  const { user } = useAuth();
  
  const getTitleFromLevel = (level) => {
    if (level >= 20) return "Légende";
    if (level >= 12) return "Maître";
    if (level >= 7) return "Champion";
    if (level >= 3) return "Guerrier";
    return "Débutant";
  };
  
  return (
    <UserHeader
      username={user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
      globalLevel={user?.globalLevel || 0}
      globalXP={user?.globalXP || 0}
      title={user?.title || getTitleFromLevel(user?.globalLevel || 0)}
      streak={user?.streak || 0}
    />
  );
};
```

## 🎛️ Variations & Personnalisations

### 1. Header Compact (sans streak)
```javascript
<UserHeader
  username="Alex"
  globalLevel={3}
  globalXP={1200}
  title="Guerrier"
  // streak non fourni = masqué
/>
```

### 2. Header avec Animation
```javascript
const [fadeAnim] = useState(new Animated.Value(0));

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: false
  }).start();
}, []);

return (
  <Animated.View style={{ opacity: fadeAnim }}>
    <UserHeader {...headerData} />
  </Animated.View>
);
```

### 3. Header avec Loading State
```javascript
const HeaderWithLoading = ({ isLoading, ...headerProps }) => {
  if (isLoading) {
    return (
      <Card style={styles.headerCard}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text>Chargement du profil...</Text>
        </View>
      </Card>
    );
  }
  
  return <UserHeader {...headerProps} />;
};
```

## 🧪 Tests & Débogage

### Composant de Test
Le fichier `UserHeaderTest.js` fournit :
- **6 profils prédéfinis** : Débutant → Élite
- **Interface interactive** pour tester tous les cas
- **Guide des couleurs** de titres
- **Tests de cas limites** (noms longs, valeurs extrêmes)

### Cas de Test Couverts
- ✅ Tous les niveaux de titre (Débutant → Légende)
- ✅ Noms d'utilisateur courts/longs
- ✅ Streak à 0 (masqué) et > 0 (affiché)
- ✅ Props par défaut si valeurs manquantes
- ✅ Calculs de progression précis

### Debug
```javascript
const UserHeader = ({ username, globalLevel, globalXP, title, streak, debug = false }) => {
  if (debug) {
    console.log('UserHeader Debug:', {
      username, globalLevel, globalXP, title, streak,
      nextLevelXP: Math.pow(globalLevel + 1, 2) * 100,
      progress: /* calcul progression */
    });
  }
  // ...
};
```

## 🔗 Intégrations

### Avec HomeScreen
```javascript
// Dans HomeScreen.js
import UserHeader from '../components/UserHeader';
import { useUserHeader } from '../hooks/useUserHeader';

const HomeScreen = ({ navigation }) => {
  const userHeaderData = useUserHeader();
  
  return (
    <ScrollView>
      <UserHeader {...userHeaderData} />
      {/* Reste du contenu */}
    </ScrollView>
  );
};
```

### Avec Migration Multi-Programmes
Le composant est compatible avec la nouvelle structure utilisateur post-migration :
```javascript
// Structure attendue après migration
user: {
  globalXP: 5200,
  globalLevel: 7,
  title: "Champion",
  streak: 12,
  displayName: "Robin Allain"
}
```

### Avec System de Stats
```javascript
// Intégration avec UserStatsCard
<View>
  <UserHeader {...headerData} />
  <UserStatsCard stats={user?.stats} />
</View>
```

## 📱 Responsive Design

### Adaptations Écran
- **Mobile (< 768px)** : Layout compact, texte ajusté
- **Tablet (≥ 768px)** : Espacement élargi, éléments plus grands

### Gestion des Noms Longs
- `numberOfLines={1}` sur le nom d'utilisateur
- Ellipsis automatique si débordement
- Test avec "Maximilian Christopher Anderson-Smith"

## 🎨 Customisation Avancée

### Couleurs Personnalisées
```javascript
// Modifier les couleurs de titre dans UserHeader.js
const getTitleColor = (level) => {
  if (level >= 20) return '#FF6B6B'; // Rouge custom pour Légende
  // ...
};
```

### Avatar Personnalisé
```javascript
// Remplacer initiales par image
{user?.avatar ? (
  <Image source={{ uri: user.avatar }} style={styles.avatar} />
) : (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{getInitials(username)}</Text>
  </View>
)}
```

### Layout Alternatif
```javascript
// Version verticale pour certains écrans
const isVertical = screenWidth < 400;

<View style={isVertical ? styles.verticalLayout : styles.horizontalLayout}>
  {/* Contenu adapté */}
</View>
```

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- [ ] **Animation d'XP** lors des gains
- [ ] **Avatar photo** avec upload
- [ ] **Badges achievements** dans le header
- [ ] **Graphique de progression** mini
- [ ] **Notification level up** intégrée

### Améliorations UX
- [ ] **Tap pour voir détails** de progression
- [ ] **Swipe pour voir stats** complètes  
- [ ] **Parallax scroll** effect
- [ ] **Confetti animation** pour level up

## 🐛 Troubleshooting

### Problèmes Courants

1. **Header ne s'affiche pas**
   - Vérifier que `useUserHeader()` retourne des données
   - Console.log les props reçues

2. **Progression incorrecte**
   - Vérifier les calculs d'XP avec `debug={true}`
   - Tester avec UserHeaderTest

3. **Couleurs de titre incorrectes**
   - Vérifier la fonction `getTitleColor`
   - Tester tous les niveaux avec le test component

### Performance
- Hook `useUserHeader` utilise `useMemo` pour éviter recalculs
- Animation fade only avec `useNativeDriver: false` pour compatibilité
- Pas de re-render si données utilisateur inchangées

---

## 📞 Support

Pour questions ou améliorations :
- Utiliser `UserHeaderTest.js` pour tests interactifs
- Consulter `useUserHeader.js` pour logique avancée
- Vérifier intégration dans `HomeScreen.js`
