# 🎯 ProgramProgressCard - Documentation

## Vue d'ensemble

Le composant `ProgramProgressCard` affiche la progression d'un programme de fitness avec un design moderne, des statistiques détaillées et une barre de progression visuelle.

## 🎨 Design

### Structure Visuelle
```
┌─────────────────────────────────────────────────────────┐
│  [🏋️]  Street Workout                    [1,250 XP]    │
│  [80x80] Niveau 5                                       │
│         L'arbre de compétences complet...               │
│                                                         │
│  Compétences maîtrisées                                 │
│  8 / 22                                                 │
│  ████████░░░░░░░░░░  36%                               │
│                                                         │
│  [Voir l'arbre]                         [⚡ En cours]   │
└─────────────────────────────────────────────────────────┘
```

### Éléments Visuels
- **Icône programme** : Grande icône 80x80px dans container coloré
- **Header** : Nom du programme, niveau, description
- **Progression** : Stats compétences + barre de progression
- **Badge XP** : Chip avec XP formaté
- **Bouton action** : "Voir l'arbre" avec icône
- **Badge statut** : Achievement basé sur progression

## 📋 Props

```javascript
{
  program: {               // Objet programme depuis programs.json
    id: string,           // Identifiant unique
    name: string,         // Nom du programme
    icon: string,         // Emoji représentant le programme
    color: string,        // Couleur principale (hex)
    description: string   // Description courte
  },
  progress: {             // Objet progression utilisateur
    xp: number,          // XP accumulé dans ce programme
    level: number,       // Niveau atteint
    completedSkills: number,  // Nombre de compétences maîtrisées
    totalSkills: number  // Total de compétences disponibles
  },
  onPress: function       // Callback navigation (optionnel)
}
```

### Props par Défaut
```javascript
{
  program: null,          // Retourne null si pas de programme
  progress: {
    xp: 0,
    level: 0,
    completedSkills: 0,
    totalSkills: 0
  },
  onPress: undefined      // Pas de navigation si non fourni
}
```

## 🔧 Utilisation

### Import
```javascript
import ProgramProgressCard from '../components/ProgramProgressCard';
```

### Utilisation Basique
```javascript
const program = {
  id: 'street',
  name: 'Street Workout',
  icon: '🏋️',
  color: '#6C63FF',
  description: 'L\'arbre de compétences complet du calisthenics.'
};

const progress = {
  xp: 3200,
  level: 5,
  completedSkills: 8,
  totalSkills: 22
};

<ProgramProgressCard
  program={program}
  progress={progress}
  onPress={(programId) => navigation.navigate('SkillTree', { programId })}
/>
```

### Dans HomeScreen avec Données Firestore
```javascript
// Dans HomeScreen.js
{Object.keys(userStats.programs || {}).map(programId => {
  const program = programs.categories
    .flatMap(cat => cat.programs)
    .find(p => p.id === programId);
  
  const category = programs.categories.find(cat => cat.id === programId);
  const totalSkills = category?.programs?.length || 0;
  
  const progressWithTotal = {
    ...userStats.programs[programId],
    totalSkills: totalSkills
  };
  
  return (
    <ProgramProgressCard
      key={programId}
      program={{ ...program, id: programId }}
      progress={progressWithTotal}
      onPress={(id) => handleViewProgram(id)}
    />
  );
})}
```

### Avec Hook de Données
```javascript
import { useUserPrograms } from '../hooks/useUserPrograms';

const MyScreen = () => {
  const { programs: userPrograms, loading } = useUserPrograms();
  
  if (loading) return <LoadingProgramCard isLoading={true} />;
  
  return (
    <ScrollView>
      {userPrograms.map(({ program, progress }) => (
        <ProgramProgressCard
          key={program.id}
          program={program}
          progress={progress}
          onPress={handleNavigate}
        />
      ))}
    </ScrollView>
  );
};
```

## 🎨 Personnalisation des Couleurs

### Couleurs Dynamiques par Programme
Le composant utilise `program.color` pour :
- **Background card** : `color + '15'` (transparence 15%)
- **Border card** : `color + '40'` (transparence 40%)
- **Container icône** : `color + '20'` (transparence 20%)
- **Texte progression** : Couleur pleine
- **Barre de progression** : Couleur pleine
- **Bouton action** : Background couleur pleine

### Exemples de Couleurs
```javascript
const programColors = {
  street: '#6C63FF',    // Violet - Street Workout
  boxing: '#FF6B6B',    // Rouge - Boxing
  yoga: '#4CAF50',      // Vert - Yoga
  running: '#2196F3',   // Bleu - Running
  swimming: '#00BCD4',  // Cyan - Natation
  cycling: '#FF9800'    // Orange - Cyclisme
};
```

## 🔢 Calculs de Progression

### Pourcentage de Progression
```javascript
const progressPercentage = totalSkills > 0 
  ? (completedSkills / totalSkills) 
  : 0;

const progressPercentageDisplay = Math.round(progressPercentage * 100);
```

