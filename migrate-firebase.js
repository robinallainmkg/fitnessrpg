/**
 * Script de migration automatique Firebase
 * Remplace les anciens imports par le nouveau firebase.simple.js
 */

const fs = require('fs');
const path = require('path');

const CRITICAL_FILES = [
  'src/contexts/WorkoutContext.js',
  'src/contexts/ChallengeContext.js',
  'src/hooks/useUserPrograms.js',
  'src/screens/WorkoutSummaryScreen.js',
  'src/screens/ProgressScreen.js',
  'src/screens/ProfileScreen.js',
  'src/services/sessionQueueService.js',
  'src/services/activeProgramsService.js',
  'src/components/AuthModal.js',
];

const OLD_IMPORT_FIRESTORE = `import firestore from '@react-native-firebase/firestore';`;
const NEW_IMPORT_FIRESTORE = `// ✅ IMPORT UNIFIÉ - Firebase simple config
import { getFirestore } from '../config/firebase.simple';
const firestore = getFirestore();`;

const OLD_IMPORT_AUTH = `import auth from '@react-native-firebase/auth';`;
const NEW_IMPORT_AUTH = `import { getAuth } from '../config/firebase.simple';
const auth = getAuth();`;

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remplacer import firestore
    if (content.includes(OLD_IMPORT_FIRESTORE)) {
      // Calculer le bon chemin relatif vers firebase.simple.js
      const depth = filePath.split('/').length - 2; // src/xxx/file.js → depth 2
      const relativePath = '../'.repeat(depth) + 'config/firebase.simple';
      
      const customImport = `// ✅ IMPORT UNIFIÉ - Firebase simple config
import { getFirestore } from '${relativePath}';
const firestore = getFirestore();`;
      
      content = content.replace(OLD_IMPORT_FIRESTORE, customImport);
      modified = true;
      console.log(`✅ ${filePath} - Firestore import migré`);
    }
    
    // Remplacer import auth
    if (content.includes(OLD_IMPORT_AUTH)) {
      const depth = filePath.split('/').length - 2;
      const relativePath = '../'.repeat(depth) + 'config/firebase.simple';
      
      const customImport = `import { getAuth } from '${relativePath}';
const auth = getAuth();`;
      
      content = content.replace(OLD_IMPORT_AUTH, customImport);
      modified = true;
      console.log(`✅ ${filePath} - Auth import migré`);
    }
    
    // Remplacer firestore() par firestore (sans parenthèses)
    if (content.includes('firestore().')) {
      content = content.replace(/firestore\(\)\./g, 'firestore.');
      modified = true;
      console.log(`✅ ${filePath} - firestore() → firestore`);
    }
    
    // Remplacer auth() par auth (sans parenthèses)
    if (content.includes('auth().')) {
      content = content.replace(/auth\(\)\./g, 'auth.');
      modified = true;
      console.log(`✅ ${filePath} - auth() → auth`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`💾 ${filePath} sauvegardé\n`);
    } else {
      console.log(`⏭️  ${filePath} - Aucun changement nécessaire\n`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur migration ${filePath}:`, error.message);
  }
}

console.log('🔄 Migration Firebase vers firebase.simple.js\n');
console.log('Fichiers critiques à migrer:\n');

CRITICAL_FILES.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\n🚀 Démarrage migration...\n');

CRITICAL_FILES.forEach(migrateFile);

console.log('\n✅ Migration terminée!');
console.log('\n📝 Prochaines étapes:');
console.log('1. Vérifier que l\'app compile');
console.log('2. Tester sur Nothing Phone avec: adb shell pm clear com.fitnessrpg.app');
console.log('3. Vérifier les logs Firebase');
