/**
 * Script de debug pour vérifier les données de l'admin
 * Usage: node debug-admin-account.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialiser Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function debugAdminAccount() {
  console.log('🔍 Debug Admin Account\n');
  
  // Demander le numéro de téléphone
  rl.question('Numéro de téléphone admin (ex: +33612345678): ', async (phoneNumber) => {
    try {
      console.log(`\n📞 Recherche utilisateur: ${phoneNumber}`);
      
      // 1. Vérifier Firebase Auth
      console.log('\n1️⃣ Firebase Auth');
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
        console.log('✅ Compte trouvé');
        console.log('   UID:', userRecord.uid);
        console.log('   Phone:', userRecord.phoneNumber);
        console.log('   Créé:', new Date(userRecord.metadata.creationTime).toLocaleString());
        console.log('   Dernière connexion:', new Date(userRecord.metadata.lastSignInTime).toLocaleString());
      } catch (authError) {
        console.log('❌ Compte non trouvé dans Auth:', authError.message);
        rl.close();
        process.exit(1);
      }
      
      const userId = userRecord.uid;
      
      // 2. Vérifier Firestore users/{uid}
      console.log('\n2️⃣ Firestore users/' + userId);
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('✅ Document trouvé');
        console.log('   Display Name:', userData.displayName || '(vide)');
        console.log('   Global XP:', userData.totalXP || userData.globalXP || 0);
        console.log('   Global Level:', userData.globalLevel || 0);
        console.log('   Streak:', userData.streak || 0);
        console.log('   Active Programs:', userData.activePrograms || []);
        console.log('   Selected Programs:', userData.selectedPrograms || []);
        console.log('   Programs:', JSON.stringify(userData.programs || {}, null, 2));
        console.log('   isAdmin:', userData.isAdmin || false);
      } else {
        console.log('❌ Document users/' + userId + ' n\'existe pas');
        console.log('⚠️  C\'est le problème ! L\'app ne peut pas charger les données.');
        
        // Créer le document
        rl.question('\nCréer le document users/' + userId + ' ? (o/n): ', async (answer) => {
          if (answer.toLowerCase() === 'o') {
            await db.collection('users').doc(userId).set({
              displayName: 'Admin',
              phoneNumber: phoneNumber,
              totalXP: 0,
              globalXP: 0,
              globalLevel: 0,
              level: 1,
              completedPrograms: [],
              activePrograms: [],
              selectedPrograms: [],
              programs: {},
              userProgress: {},
              streak: 0,
              lastWorkoutDate: null,
              avatarId: 0,
              isAdmin: true,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Document créé !');
          }
          rl.close();
        });
        return;
      }
      
      // 3. Vérifier workoutSessions
      console.log('\n3️⃣ Workout Sessions');
      const workoutsSnapshot = await db.collection('workoutSessions')
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc')
        .limit(5)
        .get();
      
      console.log(`   Total: ${workoutsSnapshot.size} séances trouvées`);
      if (workoutsSnapshot.size > 0) {
        console.log('   Dernières séances:');
        workoutsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. ${data.programId} - ${new Date(data.completedAt?.toDate()).toLocaleDateString()}`);
        });
      } else {
        console.log('   ⚠️  Aucune séance trouvée');
      }
      
      // 4. Vérifier sessionQueue
      console.log('\n4️⃣ Session Queue');
      const queueSnapshot = await db.collection('sessionQueue')
        .where('userId', '==', userId)
        .get();
      
      console.log(`   Total: ${queueSnapshot.size} sessions en queue`);
      if (queueSnapshot.size > 0) {
        queueSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. ${data.programId} - ${data.sessionId}`);
        });
      } else {
        console.log('   ⚠️  Queue vide - c\'est normal si aucun programme n\'est actif');
      }
      
      // 5. Vérifier dailyChallenges d'aujourd'hui
      console.log('\n5️⃣ Daily Challenge');
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const challengeDoc = await db.collection('dailyChallenges')
        .doc(today)
        .collection('users')
        .doc(userId)
        .get();
      
      if (challengeDoc.exists) {
        const challengeData = challengeDoc.data();
        console.log('✅ Challenge du jour trouvé');
        console.log('   Type:', challengeData.challengeType);
        console.log('   Status:', challengeData.status);
        console.log('   Submitted:', challengeData.submitted || false);
      } else {
        console.log('   ⚠️  Pas de challenge du jour');
        console.log('   Vérifier que ChallengeContext.loadTodayChallenge() s\'exécute');
      }
      
      // 6. Résumé
      console.log('\n' + '═'.repeat(60));
      console.log('📊 RÉSUMÉ');
      console.log('═'.repeat(60));
      
      if (!userDoc.exists) {
        console.log('❌ PROBLÈME: Document users/' + userId + ' manquant');
        console.log('   Solution: Créer le document manuellement ou se reconnecter');
      } else if (workoutsSnapshot.size === 0) {
        console.log('⚠️  NORMAL: Aucune séance effectuée (compte vierge)');
      } else {
        console.log('✅ Tout semble OK côté Firestore');
        console.log('   Si l\'app ne montre rien, vérifier:');
        console.log('   - Metro bundler logs (console.log dans HomeScreen)');
        console.log('   - Erreurs JavaScript dans l\'app');
        console.log('   - Connexion réseau du téléphone');
      }
      
      rl.close();
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      rl.close();
    }
  });
}

debugAdminAccount();