### Badges de Statut Automatiques
Le composant affiche automatiquement :
- **"⚡ En cours"** : Si `completedSkills > 0` et `< totalSkills`
- **"🏆 Complété !"** : Si `completedSkills === totalSkills`
- Pas de badge si `completedSkills === 0`

## 🎛️ Variations & Patterns

### 1. Liste Verticale (Standard)
```javascript
<ScrollView>
  {programs.map(program => (
    <ProgramProgressCard key={program.id} {...program} />
  ))}
</ScrollView>
```

### 2. Carousel Horizontal
```javascript
<FlatList
  data={programs}
  horizontal
  renderItem={({ item }) => (
    <View style={{ width: 280 }}>
      <ProgramProgressCard {...item} />
    </View>
  )}
/>
```

### 3. Grid Layout (2 colonnes)
```javascript
<View style={styles.grid}>
  {programs.map((program, index) => (
    <View key={program.id} style={styles.gridItem}>
      <ProgramProgressCard {...program} />
    </View>
  ))}
</View>

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  gridItem: {
    width: '48%',
    marginBottom: 8
  }
});
```

## 🧪 Tests & Débogage

### Composant de Test
Le fichier `ProgramProgressCardTest.js` fournit :
- **4 niveaux de progression** : Débutant → Maître
- **4 programmes différents** : Street, Boxing, Yoga, Running
- **Interface interactive** pour tester toutes les combinaisons
- **Tests de cas limites** : programme null, progression 0%, 100%
- **Debug info** avec JSON détaillé

### Cas de Test Couverts
- ✅ Tous les niveaux de progression (0% → 100%)
- ✅ Programmes avec différentes couleurs
- ✅ Props manquantes ou nulles
- ✅ Gestion des callbacks onPress
- ✅ Formatage des nombres (XP avec séparateurs)

### Debug Mode
```javascript
const ProgramProgressCard = ({ program, progress, onPress, debug = false }) => {
  if (debug) {
    console.log('ProgramProgressCard Debug:', {
      program: program?.name,
      xp: progress.xp,
      completedSkills: progress.completedSkills,
      totalSkills: progress.totalSkills,
      progressPercentage: Math.round((progress.completedSkills / progress.totalSkills) * 100)
    });
  }
  // ...
};
```

## 📱 Responsive Design

### Adaptations d'Écran
- **Mobile (< 768px)** : Card pleine largeur avec marges 16px
- **Tablet (≥ 768px)** : Possibilité de layout en grid
- **Large screens** : Carousel horizontal recommandé

### Gestion du Contenu Long
- `numberOfLines={1}` sur le nom du programme
- `numberOfLines={2}` sur la description
- Icône fixe 80x80px pour consistance
- Bouton "Voir l'arbre" toujours accessible

## 🔗 Intégrations

### Avec Migration Multi-Programmes
Compatible avec la structure post-migration :
```javascript
// Structure attendue après migration
user.programs: {
  street: {
    xp: 3200,
    level: 5,
    completedSkills: 8,
    // totalSkills calculé depuis programs.json
  }
}
```

### Avec Navigation React Navigation
```javascript
const handleProgramPress = (programId) => {
  navigation.navigate('SkillTree', { 
    programId,
    programName: program.name 
  });
};
```

### Avec Context/Redux
```javascript
import { useDispatch } from 'react-redux';
import { selectProgram } from '../store/programsSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleSelectProgram = (programId) => {
    dispatch(selectProgram(programId));
    navigation.navigate('SkillTree');
  };
  
  return (
    <ProgramProgressCard
      program={program}
      progress={progress}
      onPress={handleSelectProgram}
    />
  );
};
```

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- [ ] **Animation de progression** lors des mises à jour
- [ ] **Graphique circulaire** alternatif à la barre
- [ ] **Badges achievements** personnalisés
- [ ] **Preview des skills** au survol/long press
- [ ] **Mode compact** pour listes denses

### Améliorations UX
- [ ] **Haptic feedback** sur interaction
- [ ] **Confetti animation** pour completion 100%
- [ ] **Parallax effect** sur l'icône
- [ ] **Swipe actions** (favoris, masquer)

## 🐛 Troubleshooting

### Problèmes Courants

1. **Card ne s'affiche pas**
   - Vérifier que `program` n'est pas null
   - Console.log les props reçues

2. **Couleurs incorrectes**
   - Vérifier que `program.color` est un hex valide
   - Tester avec ProgramProgressCardTest

3. **Progression incorrecte**
   - Vérifier que `totalSkills > 0`
   - S'assurer que `completedSkills ≤ totalSkills`

4. **Navigation ne fonctionne pas**
   - Vérifier que `onPress` est bien fourni
   - Tester la callback avec console.log

### Performance
- Composant optimisé avec TouchableOpacity pour interactions fluides
- Pas de re-render si props inchangées
- Calculs légers (pourcentage, formatage XP)

---

## 📞 Support

Pour questions ou améliorations :
- Utiliser `ProgramProgressCardTest.js` pour tests interactifs
- Consulter `ProgramProgressCardExamples.js` pour patterns avancés
- Vérifier intégration dans HomeScreen.js
