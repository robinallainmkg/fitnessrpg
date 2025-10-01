# Guide de Complétion des Programmes

## Modifications apportées au WorkoutContext

### Nouvelle logique de complétion

La fonction `completeWorkout()` a été améliorée pour gérer :

1. **Validation de niveau standard** (score >= 800, niveau 1-5)
   - Met à jour la progression normale
   - Déverrouille le niveau suivant
   - Ajoute les XP de base

2. **Complétion de programme** (score >= 800, niveau 6)
   - Marque le programme comme terminé (`currentLevel = 7`)
   - Ajoute le programme aux `completedPrograms` de l'utilisateur
   - Incrémente `totalCompletedPrograms`
   - Ajoute un bonus XP de 500 points
   - Déverrouille automatiquement les programmes suivants

### Retour de la fonction

```javascript
return {
  sessionId: string,
  score: number,
  levelCompleted: boolean,
  programCompleted: boolean,
  unlockedPrograms: string[] // Noms des programmes débloqués
}
```

### Exemple d'utilisation dans WorkoutSummaryScreen

```javascript
const handleCompleteWorkout = async () => {
  try {
    const result = await completeWorkout();
    
    if (result.programCompleted) {
      // Afficher message de félicitations
      Alert.alert(
        "🎉 Programme Terminé !",
        `Félicitations ! Vous avez terminé ${program.name} !
        ${result.unlockedPrograms.length > 0 ? 
          `\n🔓 Programmes débloqués :\n${result.unlockedPrograms.join('\n')}` : 
          ''}`
      );
    } else if (result.levelCompleted) {
      // Message niveau validé
      Alert.alert("✅ Niveau Validé !", "Bravo ! Niveau suivant débloqué.");
    }
    
    navigation.navigate('WorkoutSummary', { 
      ...result,
      program,
      level 
    });
  } catch (error) {
    Alert.alert("Erreur", "Impossible de sauvegarder la séance");
  }
};
```

### Structure des données Firestore

#### Collection `userProgress`
```javascript
{
  userId: string,
  programId: string,
  currentLevel: number, // 7 = programme terminé
  unlockedLevels: number[],
  completedLevels: number[],
  totalSessions: number,
  completedAt?: timestamp, // Ajouté à la complétion
  unlockedAt?: timestamp,  // Pour les programmes débloqués
  createdAt: timestamp
}
```

#### Collection `users`
```javascript
{
  completedPrograms: string[], // IDs des programmes terminés
  totalCompletedPrograms: number,
  totalXP: number, // Inclut les bonus de complétion
  lastXPUpdate: timestamp
}
```

### Système de déverrouillage

Les programmes sont déverrouillés automatiquement selon le champ `unlocks` :

```json
{
  "id": "muscleup",
  "name": "Muscle-Up Master",
  "unlocks": ["human-flag", "one-arm-pullup"]
}
```

Quand "Muscle-Up Master" est terminé :
1. Créer `userProgress` pour "human-flag" et "one-arm-pullup"
2. Les marquer comme disponibles (currentLevel: 1, unlockedLevels: [1])
3. Retourner leurs noms pour affichage

### Gestion des erreurs

- Try/catch global pour la fonction completeWorkout
- Try/catch spécifique pour chaque déverrouillage
- Logs détaillés pour le débogage
- L'échec d'un déverrouillage n'interrompt pas les autres
