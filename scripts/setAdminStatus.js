/**
 * Script pour définir le statut admin dans Firestore
 * 
 * INSTRUCTIONS:
 * 1. Ouvrir la console Firebase: https://console.firebase.google.com
 * 2. Aller dans Firestore Database
 * 3. Trouver la collection "users"
 * 4. Trouver le document avec phoneNumber = "+33679430759"
 * 5. Cliquer sur "Edit document"
 * 6. Ajouter un nouveau champ:
 *    - Field name: isAdmin
 *    - Field type: boolean
 *    - Field value: true
 * 7. Cliquer "Update"
 * 
 * OU utiliser ce code dans la console Firebase (onglet "Rules Playground"):
 */

// Si vous avez accès à Firebase Admin SDK:
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setAdminStatus() {
  try {
    // Trouver l'utilisateur par numéro de téléphone
    const usersSnapshot = await db.collection('users')
      .where('phoneNumber', '==', '+33679430759')
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé avec ce numéro');
      return;
    }

    // Mettre à jour chaque utilisateur (normalement 1 seul)
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      console.log('✅ Utilisateur trouvé:', doc.id);
      batch.update(doc.ref, { isAdmin: true });
    });

    await batch.commit();
    console.log('✅ Statut admin défini avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

setAdminStatus();

/**
 * ALTERNATIVE: Utiliser l'interface Firestore directement
 * 
 * 1. Firebase Console > Firestore Database
 * 2. Collection: users
 * 3. Trouver ton document utilisateur
 * 4. Ajouter le champ: isAdmin = true
 */
