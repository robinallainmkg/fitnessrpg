# 🚀 GUIDE DE MIGRATION MULTI-PROGRAMMES v1.0

## Vue d'ensemble

Ce guide décrit l'utilisation du nouveau script de migration `migrateUsers.js` pour migrer les utilisateurs existants vers la structure multi-programmes avec système de stats.

## 📋 Fonctionnalités

### 1. Prévisualisation (`previewMigration()`)
- **Objectif** : Analyser les utilisateurs sans les modifier
- **Utilisation** : Vérifier combien d'utilisateurs seront affectés
- **Sortie** : Log détaillé de chaque utilisateur à migrer

### 2. Migration Complète (`migrateAllUsers()`)
- **Objectif** : Migrer tous les utilisateurs non-migrés
- **Utilisation** : Exécution unique de la migration
- **Sécurité** : Skip automatique des utilisateurs déjà migrés

### 3. Vérification (`verifyMigration()`)
- **Objectif** : Contrôler l'état post-migration
- **Utilisation** : Vérifier le succès de la migration
- **Sortie** : Statistiques de migration

## 🎯 Structure de Migration

### Nouveaux Champs Ajoutés

```javascript
{
  // Progression globale
  globalXP: number,           // XP total de l'utilisateur
  globalLevel: number,        // Niveau calculé depuis globalXP
  title: string,              // Titre basé sur le niveau

  // Système de stats
  stats: {
    strength: 0,
    endurance: 0,
    power: 0,
    speed: 0,
    flexibility: 0
  },

  // Structure multi-programmes
  programs: {
    street: {
      xp: number,             // XP du programme Street Workout
      level: number,          // Niveau du programme
      completedSkills: number, // Nombre de compétences complétées
      currentSkill: string,   // Compétence actuelle (null si aucune)
      unlockedSkills: []      // Liste des compétences débloquées
    }
  },

  // Métadonnées de migration
  migratedAt: Date,
  migrationVersion: "1.0"
}
```

### Calculs de Migration

- **globalXP** = `user.totalXP || 0`
- **globalLevel** = `Math.floor(Math.sqrt(globalXP / 100))`
- **title** = Basé sur le niveau global :
  - 0-2 : "Débutant"
  - 3-6 : "Guerrier"
  - 7-11 : "Champion"
  - 12-19 : "Maître"
  - 20+ : "Légende"
- **programs.street.completedSkills** = `user.completedPrograms?.length || 0`

## 🔧 Instructions d'Exécution

### Option 1 : Via l'Interface Admin (Recommandé)
1. Connectez-vous avec le compte admin (`robinallainmkg@gmail.com`)
2. Allez dans **Profil** → **Outils développeur**
3. Appuyez sur **🆕 Migration Multi-Programmes v1.0**
4. Choisir l'action :
   - **👁️ Prévisualisation** : Analyser sans modifier
   - **🔍 Vérification** : Contrôler l'état actuel
   - **🚀 Migration Complète** : Exécuter la migration

### Option 2 : Via Console (Développement)
```javascript
import { migrateAllUsers, verifyMigration, previewMigration } from './src/utils/migrateUsers';

// Prévisualisation
await previewMigration();

// Migration complète
await migrateAllUsers();

// Vérification
await verifyMigration();
```

## ✅ Vérification Post-Migration

### 1. Contrôle Automatique
Le script affiche automatiquement un résumé :
```
📋 RÉSUMÉ DE LA MIGRATION
========================
👥 Total utilisateurs: X
✅ Migrés avec succès: Y
⏭️  Déjà migrés (ignorés): Z
❌ Erreurs: 0
📊 Taux de succès: 100%
```

### 2. Vérification Manuelle
Utiliser la fonction `verifyMigration()` pour :
- Compter les utilisateurs migrés
- Vérifier la structure des nouveaux champs
- Identifier les utilisateurs non-migrés

### 3. Contrôle Firestore
```javascript
// Vérifier un utilisateur spécifique
const userDoc = await getDoc(doc(db, 'users', 'userId'));
const userData = userDoc.data();

console.log('Migration version:', userData.migrationVersion);
console.log('Global XP:', userData.globalXP);
console.log('Stats:', userData.stats);
console.log('Programs:', userData.programs);
```

## 🛡️ Sécurités Implementées

### 1. Protection Contre Double Migration
- Vérification du champ `migratedAt`
- Skip automatique des utilisateurs déjà migrés

### 2. Préservation des Données
- Utilisation d'`updateDoc()` au lieu de `setDoc()`
- Conservation de tous les champs existants

### 3. Gestion d'Erreurs
- Try/catch pour chaque utilisateur
- Logs détaillés des succès/échecs
- Continuation même en cas d'erreur individuelle

### 4. Limitation de Débit
- Pause de 100ms entre chaque utilisateur
- Évite la surcharge de Firestore

## 📊 Logs de Migration

### Format des Logs
```
🔄 Migration de l'utilisateur: user@example.com
   - XP Global: 500 (Level 2)
   - Titre: Débutant
   - Compétences complétées: 3
✅ Utilisateur migré: user@example.com
```

### Résumé Final
```
🎉 Migration terminée avec succès !
📊 Total utilisateurs: 10
✅ Migrés avec succès: 8
⏭️  Déjà migrés (ignorés): 2
❌ Erreurs: 0
```

## ⚠️ Points d'Attention

1. **Exécution Unique** : Cette migration ne doit être exécutée qu'une seule fois
2. **Sauvegarde** : Optionnelle car la migration préserve toutes les données
3. **Tests** : Utiliser la prévisualisation avant la migration complète
4. **Monitoring** : Surveiller les logs pendant la migration

## 🔄 Rollback (si nécessaire)

Si un rollback est nécessaire, supprimer les champs ajoutés :
```javascript
const fieldsToRemove = {
  globalXP: firebase.firestore.FieldValue.delete(),
  globalLevel: firebase.firestore.FieldValue.delete(),
  title: firebase.firestore.FieldValue.delete(),
  stats: firebase.firestore.FieldValue.delete(),
  programs: firebase.firestore.FieldValue.delete(),
  migratedAt: firebase.firestore.FieldValue.delete(),
  migrationVersion: firebase.firestore.FieldValue.delete()
};

await updateDoc(userRef, fieldsToRemove);
```

---

## 📞 Support

En cas de problème :
1. Vérifier les logs de la console
2. Utiliser la fonction de vérification
3. Contacter l'équipe développement avec les logs d'erreur
