# 🎯 Modifications HomeScreen - Guide d'implémentation

## ✅ État actuel

L'activation automatique des programmes est **DÉJÀ EN PLACE** dans `ProgramSelectionScreen.js` ligne 92 :
```javascript
activePrograms: selectedPrograms.slice(0, 2)
```

## 🔄 Modifications nécessaires

### 1. Supprimer le bouton "Gérer" / "Activer un programme"

**Fichier** : `src/screens/HomeScreen.js`  
**Lignes** : Autour de 664-695

**Action** : Supprimer toute la section conditionnelle qui affiche le bouton "Gérer" ou "Activer un programme".

### 2. Simplifier l'affichage des programmes actifs

Au lieu d'utiliser `ActiveProgramCard` qui est verbose, utiliser une version compacte avec juste :
- Nom + emoji
- Progression (X compétences débloquées)

### 3. Déplacer UserStatsCard vers ProfileScreen

**Remove from** : `src/screens/HomeScreen.js` ligne ~659
```javascript
{/* Stats utilisateur */}
<UserStatsCard stats={userStats.stats} />
```

**Add to** : `src/screens/ProfileScreen.js`

### 4. Ajouter la section "Dernières séances"

Après la section "Prochaines séances disponibles", ajouter :

```javascript
{/* Dernières séances complétées */}
{lastCompletedSessions.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Dernières séances 📜</Text>
    {lastCompletedSessions.map(session => (
      <CompletedSessionItem key={session.id} session={session} />
    ))}
  </View>
)}
```

### 5. Utiliser le service corrigé

Le service `sessionQueueService.js` doit être complètement réécrit pour utiliser la structure correcte:
- Programme → Compétence → Niveau → Séance
- Pas de "semaine" ou "week"
- Utiliser `generateAvailableSessions()` au lieu de `generateSessionQueue()`

### 6. Profil utilisateur compact

Réduire le `UserHeader` pour qu'il prenne moins d'espace :
- Nom + niveau sur une ligne
- Barre XP en dessous
- Badge/titre optionnel

## 📐 Structure visuelle finale

```
┌─────────────────────────────┐
│ 👤 Robin • Niv. 5 • Warrior │
│ ████████░░ 80/100 XP        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Mes programmes actifs ⚡     │
│ 🏋️ Street • 3 compétences    │
│ 🤸 Calisthenics • 1 compét.  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Séances recommandées 🎯     │
│ [Squat - Niveau 1] Commencer│
│ [Pull-up - Niveau 1] Comm...│
│ [Handstand - Niv. 1] Comm...│
└─────────────────────────────┘

┌─────────────────────────────┐
│ Dernières séances 📜         │
│ Squat Niveau 1 • +100 XP    │
│   Il y a 2 jours            │
│ ─────────────────────────── │
│ Push-up Niveau 2 • +150 XP  │
│   Il y a 5 jours            │
└─────────────────────────────┘

[Accueil] [Progression] [Profil]
```

## 🎨 Composants à créer/modifier

### CompletedSessionItem (nouveau)

```javascript
const CompletedSessionItem = ({ session }) => (
  <View style={styles.completedItem}>
    <View style={styles.completedInfo}>
      <Text style={styles.completedName}>{session.name}</Text>
      <Text style={styles.completedDate}>
        {formatRelativeDate(session.completedAt)}
      </Text>
    </View>
    <Chip mode="flat">
      +{session.xpGained} XP
    </Chip>
  </View>
);
```

### CompactProgramCard (nouveau)

```javascript
const CompactProgramCard = ({ program }) => (
  <TouchableOpacity style={styles.compactCard}>
    <Text style={styles.programEmoji}>{program.icon}</Text>
    <View style={styles.compactInfo}>
      <Text style={styles.compactName}>{program.name}</Text>
      <Text style={styles.compactProgress}>
        {program.completedSkills} compétences débloquées
      </Text>
    </View>
  </TouchableOpacity>
);
```

## ⚠️ Points d'attention

1. **Supprimer ManageActiveProgramsScreen** car plus nécessaire
2. **Supprimer activeProgramsService.js** car activation automatique uniquement
3. **Garder sessionQueueService.js** mais le simplifier
4. **Le scroll doit disparaître** - tout visible d'un coup sur mobile standard

## 📊 Modèle de données mis à jour

```javascript
// Firestore: users/{userId}
{
  activePrograms: ['street', 'calisthenics'], // Auto-activés à la sélection
  selectedPrograms: ['street', 'calisthenics'], // Tous les programmes choisis
  programs: {
    street: {
      xp: 350,
      completedSessions: ['street-squat-level1', 'street-squat-level2'],
      completedSkills: 3
    }
  },
  sessionHistory: [
    {
      id: 'street-squat-level1',
      name: 'Squat - Niveau 1',
      completedAt: '2025-10-01T10:30:00Z',
      xpGained: 100
    }
  ]
}
```

## 🚀 Ordre d'implémentation recommandé

1. ✅ **Déjà fait** : Activation automatique dans ProgramSelectionScreen
2. **Simplifier** sessionQueueService.js (utiliser structure correcte)
3. **Créer** CompactProgramCard
4. **Créer** CompletedSessionItem  
5. **Modifier** HomeScreen (supprimer boutons, réorganiser sections)
6. **Déplacer** stats vers ProfileScreen
7. **Tester** le flow complet

---

**Note** : L'activation automatique fonctionne déjà ! Il reste juste à nettoyer l'UI et supprimer les étapes inutiles.
