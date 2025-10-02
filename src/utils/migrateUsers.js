/**
 * SCRIPT DE MIGRATION DES UTILISATEURS
 * 
 * Objectif : Migrer les utilisateurs existants vers la nouvelle structure
 * avec support multi-programmes et système de stats
 * 
 * ATTENTION : Ce script ne doit être exécuté qu'UNE SEULE FOIS
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Obtient le titre basé sur le niveau global
 * @param {number} level - Niveau global de l'utilisateur
 * @returns {string} Titre correspondant
 */
function getTitleFromLevel(level) {
  if (level >= 20) return "Légende";
  if (level >= 12) return "Maître";
  if (level >= 7) return "Champion";
  if (level >= 3) return "Guerrier";
  return "Débutant";
}

/**
 * Calcule le niveau basé sur l'XP
 * @param {number} xp - Points d'expérience
 * @returns {number} Niveau calculé
 */
function calculateLevelFromXP(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Migre un utilisateur individuel
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} userData - Données actuelles de l'utilisateur
 * @returns {Promise<boolean>} Succès de la migration
 */
async function migrateUser(userId, userData) {
  try {
    console.log(`🔄 Migration de l'utilisateur: ${userData.email || userId}`);
    
    // Calculer les nouvelles valeurs
    const totalXP = userData.totalXP || 0;
    const globalLevel = calculateLevelFromXP(totalXP);
    const title = getTitleFromLevel(globalLevel);
    
    // Compter les compétences complétées (ancien système)
    const completedSkills = userData.completedPrograms?.length || 0;
    
    // Calculer le level du programme street basé sur l'XP
    const streetLevel = calculateLevelFromXP(totalXP);
    
    // Structure de migration
    const migrationData = {
      // Champs globaux
      globalXP: totalXP,
      globalLevel: globalLevel,
      title: title,
      
      // Système de stats
      stats: {
        strength: 0,
        endurance: 0,
        power: 0,
        speed: 0,
        flexibility: 0
      },
      
      // Structure multi-programmes
      programs: {
        street: {
          xp: totalXP,
          level: streetLevel,
          completedSkills: completedSkills,
          currentSkill: userData.currentProgram || null,
          unlockedSkills: userData.completedPrograms || []
        }
      },
      
      // Métadonnées de migration
      migratedAt: new Date(),
      migrationVersion: "1.0"
    };
    
    // Mettre à jour le document (garde les champs existants)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, migrationData);
    
    console.log(`✅ Utilisateur migré: ${userData.email || userId}`);
    console.log(`   - XP Global: ${totalXP} (Level ${globalLevel})`);
    console.log(`   - Titre: ${title}`);
    console.log(`   - Compétences complétées: ${completedSkills}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur migration ${userData.email || userId}:`, error);
    return false;
  }
}

/**
 * Fonction principale de migration
 */
