# Fix AuthContext - Abandon du compte guest lors du login par téléphone

## Problème
Quand un utilisateur guest se connecte avec un numéro de téléphone qui existe déjà sur un autre compte, le code actuel essaie de fusionner les deux comptes. Mais on veut **abandonner le compte guest** et garder UNIQUEMENT les données du compte principal.

## Solution

Dans `src/contexts/AuthContext.js`, fonction `verifyCode`, section `if (linkError?.code === 'auth/credential-already-in-use')`:

### Code actuel (à remplacer)
Le code actuel (lignes ~254-412) récupère les données du guest, fusionne avec le compte existant, transfère les workouts, etc.

### Nouveau code (simplifié)
```javascript
if (linkError?.code === 'auth/credential-already-in-use') {
  log('⚠️ Numéro déjà utilisé - Abandon du compte guest et connexion au compte principal...');
  
  const guestUid = currentUser.uid;
  log('🗑️ UID guest à abandonner:', guestUid);
  
  // Se déconnecter du compte anonymous (guest)
  await auth.signOut();
  
  // Se connecter avec le numéro existant (compte principal)
  const userCredential = await confirmation.confirm(code);
  const existingUser = userCredential.user;
  const existingUid = existingUser.uid;
  
  log('✅ Connecté au compte principal existant:', existingUid);
  
  // Récupérer les données du compte existant
  const existingDoc = await firestore.collection('users').doc(existingUid).get();
  const existingData = existingDoc.exists ? existingDoc.data() : {};
  
  log('📊 Compte principal - XP:', existingData.globalXP || 0);
  log('📊 Compte principal - Programmes:', Object.keys(existingData.programs || {}).join(', ') || 'Aucun');
  log('✅ Connexion au compte principal réussie - Données du guest abandonnées');
  
  // ⚠️ IMPORTANT: On garde UNIQUEMENT les données du compte principal
  // Le compte guest est simplement abandonné (sera nettoyé automatiquement par Firebase)
  
  setIsGuest(false);
  
  return { 
    success: true, 
    user: existingUser,
    message: `✅ Connecté au compte principal!`
  };
}
```

## Avantages
- ✅ Plus simple - pas de fusion complexe
- ✅ Pas de risque de corruption de données
- ✅ Le compte principal garde 100% de ses données
- ✅ Pas besoin de transférer les workouts/challenges
- ✅ Comportement prévisible et fiable

## Note importante
Le compte guest sera automatiquement supprimé par Firebase après quelques jours d'inactivité. Si tu veux le supprimer immédiatement, tu peux ajouter un cleanup avec `auth.deleteUser(guestUid)` mais ce n'est pas nécessaire.
