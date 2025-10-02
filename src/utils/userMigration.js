import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * 🔄 MIGRATION USERS - Ajouter support multi-programmes et stats
 * 
 * SÉCURISÉ : Ne supprime RIEN, ajoute seulement les nouveaux champs
 * À exécuter UNE SEULE FOIS depuis les DevTools console ou un bouton admin
 */

export const migrateExistingUsers = async () => {
  console.log('🔄 MIGRATION: Début de la migration des utilisateurs...');
  
  try {
    // 1. Récupérer tous les utilisateurs existants
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // 2. Traiter chaque utilisateur
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`📝 Migration utilisateur: ${userData.email || userId}`);
      
      try {
        // 3. Vérifier si la migration a déjà été faite
        if (userData.globalXP !== undefined) {
          console.log(`⏭️  Utilisateur ${userData.email} déjà migré, ignoré`);
          skippedCount++;
          continue;
        }
        
        // 4. Calculer les nouvelles valeurs basées sur l'existant
        const existingTotalXP = userData.totalXP || 0;
        const globalXP = existingTotalXP;
        const globalLevel = Math.floor(Math.sqrt(globalXP / 100));
        
        // 5. Préparer les nouveaux champs (SANS toucher aux existants)
        const newFields = {
          // Nouveaux champs globaux
          globalXP: globalXP,
          globalLevel: globalLevel,
          title: globalLevel >= 10 ? "Expert" : globalLevel >= 5 ? "Intermédiaire" : "Débutant",
          
          // Stats de base (tous à 0 pour commencer)
          stats: {
            strength: 0,
            endurance: 0,
            power: 0,
            speed: 0,
            flexibility: 0
          },
          
          // Programmes avec données existantes migrées
          programs: {
            street: {
              xp: existingTotalXP, // Migrer l'XP existant vers le programme street
              level: userData.level || 0, // Garder le niveau existant
              completedSkills: userData.completedPrograms ? userData.completedPrograms.length : 0,
              totalSkills: 20, // Total des compétences disponibles
              lastSession: userData.lastWorkoutDate || null // Migrer la dernière session
            }
          },
          
          // Timestamp de migration
          migratedAt: new Date(),
          migrationVersion: "1.0"
        };
        
        // 6. Mettre à jour SANS écraser (merge)
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, newFields);
        
        console.log(`✅ Utilisateur ${userData.email} migré avec succès`);
        migratedCount++;
        
      } catch (userError) {
        console.error(`❌ Erreur migration utilisateur ${userData.email}:`, userError);
        errorCount++;
      }
    }
    
    // 7. Rapport final
    console.log('🎉 MIGRATION TERMINÉE !');
    console.log(`✅ Migrés: ${migratedCount}`);
    console.log(`⏭️  Ignorés (déjà migrés): ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📊 Total traités: ${usersSnapshot.docs.length}`);
    
    return {
      success: true,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      total: usersSnapshot.docs.length
    };
    
  } catch (error) {
    console.error('❌ ERREUR MIGRATION GLOBALE:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 🔍 PREVIEW - Voir ce qui va être migré SANS faire de changements
 */
export const previewMigration = async () => {
  console.log('👀 PREVIEW: Analyse des utilisateurs à migrer...');
  
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const preview = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const existingTotalXP = userData.totalXP || 0;
      const globalLevel = Math.floor(Math.sqrt(existingTotalXP / 100));
      
      preview.push({
        email: userData.email,
        currentTotalXP: existingTotalXP,
        willBecomeGlobalXP: existingTotalXP,
        willBecomeGlobalLevel: globalLevel,
        willBecomeTitle: globalLevel >= 10 ? "Expert" : globalLevel >= 5 ? "Intermédiaire" : "Débutant",
        alreadyMigrated: userData.globalXP !== undefined,
        completedPrograms: userData.completedPrograms ? userData.completedPrograms.length : 0
      });
    }
    
    console.table(preview);
    return preview;
    
  } catch (error) {
    console.error('❌ Erreur preview:', error);
    return null;
  }
};

/**
 * 🧪 TEST - Migrer un seul utilisateur de test
 */
export const testMigrationSingleUser = async (userEmail) => {
  console.log(`🧪 TEST: Migration utilisateur ${userEmail}`);
  
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const targetUser = usersSnapshot.docs.find(doc => 
      doc.data().email === userEmail
    );
    
    if (!targetUser) {
      console.log(`❌ Utilisateur ${userEmail} non trouvé`);
      return { success: false, error: 'Utilisateur non trouvé' };
    }
    
    // Simuler la migration sur un seul utilisateur
    const userData = targetUser.data();
    const existingTotalXP = userData.totalXP || 0;
    const globalLevel = Math.floor(Math.sqrt(existingTotalXP / 100));
    
    const newFields = {
      globalXP: existingTotalXP,
      globalLevel: globalLevel,
      title: globalLevel >= 10 ? "Expert" : globalLevel >= 5 ? "Intermédiaire" : "Débutant",
      stats: {
        strength: 0,
        endurance: 0,
        power: 0,
        speed: 0,
        flexibility: 0
      },
      programs: {
        street: {
          xp: existingTotalXP,
          level: userData.level || 0,
          completedSkills: userData.completedPrograms ? userData.completedPrograms.length : 0,
          totalSkills: 20,
          lastSession: userData.lastWorkoutDate || null
        }
      },
      migratedAt: new Date(),
      migrationVersion: "1.0-test"
    };
    
    const userRef = doc(db, 'users', targetUser.id);
    await updateDoc(userRef, newFields);
    
    console.log(`✅ Test migration réussie pour ${userEmail}`);
    return { success: true, data: newFields };
    
  } catch (error) {
    console.error(`❌ Erreur test migration:`, error);
    return { success: false, error: error.message };
  }
};
