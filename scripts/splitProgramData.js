/**
 * Script pour splitter les données de programmes en :
 * 1. Métadonnées légères (programs-meta.json) - ~40KB
 * 2. Détails complets (programDetails/*.json) - Lazy loaded
 * 
 * Usage: node scripts/splitProgramData.js
 */

const fs = require('fs');
const path = require('path');

// Chemins
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const DETAILS_DIR = path.join(DATA_DIR, 'programDetails');

// Créer le dossier programDetails s'il n'existe pas
if (!fs.existsSync(DETAILS_DIR)) {
  fs.mkdirSync(DETAILS_DIR, { recursive: true });
}

/**
 * Extrait les métadonnées d'un programme (sans les détails des niveaux)
 */
function extractProgramMeta(program) {
  return {
    id: program.id,
    name: program.name,
    difficulty: program.difficulty,
    icon: program.icon,
    color: program.color,
    position: program.position,
    prerequisites: program.prerequisites,
    unlocks: program.unlocks,
    totalWeeks: program.totalWeeks,
    xpReward: program.xpReward,
    statBonuses: program.statBonuses,
    // Métriques utiles
    totalLevels: program.levels?.length || 0,
    // Description courte uniquement (première phrase)
    shortDescription: program.description ? program.description.split('.')[0] + '.' : ''
  };
}

/**
 * Extrait les détails complets d'un programme
 */
function extractProgramDetails(program) {
  return {
    id: program.id,
    description: program.description,
    levels: program.levels
  };
}

/**
 * Process une catégorie
 */
function processCategory(categoryPath, categoryId) {
  console.log(`\n📦 Processing ${categoryId}...`);
  
  // Lire le fichier source
  const sourceData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
  
  // Créer les métadonnées de la catégorie
  const categoryMeta = {
    id: sourceData.id,
    name: sourceData.name,
    description: sourceData.description,
    icon: sourceData.icon,
    color: sourceData.color,
    backgroundImage: sourceData.backgroundImage,
    type: sourceData.type,
    programs: sourceData.programs.map(extractProgramMeta)
  };
  
  // Créer les détails des programmes
  const programsDetails = {};
  sourceData.programs.forEach(program => {
    programsDetails[program.id] = extractProgramDetails(program);
  });
  
  // Sauvegarder les détails
  const detailsPath = path.join(DETAILS_DIR, `${categoryId}-details.json`);
  fs.writeFileSync(detailsPath, JSON.stringify(programsDetails, null, 2));
  
  const originalSize = fs.statSync(categoryPath).size;
  const metaSize = JSON.stringify(categoryMeta).length;
  const detailsSize = fs.statSync(detailsPath).size;
  
  console.log(`  ✅ Métadonnées: ${(metaSize / 1024).toFixed(1)} KB`);
  console.log(`  ✅ Détails: ${(detailsSize / 1024).toFixed(1)} KB`);
  console.log(`  📊 Original: ${(originalSize / 1024).toFixed(1)} KB`);
  console.log(`  🎯 Réduction méta: ${(((originalSize - metaSize) / originalSize) * 100).toFixed(1)}%`);
  
  return categoryMeta;
}

// Main
console.log('🚀 Splitting program data...\n');

try {
  // Process les deux catégories
  const streetMeta = processCategory(
    path.join(DATA_DIR, 'streetworkout.json'),
    'streetworkout'
  );
  
  const runMeta = processCategory(
    path.join(DATA_DIR, 'run10k.json'),
    'run10k'
  );
  
  // Créer le fichier meta combiné
  const programsMeta = {
    categories: [streetMeta, runMeta]
  };
  
  const metaPath = path.join(DATA_DIR, 'programs-meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(programsMeta, null, 2));
  
  const metaFileSize = fs.statSync(metaPath).size;
  console.log(`\n✨ programs-meta.json créé: ${(metaFileSize / 1024).toFixed(1)} KB`);
  
  // Récapitulatif
  const streetOriginal = fs.statSync(path.join(DATA_DIR, 'streetworkout.json')).size;
  const runOriginal = fs.statSync(path.join(DATA_DIR, 'run10k.json')).size;
  const totalOriginal = streetOriginal + runOriginal;
  
  console.log('\n📊 RÉCAPITULATIF:');
  console.log(`  Original total: ${(totalOriginal / 1024).toFixed(1)} KB`);
  console.log(`  Métadonnées (chargement initial): ${(metaFileSize / 1024).toFixed(1)} KB`);
  console.log(`  🚀 Gain au démarrage: ${(((totalOriginal - metaFileSize) / totalOriginal) * 100).toFixed(1)}%`);
  
  console.log('\n✅ Split terminé avec succès!');
  console.log('\n📁 Fichiers créés:');
  console.log('  - src/data/programs-meta.json');
  console.log('  - src/data/programDetails/streetworkout-details.json');
  console.log('  - src/data/programDetails/run10k-details.json');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