export async function migrateAllUsers() {
  console.log('🚀 DÉBUT DE LA MIGRATION DES UTILISATEURS');
  console.log('==========================================');
  
  let totalUsers = 0;
  let migratedUsers = 0;
  let skippedUsers = 0;
  let errorUsers = 0;
  
  try {
    // Récupérer tous les utilisateurs
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    totalUsers = snapshot.size;
    console.log(`📊 Total utilisateurs trouvés: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log('ℹ️  Aucun utilisateur à migrer');
      return;
    }
    
    // Traiter chaque utilisateur
    for (const userDoc of snapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Vérifier si déjà migré
      if (userData.migratedAt) {
        console.log(`⏭️  Utilisateur déjà migré: ${userData.email || userId}`);
        skippedUsers++;
        continue;
      }
      
      // Migrer l'utilisateur
      const success = await migrateUser(userId, userData);
      
      if (success) {
        migratedUsers++;
      } else {
        errorUsers++;
      }
      
      // Petite pause pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
  } catch (error) {
    console.error('❌ Erreur générale de migration:', error);
    return false;
  }
  
  // Résumé final
  console.log('\n📋 RÉSUMÉ DE LA MIGRATION');
  console.log('========================');
  console.log(`👥 Total utilisateurs: ${totalUsers}`);
  console.log(`✅ Migrés avec succès: ${migratedUsers}`);
  console.log(`⏭️  Déjà migrés (ignorés): ${skippedUsers}`);
  console.log(`❌ Erreurs: ${errorUsers}`);
  console.log(`📊 Taux de succès: ${totalUsers > 0 ? Math.round((migratedUsers / (totalUsers - skippedUsers)) * 100) : 0}%`);
  
  if (migratedUsers > 0) {
    console.log('\n🎉 Migration terminée avec succès !');
  }
  
  return true;
}

/**
 * Fonction de vérification post-migration
 */
export async function verifyMigration() {
  console.log('🔍 VÉRIFICATION DE LA MIGRATION');
  console.log('===============================');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let totalUsers = snapshot.size;
    let migratedUsers = 0;
    let nonMigratedUsers = 0;
    
    console.log(`📊 Total utilisateurs: ${totalUsers}`);
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      if (userData.migratedAt) {
        migratedUsers++;
        
        // Vérifier la structure
        const hasRequiredFields = 
          userData.globalXP !== undefined &&
          userData.globalLevel !== undefined &&
          userData.title !== undefined &&
          userData.stats !== undefined &&
          userData.programs !== undefined &&
          userData.programs.street !== undefined;
          
        if (!hasRequiredFields) {
          console.log(`⚠️  Structure incomplète pour: ${userData.email || userDoc.id}`);
        }
      } else {
        nonMigratedUsers++;
        console.log(`❌ Non migré: ${userData.email || userDoc.id}`);
      }
    }
    
    console.log(`✅ Utilisateurs migrés: ${migratedUsers}`);
    console.log(`❌ Non migrés: ${nonMigratedUsers}`);
    console.log(`📊 Pourcentage migré: ${totalUsers > 0 ? Math.round((migratedUsers / totalUsers) * 100) : 0}%`);
    
    return { totalUsers, migratedUsers, nonMigratedUsers };
    
  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
    return null;
  }
}

/**
 * Fonction de prévisualisation (lecture seule)
 */
export async function previewMigration() {
  console.log('👁️  PRÉVISUALISATION DE LA MIGRATION');
  console.log('====================================');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let totalUsers = snapshot.size;
    let toMigrate = 0;
    let alreadyMigrated = 0;
    
    console.log(`📊 Total utilisateurs: ${totalUsers}`);
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      if (userData.migratedAt) {
        alreadyMigrated++;
        console.log(`✅ Déjà migré: ${userData.email || userId} (${userData.migrationVersion || 'version inconnue'})`);
      } else {
        toMigrate++;
        const totalXP = userData.totalXP || 0;
        const globalLevel = calculateLevelFromXP(totalXP);
        const title = getTitleFromLevel(globalLevel);
        
        console.log(`🔄 À migrer: ${userData.email || userId}`);
        console.log(`   - XP actuel: ${totalXP} → Level ${globalLevel} (${title})`);
        console.log(`   - Compétences: ${userData.completedPrograms?.length || 0}`);
      }
    }
    
    console.log(`\n📋 RÉSUMÉ PRÉVISUALISATION:`);
    console.log(`👥 Total: ${totalUsers}`);
    console.log(`🔄 À migrer: ${toMigrate}`);
    console.log(`✅ Déjà migrés: ${alreadyMigrated}`);
    
    return { totalUsers, toMigrate, alreadyMigrated };
    
  } catch (error) {
    console.error('❌ Erreur de prévisualisation:', error);
    return null;
  }
}

// Export par défaut pour utilisation dans l'interface admin
export default {
  migrateAllUsers,
  verifyMigration,
  previewMigration
};
