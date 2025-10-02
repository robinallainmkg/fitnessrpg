/**
 * SCRIPT DE TEST DE MIGRATION
 * 
 * Ce script permet de tester la migration sur un environnement de développement
 * avant de l'exécuter en production.
 */

import { migrateAllUsers, verifyMigration, previewMigration } from './migrateUsers';

/**
 * Test complet de la migration
 */
export async function testMigrationComplete() {
  console.log('🧪 DÉBUT DES TESTS DE MIGRATION');
  console.log('================================');
  
  try {
    // 1. Prévisualisation
    console.log('\n1️⃣ TEST PRÉVISUALISATION');
    console.log('------------------------');
    const preview = await previewMigration();
    
    if (!preview) {
      console.log('❌ Échec de la prévisualisation');
      return false;
    }
    
    console.log(`✅ Prévisualisation réussie`);
    console.log(`📊 Utilisateurs à traiter: ${preview.toMigrate}`);
    
    // 2. Vérification pré-migration
    console.log('\n2️⃣ VÉRIFICATION PRÉ-MIGRATION');
    console.log('-----------------------------');
    const preMigration = await verifyMigration();
    
    if (!preMigration) {
      console.log('❌ Échec vérification pré-migration');
      return false;
    }
    
    console.log(`✅ Vérification pré-migration réussie`);
    console.log(`👥 Utilisateurs non-migrés: ${preMigration.nonMigratedUsers}`);
    
    // 3. Migration (si des utilisateurs à migrer)
    if (preview.toMigrate > 0) {
      console.log('\n3️⃣ EXÉCUTION MIGRATION');
      console.log('----------------------');
      
      const migrationResult = await migrateAllUsers();
      
      if (!migrationResult) {
        console.log('❌ Échec de la migration');
        return false;
      }
      
      console.log('✅ Migration exécutée');
    } else {
      console.log('\n3️⃣ AUCUNE MIGRATION NÉCESSAIRE');
      console.log('-------------------------------');
      console.log('ℹ️  Tous les utilisateurs sont déjà migrés');
    }
    
    // 4. Vérification post-migration
    console.log('\n4️⃣ VÉRIFICATION POST-MIGRATION');
    console.log('------------------------------');
    const postMigration = await verifyMigration();
    
    if (!postMigration) {
      console.log('❌ Échec vérification post-migration');
      return false;
    }
    
    console.log(`✅ Vérification post-migration réussie`);
    console.log(`👥 Utilisateurs migrés: ${postMigration.migratedUsers}`);
    console.log(`❌ Non-migrés restants: ${postMigration.nonMigratedUsers}`);
    
    // 5. Validation finale
    console.log('\n5️⃣ VALIDATION FINALE');
    console.log('-------------------');
    
    const successRate = postMigration.totalUsers > 0 ? 
      Math.round((postMigration.migratedUsers / postMigration.totalUsers) * 100) : 100;
    
    if (successRate === 100) {
      console.log('🎉 TESTS RÉUSSIS À 100% !');
      console.log(`✅ Tous les ${postMigration.totalUsers} utilisateurs sont migrés`);
      return true;
    } else {
      console.log(`⚠️  Tests partiellement réussis: ${successRate}%`);
      console.log(`❌ ${postMigration.nonMigratedUsers} utilisateurs non-migrés`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERREUR DURANT LES TESTS:', error);
    return false;
  }
}

/**
 * Test de structure pour un utilisateur type
 */
export function validateUserStructure(userData) {
  console.log('🔍 VALIDATION STRUCTURE UTILISATEUR');
  console.log('===================================');
  
  const requiredFields = [
    'globalXP',
    'globalLevel', 
    'title',
    'stats',
    'programs',
    'migratedAt',
    'migrationVersion'
  ];
  
  const missingFields = [];
  const presentFields = [];
  
  requiredFields.forEach(field => {
    if (userData[field] !== undefined) {
      presentFields.push(field);
    } else {
      missingFields.push(field);
    }
  });
  
  console.log(`✅ Champs présents (${presentFields.length}/${requiredFields.length}):`);
  presentFields.forEach(field => {
    console.log(`   - ${field}: ${typeof userData[field]}`);
  });
  
  if (missingFields.length > 0) {
    console.log(`❌ Champs manquants (${missingFields.length}):`);
    missingFields.forEach(field => {
      console.log(`   - ${field}`);
    });
    return false;
  }
  
  // Validation des stats
  if (userData.stats) {
    const requiredStats = ['strength', 'endurance', 'power', 'speed', 'flexibility'];
    const missingStats = requiredStats.filter(stat => userData.stats[stat] === undefined);
    
    if (missingStats.length > 0) {
      console.log(`❌ Stats manquantes: ${missingStats.join(', ')}`);
      return false;
    }
    
    console.log('✅ Structure stats valide');
  }
  
  // Validation des programmes
  if (userData.programs && userData.programs.street) {
    const requiredProgramFields = ['xp', 'level', 'completedSkills'];
    const missingProgramFields = requiredProgramFields.filter(
      field => userData.programs.street[field] === undefined
    );
    
    if (missingProgramFields.length > 0) {
      console.log(`❌ Champs programme manquants: ${missingProgramFields.join(', ')}`);
      return false;
    }
    
    console.log('✅ Structure programmes valide');
  }
  
  console.log('🎉 STRUCTURE UTILISATEUR VALIDE !');
  return true;
}

/**
 * Test de performance
 */
export async function testMigrationPerformance() {
  console.log('⚡ TEST DE PERFORMANCE');
  console.log('====================');
  
  const startTime = Date.now();
  
  try {
    // Test prévisualisation
    const previewStart = Date.now();
    await previewMigration();
    const previewTime = Date.now() - previewStart;
    
    // Test vérification
    const verifyStart = Date.now();
    await verifyMigration();
    const verifyTime = Date.now() - verifyStart;
    
    const totalTime = Date.now() - startTime;
    
    console.log('📊 RÉSULTATS PERFORMANCE:');
    console.log(`   Prévisualisation: ${previewTime}ms`);
    console.log(`   Vérification: ${verifyTime}ms`);
    console.log(`   Total: ${totalTime}ms`);
    
    if (totalTime < 5000) {
      console.log('✅ Performance excellente (< 5s)');
    } else if (totalTime < 10000) {
      console.log('⚠️  Performance acceptable (< 10s)');
    } else {
      console.log('❌ Performance lente (> 10s)');
    }
    
    return { previewTime, verifyTime, totalTime };
    
  } catch (error) {
    console.error('❌ Erreur test performance:', error);
    return null;
  }
}

export default {
  testMigrationComplete,
  validateUserStructure,
  testMigrationPerformance
};
