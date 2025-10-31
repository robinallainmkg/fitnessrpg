// Script pour créer l'utilisateur admin dans Firestore
// Usage: node scripts/createAdminUser.js

const admin = require('firebase-admin');
const serviceAccount = require('../android/app/google-services.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_info.project_id,
    clientEmail: `firebase-adminsdk@${serviceAccount.project_info.project_id}.iam.gserviceaccount.com`,
    privateKey: "-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
  })
});

const db = admin.firestore();

const ADMIN_UID = 'xVXJ9iQC5vNZxp8SxClNcrFz0283';

async function createAdminUser() {
  try {
    console.log('🔄 Création du document admin...');
    
    const adminData = {
      phoneNumber: '+33679430759',
      isAdmin: true,
      totalXP: 220,
      globalXP: 220,
      globalLevel: 2,
      level: 2,
      activePrograms: ['street'],
      selectedPrograms: ['street'],
      programs: {
        street: {
          level: 1,
          xp: 0,
          completedSkills: [],
          skillProgress: {},
          totalSkills: 22
        }
      },
      userProgress: {
        street: {
          level: 1,
          xp: 0,
          completedSkills: [],
          skillProgress: {},
          totalSkills: 22
        }
      },
      stats: {
        strength: 0,
        endurance: 0,
        power: 0,
        speed: 0,
        flexibility: 0
      },
      streak: 0,
      lastWorkoutDate: null,
      displayName: 'Admin Dev',
      avatarId: 0,
      totalChallengesSubmitted: 2,
      totalChallengesApproved: 0,
      lastSubmissionDate: admin.firestore.Timestamp.fromDate(new Date('2025-10-29')),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await db.collection('users').doc(ADMIN_UID).set(adminData, { merge: true });
    
    console.log('✅ Document admin créé avec succès!');
    console.log('📋 UID:', ADMIN_UID);
    console.log('📞 Phone:', adminData.phoneNumber);
    console.log('👑 isAdmin:', adminData.isAdmin);
    console.log('⭐ XP:', adminData.totalXP);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createAdminUser();
