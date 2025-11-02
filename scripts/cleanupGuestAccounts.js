/**
 * Script pour supprimer les comptes invités (anonymous) orphelins
 * Garde uniquement le compte admin principal
 * 
 * IMPORTANT: Ce script nécessite une clé de service Firebase Admin.
 * 
 * Pour obtenir la clé:
 * 1. Allez sur https://console.firebase.google.com
 * 2. Sélectionnez votre projet
 * 3. Paramètres (⚙️) → Comptes de service
 * 4. "Générer une nouvelle clé privée"
 * 5. Sauvegardez le fichier comme serviceAccountKey.json à la racine
 * 
 * Usage: node scripts/cleanupGuestAccounts.js
 */

const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Chercher le fichier de service account
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERREUR: Fichier serviceAccountKey.json introuvable\n');
  console.log('📝 Pour utiliser ce script, vous devez:');
  console.log('   1. Aller sur https://console.firebase.google.com');
  console.log('   2. Sélectionner votre projet');
  console.log('   3. Paramètres (⚙️) → Comptes de service');
  console.log('   4. Cliquer "Générer une nouvelle clé privée"');
  console.log('   5. Sauvegarder le fichier comme "serviceAccountKey.json"');
  console.log('      à la racine du projet:\n');
  console.log(`      ${path.join(__dirname, '..')}/serviceAccountKey.json\n`);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanupGuestAccounts() {
  console.log('🧹 Nettoyage des comptes invités\n');
  
  const ADMIN_UID = 'xVXl9iQC5vNZxp8SxClNcrFz0283';
  
  try {
    // 1. Lister tous les utilisateurs Firestore
    console.log('📋 Récupération des utilisateurs Firestore...');
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`   Total: ${usersSnapshot.size} utilisateurs trouvés\n`);
    
    const usersToDelete = [];
    const adminUsers = [];
    
    for (const doc of usersSnapshot.docs) {
      const uid = doc.id;
      const data = doc.data();
      
      // Garder l'admin principal
      if (uid === ADMIN_UID) {
        console.log(`✅ GARDER: ${uid} (Admin principal)`);
        console.log(`   Phone: ${data.phoneNumber || 'N/A'}`);
        console.log(`   XP: ${data.globalXP || data.totalXP || 0}`);
        console.log(`   isGuest: ${data.isGuest || false}`);
        adminUsers.push({ uid, data });
        continue;
      }
      
      // Garder les comptes non-invités (avec phoneNumber)
      if (data.phoneNumber && !data.isGuest) {
        console.log(`✅ GARDER: ${uid} (Compte authentifié)`);
        console.log(`   Phone: ${data.phoneNumber}`);
        console.log(`   XP: ${data.globalXP || data.totalXP || 0}`);
        adminUsers.push({ uid, data });
        continue;
      }
      
      // Marquer pour suppression: invités sans numéro
      console.log(`❌ SUPPRIMER: ${uid}`);
      console.log(`   isGuest: ${data.isGuest || 'N/A'}`);
      console.log(`   Phone: ${data.phoneNumber || 'Aucun'}`);
      console.log(`   XP: ${data.globalXP || data.totalXP || 0}`);
      usersToDelete.push(uid);
      console.log('');
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ À garder: ${adminUsers.length} compte(s)`);
    console.log(`❌ À supprimer: ${usersToDelete.length} compte(s) invité(s)`);
    console.log('═'.repeat(60) + '\n');
    
    if (usersToDelete.length === 0) {
      console.log('✨ Aucun compte invité à nettoyer !');
      rl.close();
      return;
    }
    
    // Confirmation
    rl.question(`Confirmer la suppression de ${usersToDelete.length} compte(s) ? (oui/non): `, async (answer) => {
      if (answer.toLowerCase() !== 'oui') {
        console.log('❌ Annulé');
        rl.close();
        return;
      }
      
      console.log('\n🗑️  Suppression en cours...\n');
      
      for (const uid of usersToDelete) {
        try {
          // 1. Supprimer le document Firestore
          await db.collection('users').doc(uid).delete();
          console.log(`   ✅ Firestore: users/${uid}`);
          
          // 2. Supprimer les workouts
          const workoutsSnapshot = await db.collection('workoutSessions')
            .where('userId', '==', uid)
            .get();
          
          if (workoutsSnapshot.size > 0) {
            const batch = db.batch();
            workoutsSnapshot.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`   ✅ Workouts: ${workoutsSnapshot.size} supprimé(s)`);
          }
          
          // 3. Supprimer de Firebase Auth
          try {
            await auth.deleteUser(uid);
            console.log(`   ✅ Auth: ${uid} supprimé`);
          } catch (authError) {
            if (authError.code === 'auth/user-not-found') {
              console.log(`   ⏭️  Auth: user déjà supprimé`);
            } else {
              console.log(`   ⚠️  Auth: ${authError.message}`);
            }
          }
          
          console.log('');
        } catch (error) {
          console.error(`   ❌ Erreur suppression ${uid}:`, error.message);
        }
      }
      
      console.log('═'.repeat(60));
      console.log('✅ Nettoyage terminé !');
      console.log('═'.repeat(60));
      
      rl.close();
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    rl.close();
  }
}

cleanupGuestAccounts();
