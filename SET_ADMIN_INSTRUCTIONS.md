# Instructions pour définir un utilisateur en Admin

## Méthode 1: Via la Console Firebase (RECOMMANDÉ)

1. Ouvrir la console Firebase: https://console.firebase.google.com
2. Sélectionner ton projet: **hybridrpg-53f62**
3. Aller dans **Firestore Database**
4. Ouvrir la collection **users**
5. Trouver le document avec l'ID: **xVXl9iQC5vNZxp8SxClNcrFz0283**
6. Cliquer sur le document pour l'ouvrir
7. Cliquer sur **"Add field"** (ou éditer si le champ existe déjà)
8. Entrer:
   - **Field name**: `isAdmin`
   - **Field type**: `boolean`
   - **Field value**: `true` (cocher la case)
9. Cliquer **"Save"**

## Méthode 2: Via les Firestore Rules Playground

1. Console Firebase > Firestore Database > Rules
2. Cliquer sur l'onglet **"Rules Playground"**
3. Coller ce code dans la console:

```javascript
db.collection('users').doc('xVXl9iQC5vNZxp8SxClNcrFz0283').update({
  isAdmin: true
});
```

## Vérification

Après avoir défini le champ `isAdmin`, tu verras dans les logs de l'app:

```
LOG  👤 User phone: +33679430759 isAdmin: true
```

## Statut Admin préservé

✅ Le champ `isAdmin` est maintenant **préservé** lors de la réinitialisation du profil.

Quand tu réinitialises ton profil depuis l'écran Profil:
- ✅ Les XP sont remis à 0
- ✅ Les programmes sont réinitialisés
- ✅ Les stats sont remises à 0
- ✅ **Le champ `isAdmin` est CONSERVÉ**
- ✅ L'email et le numéro de téléphone sont conservés
