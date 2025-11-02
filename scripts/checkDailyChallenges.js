const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkDailyChallenges() {
  try {
    console.log('🔍 Vérification des utilisateurs et daily challenges...\n');
    
    // Lister tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Nombre total d'utilisateurs: ${usersSnapshot.size}\n`);
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 UID: ${doc.id}`);
      console.log(`   Nom: ${data.displayName || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Téléphone: ${data.phoneNumber || 'N/A'}`);
      console.log(`   XP: ${data.globalXP || 0}`);
      console.log('');
    });
    
    // Vérifier les daily challenges pour Obi Way
    const obiWayUid = 'xVXl9iQC5vNZxp8SxClNcrFz0283';
    console.log(`\n🔍 Vérification des daily challenges pour Obi Way (${obiWayUid})...\n`);
    
    const challengesSnapshot = await db.collection('dailyChallenges')
      .where('userId', '==', obiWayUid)
      .orderBy('date', 'desc')
      .limit(10)
      .get();
    
    console.log(`📊 Nombre de daily challenges: ${challengesSnapshot.size}\n`);
    
    challengesSnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      console.log(`📅 Challenge ID: ${doc.id}`);
      console.log(`   Date: ${date.toLocaleDateString('fr-FR')}`);
      console.log(`   Type: ${data.challengeType}`);
      console.log(`   Soumis: ${data.submitted ? 'Oui' : 'Non'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkDailyChallenges();
