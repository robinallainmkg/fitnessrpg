# 🚀 PROCÉDURE D'EXÉCUTION - MIGRATION MULTI-PROGRAMMES

## ✅ Checklist Pré-Migration

### 1. Préparation
- [ ] Script `migrateUsers.js` créé et testé
- [ ] Interface admin mise à jour dans `ProfileScreen.js`
- [ ] Guide de migration `MIGRATION_GUIDE_v1.0.md` lu
- [ ] Script de test `testMigration.js` disponible

### 2. Vérifications
- [ ] Application fonctionne correctement
- [ ] Firebase connecté et accessible
- [ ] Compte admin configuré (`robinallainmkg@gmail.com`)
- [ ] Backup Firestore récent (optionnel)

## 📋 Étapes d'Exécution

### ÉTAPE 1 : Prévisualisation
1. Ouvrir l'application
2. Se connecter avec le compte admin
3. Aller dans **Profil** → **Outils développeur**
4. Cliquer sur **🆕 Migration Multi-Programmes v1.0**
5. Choisir **👁️ Prévisualisation**
6. **Vérifier les logs console** pour comprendre l'impact

**Résultat attendu :**
```
👁️ PRÉVISUALISATION DE LA MIGRATION
====================================
📊 Total utilisateurs: X
🔄 À migrer: Y
✅ Déjà migrés: Z
```

### ÉTAPE 2 : Migration Complète
⚠️ **ATTENTION : Action irréversible**

1. Dans le même menu, choisir **🚀 Migration Complète**
2. Confirmer l'action dans la popup
3. **Surveiller les logs console** pendant l'exécution
4. Attendre le message de succès

**Résultat attendu :**
```
📋 RÉSUMÉ DE LA MIGRATION
========================
👥 Total utilisateurs: X
✅ Migrés avec succès: Y
⏭️  Déjà migrés (ignorés): Z
❌ Erreurs: 0
📊 Taux de succès: 100%

🎉 Migration terminée avec succès !
```

### ÉTAPE 3 : Vérification Post-Migration
1. Dans le même menu, choisir **🔍 Vérification**
2. Contrôler les statistiques retournées
3. **S'assurer que tous les utilisateurs sont migrés**

**Résultat attendu :**
```
📊 Total: X
✅ Migrés: X
❌ Non migrés: 0
📈 Taux de succès: 100%
```

## 🔍 Tests de Validation

### Test 1 : Vérification Structure
Contrôler qu'un utilisateur migré contient :
```javascript
{
  globalXP: number,
  globalLevel: number,
  title: string,
  stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
  programs: {
    street: {
      xp: number,
      level: number,
      completedSkills: number,
      currentSkill: null,
      unlockedSkills: []
    }
  },
  migratedAt: Date,
  migrationVersion: "1.0"
}
```

### Test 2 : Cohérence des Données
- `globalXP` = ancienne valeur `totalXP`
- `globalLevel` = `Math.floor(Math.sqrt(globalXP / 100))`
- `programs.street.completedSkills` = nombre d'éléments dans ancien `completedPrograms`
- Tous les anciens champs préservés

### Test 3 : Interface Utilisateur
- [ ] L'application démarre sans erreur
- [ ] Les utilisateurs peuvent se connecter
- [ ] Les profils affichent les nouvelles données
- [ ] La progression fonctionne normalement

## 🚨 Gestion d'Urgence

### Si Migration Échoue Partiellement
1. Noter le nombre d'utilisateurs en erreur
2. Relancer la migration (skip automatique des déjà migrés)
3. Utiliser la vérification pour contrôler l'état

### Si Problème Majeur
```javascript
// Rollback d'urgence (à adapter selon le besoin)
const rollbackFields = {
  globalXP: firebase.firestore.FieldValue.delete(),
  globalLevel: firebase.firestore.FieldValue.delete(),
  title: firebase.firestore.FieldValue.delete(),
  stats: firebase.firestore.FieldValue.delete(),
  programs: firebase.firestore.FieldValue.delete(),
  migratedAt: firebase.firestore.FieldValue.delete(),
  migrationVersion: firebase.firestore.FieldValue.delete()
};
```

## 📊 Métriques de Succès

### Critères de Validation
- ✅ **Taux de migration** : 100% des utilisateurs
- ✅ **Temps d'exécution** : < 30 secondes pour 100 utilisateurs
- ✅ **Intégrité des données** : Aucune perte de données existantes
- ✅ **Fonctionnalité** : Application fonctionne normalement post-migration

### Logs à Conserver
1. Résumé de prévisualisation
2. Logs détaillés de migration
3. Résultats de vérification
4. Temps d'exécution

## 🎯 Post-Migration

### Actions Immédiates
- [ ] Vérifier que l'application fonctionne
- [ ] Tester quelques comptes utilisateur
- [ ] Valider l'affichage des nouvelles données
- [ ] Sauvegarder les logs de migration

### Actions à Moyen Terme
- [ ] Surveiller les erreurs utilisateur
- [ ] Implémenter l'utilisation des nouveaux champs
- [ ] Développer les fonctionnalités multi-programmes
- [ ] Ajouter le système de stats bonus

## 📞 Support & Contact

En cas de problème :
1. **Logs complets** à conserver
2. **État exact** avant/après migration
3. **Erreurs spécifiques** rencontrées
4. **Nombre d'utilisateurs** affectés

---

**⚠️ RAPPEL IMPORTANT :**
Cette migration est conçue pour être **sûre et réversible**. Elle préserve toutes les données existantes et peut être exécutée plusieurs fois sans risque.
