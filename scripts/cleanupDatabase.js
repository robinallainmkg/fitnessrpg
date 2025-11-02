const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function cleanupDatabase() {
  try {
    const keepUid = 'xVXl9iQC5vNZxp8SxClNcrFz0283'; // Obi Way
    
    console.log('🔍 1. Vérification des daily challenges pour Obi Way...\n');
    
    // Vérifier daily challenges sans orderBy
    const challengesSnapshot = await db.collection('dailyChallenges')
      .where('userId', '==', keepUid)
      .get();
    
    console.log(`📊 Daily challenges trouvés: ${challengesSnapshot.size}\n`);
    
    if (challengesSnapshot.size > 0) {
      challengesSnapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        console.log(`📅 Challenge:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Date: ${date.toLocaleDateString('fr-FR')}`);
        console.log(`   Type: ${data.challengeType}`);
        console.log(`   Soumis: ${data.submitted ? 'Oui' : 'Non'}`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('\n🗑️ 2. Nettoyage des utilisateurs...\n');
    
    // Lister tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    const toDelete = [];
    
    usersSnapshot.forEach(doc => {
      if (doc.id !== keepUid) {
        toDelete.push(doc.id);
      }
    });
    
    console.log(`📊 Utilisateurs à garder: 1 (Obi Way)`);
    console.log(`📊 Utilisateurs à supprimer: ${toDelete.length}\n`);
    
    if (toDelete.length > 0) {
      console.log('🗑️ Suppression des utilisateurs de Firestore...');
      
      const batch = db.batch();
      for (const uid of toDelete) {
        batch.delete(db.collection('users').doc(uid));
      }
      await batch.commit();
      console.log(`✅ ${toDelete.length} utilisateurs supprimés de Firestore\n`);
      
      console.log('🗑️ Suppression des comptes Firebase Auth...');
      let authDeletedCount = 0;
      for (const uid of toDelete) {
        try {
          await auth.deleteUser(uid);
          authDeletedCount++;
        } catch (error) {
          console.log(`   ⚠️ Impossible de supprimer ${uid} de Auth: ${error.message}`);
        }
      }
      console.log(`✅ ${authDeletedCount} comptes supprimés de Firebase Auth\n`);
    }
    
    console.log('✅ Nettoyage terminé!\n');
    
    // Vérifier le résultat final
    const finalUsers = await db.collection('users').get();
    console.log(`📊 Utilisateurs restants: ${finalUsers.size}`);
    finalUsers.forEach(doc => {
      const data = doc.data();
      console.log(`   👤 ${data.displayName || 'N/A'} (${doc.id})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

cleanupDatabase();
