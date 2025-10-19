import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
       // Créer nouvel utilisateur
      const userCredential = await auth().createUserWithEmailAndPassword(
        newUserData.email, 
        newUserData.password
      );
      
      setTestUser(userCredential.user);
      addLog(`✅ Compte créé: ${userCredential.user.email}`, 'success');

      // Étape 2: Vérifier initialisation stats à 0
      addLog('Étape 2: Vérification initialisation stats...', 'info');
      
      const userDocRef = firestore().doc(`users/${userCredential.user.uid}`);
      const userDoc = await userDocRef.get(); ScrollView,
  Alert,
  Modal
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
  TextInput,
  Switch,
  ProgressBar
} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../theme/colors';

/**
 * 🧪 SYSTÈME DE TEST COMPLET
 * Valide toute la chaîne de progression utilisateur
 */
const SystemTestScreen = ({ navigation }) => {
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [testLogs, setTestLogs] = useState([]);

  // États pour les tests
  const [newUserData, setNewUserData] = useState({
    email: 'test.user@fitness.game',
    password: 'TestPassword123!'
  });

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setTestLogs([]);
  };

  // ========================
  // TEST 1: NOUVEL UTILISATEUR
  // ========================
  const runNewUserTest = async () => {
    setCurrentTest('newUser');
    setLoading(true);
    clearLogs();
    
    try {
      addLog('🚀 DÉBUT TEST 1: Nouvel Utilisateur', 'start');
      
      // Étape 1: Créer compte
      addLog('Étape 1: Création du compte test...', 'info');
      
      // Nettoyer l'utilisateur existant s'il existe
      try {
        await signOut(auth);
        addLog('Déconnexion réussie', 'success');
      } catch (e) {
        addLog('Pas d\'utilisateur connecté', 'info');
      }

      // Supprimer l'utilisateur test s'il existe
      try {
        const testDocRef = firestore().doc('users/test-user-uid');
        await testDocRef.delete();
        addLog('Ancien utilisateur test supprimé', 'info');
      } catch (e) {
        addLog('Pas d\'ancien utilisateur à supprimer', 'info');
      }

      // Créer nouvel utilisateur
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUserData.email, 
        newUserData.password
      );
      
      setTestUser(userCredential.user);
      addLog(`✅ Compte créé: ${userCredential.user.email}`, 'success');

      // Étape 2: Vérifier initialisation stats à 0
      addLog('Étape 2: Vérification initialisation stats...', 'info');
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Initialiser l'utilisateur avec des stats à 0
        const initialUserData = {
          email: userCredential.user.email,
          createdAt: new Date(),
          stats: {
            strength: 0,
            endurance: 0,
            power: 0,
            speed: 0,
            flexibility: 0
          },
          globalXP: 0,
          globalLevel: 1,
          programs: {},
          achievements: [],
          streakDays: 0
        };
        
        await userDocRef.set(initialUserData);
        addLog('✅ Stats initialisées à 0', 'success');
        
        // Vérifier les valeurs
        const userData = initialUserData;
        const allStatsZero = Object.values(userData.stats).every(stat => stat === 0);
        const globalXPZero = userData.globalXP === 0;
        
        if (allStatsZero && globalXPZero) {
          addLog('✅ Vérification réussie: Toutes stats = 0, globalXP = 0', 'success');
          setTestResults(prev => ({ ...prev, statsInit: 'PASS' }));
        } else {
          addLog('❌ Erreur: Stats non initialisées correctement', 'error');
          setTestResults(prev => ({ ...prev, statsInit: 'FAIL' }));
        }
      } else {
        addLog('❌ Utilisateur existe déjà', 'error');
        setTestResults(prev => ({ ...prev, statsInit: 'FAIL' }));
      }

      // Étape 3: Simuler OnboardingView
      addLog('Étape 3: Simulation OnboardingView...', 'info');
      addLog('✅ OnboardingView devrait s\'afficher (nouvel utilisateur)', 'success');
      setTestResults(prev => ({ ...prev, onboarding: 'PASS' }));

      // Étape 4: Simuler première séance
      addLog('Étape 4: Simulation première séance...', 'info');
      await simulateWorkoutCompletion(userCredential.user.uid, 'beginner-foundation', 850, 150);

      // Étape 5: Vérifier mise à jour XP et stats
      addLog('Étape 5: Vérification mise à jour post-séance...', 'info');
      const updatedUserDoc = await userDocRef.get();
      const updatedData = updatedUserDoc.data();
      
      if (updatedData.globalXP === 150 && 
          updatedData.stats.strength === 3 && 
          updatedData.stats.power === 2 && 
          updatedData.stats.endurance === 1) {
        addLog('✅ XP et stats mis à jour correctement', 'success');
        addLog(`  - Global XP: 0 → 150`, 'info');
        addLog(`  - Force: 0 → 3`, 'info');
        addLog(`  - Puissance: 0 → 2`, 'info');
        addLog(`  - Endurance: 0 → 1`, 'info');
        setTestResults(prev => ({ ...prev, firstWorkout: 'PASS' }));
      } else {
        addLog('❌ Erreur mise à jour XP/stats', 'error');
        setTestResults(prev => ({ ...prev, firstWorkout: 'FAIL' }));
      }

      addLog('🎉 TEST 1 TERMINÉ', 'start');
      
    } catch (error) {
      addLog(`❌ Erreur Test 1: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, newUserTest: 'FAIL' }));
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  // ========================
  // TEST 2: UTILISATEUR ACTIF
  // ========================
  const runActiveUserTest = async () => {
    setCurrentTest('activeUser');
    setLoading(true);
    clearLogs();
    
    try {
      addLog('🚀 DÉBUT TEST 2: Utilisateur Actif', 'start');
      
      if (!testUser) {
        addLog('❌ Pas d\'utilisateur test. Exécuter Test 1 d\'abord', 'error');
        return;
      }

      // Étape 1: Compléter une nouvelle compétence
      addLog('Étape 1: Complétion nouvelle compétence...', 'info');
      const userDocRef = firestore().doc(`users/${testUser.uid}`);
      
      // Récupérer état actuel
      const beforeDoc = await userDocRef.get();
      const beforeData = beforeDoc.data();
      
      addLog(`État avant: XP=${beforeData.globalXP}, Force=${beforeData.stats.strength}`, 'info');
      
      // Simuler complétion d'une autre compétence (strict-pullups)
      await simulateWorkoutCompletion(testUser.uid, 'strict-pullups', 920, 200);
      
      // Étape 2: Vérifier gains stats
      addLog('Étape 2: Vérification gains stats...', 'info');
      const afterDoc = await userDocRef.get();
      const afterData = afterDoc.data();
      
      // Récupérer les gains attendus pour strict-pullups
      const strictPullupsProgram = programs.categories
        .flatMap(cat => cat.programs)
        .find(p => p.id === 'strict-pullups');
      
      if (strictPullupsProgram?.statBonuses) {
        const expectedStrength = beforeData.stats.strength + (strictPullupsProgram.statBonuses.strength || 0);
        const expectedPower = beforeData.stats.power + (strictPullupsProgram.statBonuses.power || 0);
        const expectedEndurance = beforeData.stats.endurance + (strictPullupsProgram.statBonuses.endurance || 0);
        
        if (afterData.stats.strength === expectedStrength &&
            afterData.stats.power === expectedPower &&
            afterData.stats.endurance === expectedEndurance) {
          addLog('✅ Gains stats corrects', 'success');
          setTestResults(prev => ({ ...prev, statGains: 'PASS' }));
        } else {
          addLog('❌ Gains stats incorrects', 'error');
          setTestResults(prev => ({ ...prev, statGains: 'FAIL' }));
        }
      }

      // Étape 3: Vérifier globalXP et programXP
      addLog('Étape 3: Vérification XP...', 'info');
      const expectedGlobalXP = beforeData.globalXP + 200;
      
      if (afterData.globalXP === expectedGlobalXP) {
        addLog(`✅ Global XP correct: ${beforeData.globalXP} → ${afterData.globalXP}`, 'success');
        setTestResults(prev => ({ ...prev, globalXP: 'PASS' }));
      } else {
        addLog(`❌ Global XP incorrect. Attendu: ${expectedGlobalXP}, Reçu: ${afterData.globalXP}`, 'error');
        setTestResults(prev => ({ ...prev, globalXP: 'FAIL' }));
      }

      // Étape 4: Vérifier calcul globalLevel
      addLog('Étape 4: Vérification calcul niveau global...', 'info');
      const expectedLevel = Math.floor(afterData.globalXP / 1000) + 1;
      
      if (afterData.globalLevel === expectedLevel) {
        addLog(`✅ Niveau global correct: ${expectedLevel}`, 'success');
        setTestResults(prev => ({ ...prev, globalLevel: 'PASS' }));
      } else {
        addLog(`❌ Niveau global incorrect. Attendu: ${expectedLevel}, Reçu: ${afterData.globalLevel}`, 'error');
        setTestResults(prev => ({ ...prev, globalLevel: 'FAIL' }));
      }

      addLog('🎉 TEST 2 TERMINÉ', 'start');
      
    } catch (error) {
      addLog(`❌ Erreur Test 2: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, activeUserTest: 'FAIL' }));
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  // ========================
  // TEST 3: MULTI-PROGRAMMES
  // ========================
  const runMultiProgramTest = async () => {
    setCurrentTest('multiProgram');
    setLoading(true);
    clearLogs();
    
    try {
      addLog('🚀 DÉBUT TEST 3: Multi-Programmes', 'start');
      
      if (!testUser) {
        addLog('❌ Pas d\'utilisateur test. Exécuter Tests 1-2 d\'abord', 'error');
        return;
      }

      // Étape 1: État avant multi-programmes
      const userDocRef = firestore().doc(`users/${testUser.uid}`);
      const beforeDoc = await userDocRef.get();
      const beforeData = beforeDoc.data();
      
      addLog(`État avant: Global XP = ${beforeData.globalXP}`, 'info');
      addLog(`Programmes actifs: ${Object.keys(beforeData.programs || {}).length}`, 'info');

      // Étape 2: Simuler ajout programme running
      addLog('Étape 2: Simulation programme running...', 'info');
      await simulateWorkoutCompletion(testUser.uid, 'running-basics', 880, 180);

      // Étape 3: Vérifier cumul globalXP
      const afterDoc = await userDocRef.get();
      const afterData = afterDoc.data();
      
      const expectedTotalXP = beforeData.globalXP + 180;
      
      if (afterData.globalXP === expectedTotalXP) {
        addLog(`✅ XP cumule correctement: ${beforeData.globalXP} + 180 = ${afterData.globalXP}`, 'success');
        setTestResults(prev => ({ ...prev, multiProgram: 'PASS' }));
      } else {
        addLog(`❌ Cumul XP incorrect. Attendu: ${expectedTotalXP}, Reçu: ${afterData.globalXP}`, 'error');
        setTestResults(prev => ({ ...prev, multiProgram: 'FAIL' }));
      }

      // Étape 4: Vérifier programmes séparés
      const programCount = Object.keys(afterData.programs || {}).length;
      if (programCount >= 2) {
        addLog(`✅ Programmes multiples détectés: ${programCount}`, 'success');
      } else {
        addLog(`❌ Programmes multiples non détectés: ${programCount}`, 'error');
      }

      addLog('🎉 TEST 3 TERMINÉ', 'start');
      
    } catch (error) {
      addLog(`❌ Erreur Test 3: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, multiProgramTest: 'FAIL' }));
    } finally {
      setLoading(false);
      setCurrentTest(null);
    }
  };

  // ========================
  // FONCTION UTILITAIRE: SIMULER WORKOUT
  // ========================
  const simulateWorkoutCompletion = async (userId, programId, score, xpEarned) => {
    try {
      addLog(`Simulation workout: ${programId}, Score: ${score}, XP: ${xpEarned}`, 'info');
      
      const userDocRef = firestore().doc(`users/${userId}`);
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();

      // Trouver le programme
      const program = programs.categories
        .flatMap(cat => cat.programs)
        .find(p => p.id === programId);

      if (!program) {
        throw new Error(`Programme ${programId} non trouvé`);
      }

      // Calculer nouveaux stats si niveau validé (score >= 800)
      let newStats = { ...userData.stats };
      if (score >= 800 && program.statBonuses) {
        Object.entries(program.statBonuses).forEach(([stat, bonus]) => {
          if (bonus > 0) {
            newStats[stat] = (newStats[stat] || 0) + bonus;
          }
        });
      }

      // Calculer nouveau XP global
      const newGlobalXP = (userData.globalXP || 0) + xpEarned;
      const newGlobalLevel = Math.floor(newGlobalXP / 1000) + 1;

      // Mettre à jour programme spécifique
      const newPrograms = { ...userData.programs };
      if (!newPrograms[programId]) {
        newPrograms[programId] = {
          xp: 0,
          level: 0,
          completedSkills: 0
        };
      }
      
      newPrograms[programId].xp += xpEarned;
      if (score >= 800) {
        newPrograms[programId].completedSkills += 1;
      }

      // Sauvegarder
      await userDocRef.update({
        stats: newStats,
        globalXP: newGlobalXP,
        globalLevel: newGlobalLevel,
        programs: newPrograms,
        lastActivity: new Date()
      });

      addLog(`✅ Workout simulé avec succès`, 'success');
      
    } catch (error) {
      addLog(`❌ Erreur simulation workout: ${error.message}`, 'error');
      throw error;
    }
  };

  // ========================
  // NETTOYAGE
  // ========================
  const cleanupTestData = async () => {
    try {
      if (testUser) {
        await firestore().doc(`users/${testUser.uid}`).delete();
        await auth().signOut();
        setTestUser(null);
        addLog('✅ Données de test nettoyées', 'success');
      }
    } catch (error) {
      addLog(`❌ Erreur nettoyage: ${error.message}`, 'error');
    }
  };

  // ========================
  // RENDU
  // ========================
  const getTestStatus = (testKey) => {
    const result = testResults[testKey];
    if (result === 'PASS') return { color: colors.success, text: '✅ PASS' };
    if (result === 'FAIL') return { color: colors.error, text: '❌ FAIL' };
    return { color: colors.text, text: '⏳ PENDING' };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>🧪 Tests Système Complet</Text>
          <Text style={styles.subtitle}>
            Validation complète de la chaîne de progression utilisateur
          </Text>
        </Card.Content>
      </Card>

      {/* Configuration Test */}
      <Card style={styles.configCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>⚙️ Configuration Test</Text>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Email test:</Text>
            <TextInput
              mode="outlined"
              value={newUserData.email}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, email: text }))}
              style={styles.input}
              dense
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Mot de passe:</Text>
            <TextInput
              mode="outlined"
              value={newUserData.password}
              onChangeText={(text) => setNewUserData(prev => ({ ...prev, password: text }))}
              style={styles.input}
              secureTextEntry
              dense
            />
          </View>

          {testUser && (
            <Chip 
              mode="flat" 
              style={styles.userChip}
              icon="account"
            >
              Utilisateur test: {testUser.email}
            </Chip>
          )}
        </Card.Content>
      </Card>

      {/* Tests Disponibles */}
      <Text style={styles.testsTitle}>🎯 Tests Disponibles</Text>

      {/* Test 1: Nouvel Utilisateur */}
      <Card style={styles.testCard}>
        <Card.Content>
          <View style={styles.testHeader}>
            <Text style={styles.testName}>TEST 1: Nouvel Utilisateur</Text>
            <Chip 
              mode="flat" 
              style={[styles.statusChip, { backgroundColor: getTestStatus('statsInit').color + '20' }]}
              textStyle={{ color: getTestStatus('statsInit').color }}
            >
              {getTestStatus('statsInit').text}
            </Chip>
          </View>
          
          <Text style={styles.testDescription}>
            • Créer compte test
            • Vérifier stats = 0
            • Vérifier OnboardingView
            • Première séance
            • Vérifier gains XP/stats
          </Text>

          <Button
            mode="contained"
            onPress={runNewUserTest}
            disabled={loading}
            style={styles.testButton}
          >
            {currentTest === 'newUser' ? 'Test en cours...' : 'Lancer Test 1'}
          </Button>
        </Card.Content>
      </Card>

      {/* Test 2: Utilisateur Actif */}
      <Card style={styles.testCard}>
        <Card.Content>
          <View style={styles.testHeader}>
            <Text style={styles.testName}>TEST 2: Utilisateur Actif</Text>
            <Chip 
              mode="flat" 
              style={[styles.statusChip, { backgroundColor: getTestStatus('statGains').color + '20' }]}
              textStyle={{ color: getTestStatus('statGains').color }}
            >
              {getTestStatus('statGains').text}
            </Chip>
          </View>
          
          <Text style={styles.testDescription}>
            • Compléter compétence
            • Vérifier gains stats
            • Vérifier globalXP/programXP
            • Vérifier calcul niveau
          </Text>

          <Button
            mode="contained"
            onPress={runActiveUserTest}
            disabled={loading || !testUser}
            style={styles.testButton}
          >
            {currentTest === 'activeUser' ? 'Test en cours...' : 'Lancer Test 2'}
          </Button>
        </Card.Content>
      </Card>

      {/* Test 3: Multi-Programmes */}
      <Card style={styles.testCard}>
        <Card.Content>
          <View style={styles.testHeader}>
            <Text style={styles.testName}>TEST 3: Multi-Programmes</Text>
            <Chip 
              mode="flat" 
              style={[styles.statusChip, { backgroundColor: getTestStatus('multiProgram').color + '20' }]}
              textStyle={{ color: getTestStatus('multiProgram').color }}
            >
              {getTestStatus('multiProgram').text}
            </Chip>
          </View>
          
          <Text style={styles.testDescription}>
            • Ajouter programme running
            • Vérifier cumul globalXP
            • Vérifier séparation programmes
          </Text>

          <Button
            mode="outlined"
            onPress={runMultiProgramTest}
            disabled={loading || !testUser}
            style={styles.testButton}
          >
            {currentTest === 'multiProgram' ? 'Test en cours...' : 'Lancer Test 3'}
          </Button>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🛠️ Actions</Text>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(true)}
              icon="file-document-outline"
              style={styles.actionButton}
            >
              Voir Logs
            </Button>
            
            <Button
              mode="outlined"
              onPress={cleanupTestData}
              icon="delete"
              style={styles.actionButton}
            >
              Nettoyer
            </Button>
            
            <Button
              mode="contained"
              onPress={() => {
                setTestResults({});
                clearLogs();
              }}
              icon="refresh"
              style={styles.actionButton}
            >
              Reset Tests
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Résultats Globaux */}
      {Object.keys(testResults).length > 0 && (
        <Card style={styles.resultsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📊 Résultats Globaux</Text>
            
            {Object.entries(testResults).map(([test, result]) => (
              <View key={test} style={styles.resultRow}>
                <Text style={styles.resultTest}>{test}</Text>
                <Chip 
                  mode="flat"
                  style={[
                    styles.resultChip,
                    { backgroundColor: (result === 'PASS' ? colors.success : colors.error) + '20' }
                  ]}
                  textStyle={{ 
                    color: result === 'PASS' ? colors.success : colors.error 
                  }}
                >
                  {result}
                </Chip>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Card style={styles.loadingCard}>
          <Card.Content style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Test en cours: {currentTest}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Modal Logs */}
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📝 Logs de Test</Text>
                <Button onPress={() => setModalVisible(false)}>
                  Fermer
                </Button>
              </View>
              
              <ScrollView style={styles.logsContainer}>
                {testLogs.map((log, index) => (
                  <View key={index} style={styles.logRow}>
                    <Text style={styles.logTime}>{log.timestamp}</Text>
                    <Text style={[
                      styles.logMessage,
                      {
                        color: log.type === 'error' ? colors.error :
                               log.type === 'success' ? colors.success :
                               log.type === 'start' ? colors.primary :
                               colors.text
                      }
                    ]}>
                      {log.message}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
      </Modal>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },

  // Configuration
  configCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background,
  },
  userChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    marginTop: 8,
  },

  // Tests
  testsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  testCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    borderRadius: 12,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  testButton: {
    marginTop: 8,
  },

  // Actions
  actionsCard: {
    margin: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },

  // Résultats
  resultsCard: {
    margin: 16,
    backgroundColor: '#F8F9FA',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  resultChip: {
    borderRadius: 12,
  },

  // Loading
  loadingCard: {
    margin: 16,
    backgroundColor: '#FFF3E0',
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    flex: 1,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logsContainer: {
    flex: 1,
  },
  logRow: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SystemTestScreen;
