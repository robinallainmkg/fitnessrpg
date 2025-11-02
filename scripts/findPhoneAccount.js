/**
 * Script pour trouver un compte par numéro de téléphone
 * 
 * Usage: node scripts/findPhoneAccount.js <phoneNumber>
 * Example: node scripts/findPhoneAccount.js +33679430759
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const auth = admin.auth();
const firestore = admin.firestore();

async function findAccountByPhone(phoneNumber) {
  console.log('🔍 Recherche du compte avec le numéro:', phoneNumber);
  
  try {
    // Normaliser le numéro (ajouter +33 si commence par 0)
    let normalizedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      normalizedPhone = '+33' + phoneNumber.substring(1);
    }
    
    console.log('📱 Numéro normalisé:', normalizedPhone);
    
    // Chercher dans Firebase Auth
    try {
      const userRecord = await auth.getUserByPhoneNumber(normalizedPhone);
      console.log('\n✅ Compte trouvé dans Firebase Auth:');
      console.log('   UID:', userRecord.uid);
      console.log('   Téléphone:', userRecord.phoneNumber);
      console.log('   Email:', userRecord.email || 'Aucun');
      console.log('   Créé le:', new Date(userRecord.metadata.creationTime).toLocaleString('fr-FR'));
      console.log('   Dernière connexion:', new Date(userRecord.metadata.lastSignInTime).toLocaleString('fr-FR'));
      
      // Chercher les données Firestore
      const userDoc = await firestore.collection('users').doc(userRecord.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('\n📦 Données Firestore:');
        console.log('   displayName:', userData.displayName || 'Aucun');
        console.log('   globalLevel:', userData.globalLevel || 0);
        console.log('   globalXP:', userData.globalXP || 0);
        console.log('   programmes actifs:', Object.keys(userData.programs || {}).length);
        console.log('   isGuest:', userData.isGuest || false);
      } else {
        console.log('\n⚠️ Aucune donnée Firestore pour cet UID');
      }
      
      console.log('\n📝 Pour fusionner ce compte vers xVXl9iQC5vNZxp8SxClNcrFz0283, exécute:');
      console.log(`   node scripts/mergePhoneAccount.js ${userRecord.uid} xVXl9iQC5vNZxp8SxClNcrFz0283`);
      
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.error('\n❌ Aucun compte trouvé avec ce numéro de téléphone');
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    process.exit();
  }
}

// Récupérer le numéro de téléphone depuis les arguments
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('❌ Usage: node scripts/findPhoneAccount.js <phoneNumber>');
  console.error('Example: node scripts/findPhoneAccount.js 0679430759');
  console.error('Example: node scripts/findPhoneAccount.js +33679430759');
  process.exit(1);
}

const phoneNumber = args[0];
findAccountByPhone(phoneNumber);
