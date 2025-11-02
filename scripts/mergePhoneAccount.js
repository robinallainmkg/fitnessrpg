/**
 * Script pour fusionner un compte créé par téléphone vers un compte existant
 * 
 * Usage: node scripts/mergePhoneAccount.js <phoneAccountUid> <targetAccountUid>
 * Example: node scripts/mergePhoneAccount.js abc123 xVXl9iQC5vNZxp8SxClNcrFz0283
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const firestore = admin.firestore();
const auth = admin.auth();

async function mergeAccounts(phoneAccountUid, targetAccountUid) {
  console.log('🔄 Démarrage de la fusion des comptes...');
  console.log('📱 Compte téléphone (source):', phoneAccountUid);
  console.log('🎯 Compte cible:', targetAccountUid);
  
  try {
    // 1. Récupérer les données du compte téléphone
    console.log('\n📦 Récupération des données du compte téléphone...');
    const phoneDoc = await firestore.collection('users').doc(phoneAccountUid).get();
    
    if (!phoneDoc.exists) {
      console.error('❌ Compte téléphone introuvable!');
      return;
    }
    
    const phoneData = phoneDoc.data();
    console.log('✅ Données du compte téléphone récupérées');
    
    // 2. Récupérer le numéro de téléphone depuis Auth
    let phoneNumber = null;
    try {
      const phoneUser = await auth.getUser(phoneAccountUid);
      phoneNumber = phoneUser.phoneNumber;
      console.log('📱 Numéro de téléphone:', phoneNumber);
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer le numéro:', error.message);
    }
    
    // 3. Vérifier que le compte cible existe
    console.log('\n🎯 Vérification du compte cible...');
    const targetDoc = await firestore.collection('users').doc(targetAccountUid).get();
    
    if (!targetDoc.exists) {
      console.error('❌ Compte cible introuvable!');
      return;
    }
    
    console.log('✅ Compte cible trouvé');
    
    // 4. Fusionner les données dans le compte cible
    console.log('\n🔀 Fusion des données...');
    await firestore.collection('users').doc(targetAccountUid).set({
      phoneNumber: phoneNumber,
      isGuest: false,
      // Ajouter ici d'autres champs si nécessaire
    }, { merge: true });
    
    console.log('✅ Données fusionnées dans le compte cible');
    
    // 5. Transférer les workoutSessions
    console.log('\n💪 Transfert des workoutSessions...');
    const workoutsSnapshot = await firestore
      .collection('workoutSessions')
      .where('userId', '==', phoneAccountUid)
      .get();
    
    let workoutsCount = 0;
    const batch = firestore.batch();
    
    workoutsSnapshot.forEach(doc => {
      const ref = firestore.collection('workoutSessions').doc(doc.id);
      batch.update(ref, { userId: targetAccountUid });
      workoutsCount++;
    });
    
    if (workoutsCount > 0) {
      await batch.commit();
      console.log(`✅ ${workoutsCount} workoutSessions transférées`);
    } else {
      console.log('ℹ️ Aucune workoutSession à transférer');
    }
    
    // 6. Ajouter le numéro de téléphone au compte Auth cible (si possible)
    if (phoneNumber) {
      try {
        console.log('\n📱 Mise à jour de l\'Auth du compte cible...');
        await auth.updateUser(targetAccountUid, {
          phoneNumber: phoneNumber
        });
        console.log('✅ Numéro de téléphone ajouté au compte cible');
      } catch (authError) {
        console.warn('⚠️ Impossible de mettre à jour Auth:', authError.message);
        console.log('💡 Tu devras peut-être ajouter le numéro manuellement dans Firebase Console');
      }
    }
    
    // 7. Supprimer le compte téléphone (optionnel)
    console.log('\n🗑️ Suppression du compte téléphone...');
    console.log('⚠️ ATTENTION: Cette action est irréversible!');
    console.log('Voulez-vous vraiment supprimer le compte téléphone?');
    console.log('Pour continuer, décommentez les lignes ci-dessous dans le script.');
    
    // Décommente ces lignes pour supprimer le compte téléphone:
    // await firestore.collection('users').doc(phoneAccountUid).delete();
    // await auth.deleteUser(phoneAccountUid);
    // console.log('✅ Compte téléphone supprimé');
    
    console.log('\n🎉 Fusion terminée avec succès!');
    console.log('📝 Résumé:');
    console.log(`   - Numéro de téléphone: ${phoneNumber}`);
    console.log(`   - Workouts transférés: ${workoutsCount}`);
    console.log(`   - Compte cible: ${targetAccountUid}`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la fusion:', error);
  } finally {
    process.exit();
  }
}

// Récupérer les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('❌ Usage: node scripts/mergePhoneAccount.js <phoneAccountUid> <targetAccountUid>');
  console.error('Example: node scripts/mergePhoneAccount.js abc123 xVXl9iQC5vNZxp8SxClNcrFz0283');
  process.exit(1);
}

const [phoneAccountUid, targetAccountUid] = args;

mergeAccounts(phoneAccountUid, targetAccountUid);
