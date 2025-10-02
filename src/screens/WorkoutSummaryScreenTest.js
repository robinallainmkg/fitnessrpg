import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Divider, Chip } from 'react-native-paper';
import WorkoutSummaryScreen from '../screens/WorkoutSummaryScreen';

/**
 * Composant de test pour WorkoutSummaryScreen avec gains de stats
 * Simule différents scénarios de fin de workout
 */
const WorkoutSummaryTest = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Scénarios de test
  const testScenarios = [
    {
      id: 'level_completed_with_gains',
      name: '✅ Niveau Validé + Gains Stats',
      description: 'Score > 800, gains de stats, pas de level up global',
      params: {
        program: {
          id: 'beginner-foundation',
          name: 'Fondations Débutant',
          icon: '🌱',
          color: '#4CAF50',
          levels: [
            { id: 1, name: 'Semaine 1-2 : Initiation' },
            { id: 2, name: 'Semaine 3-4 : Progression' }
          ]
        },
        level: {
          id: 1,
          name: 'Semaine 1-2 : Initiation',
          xpReward: 100
        }
      },
      mockSessionData: {
        score: 850,
        percentage: 85,
        xpEarned: 100,
        levelCompleted: true,
        programCompleted: false,
        exercises: [
          {
            exerciseId: 1,
            exerciseName: 'Tractions assistées',
            type: 'reps',
            target: 24,
            actual: 20,
            sets: [5, 5, 5, 5]
          },
          {
            exerciseId: 2,
            exerciseName: 'Pompes',
            type: 'reps',
            target: 40,
            actual: 35,
            sets: [10, 10, 8, 7]
          }
        ]
      },
      expectedGains: {
        strength: 3,
        power: 2,
        endurance: 1
      }
    },
    {
      id: 'program_completed_with_levelup',
      name: '🏆 Programme Complété + Level Up Global',
      description: 'Programme terminé, level up global, gains maximaux',
      params: {
        program: {
          id: 'beginner-foundation',
          name: 'Fondations Débutant',
          icon: '🌱',
          color: '#4CAF50',
          levels: [
            { id: 1, name: 'Semaine 1-2 : Initiation' },
            { id: 2, name: 'Semaine 3-4 : Progression' }
          ]
        },
        level: {
          id: 2,
          name: 'Semaine 3-4 : Progression',
          xpReward: 150
        }
      },
      mockSessionData: {
        score: 950,
        percentage: 95,
        xpEarned: 650, // Assez pour level up global
        levelCompleted: true,
        programCompleted: true,
        exercises: [
          {
            exerciseId: 1,
            exerciseName: 'Tractions strictes',
            type: 'reps',
            target: 30,
            actual: 28,
            sets: [8, 7, 7, 6]
          },
          {
            exerciseId: 2,
            exerciseName: 'Pompes diamant',
            type: 'reps',
            target: 50,
            actual: 48,
            sets: [12, 12, 12, 12]
          }
        ],
        unlockedPrograms: [
          { id: 'strict-pullups', name: 'Tractions Strictes' },
          { id: 'hanging-hollow', name: 'Hollow Body Suspendu' }
        ]
      },
      expectedGains: {
        strength: 3,
        power: 2,
        endurance: 1
      },
      expectedLevelUp: {
        newLevel: 3,
        previousLevel: 2,
        newTitle: 'Guerrier'
      }
    },
    {
      id: 'level_failed',
      name: '❌ Niveau Échoué',
      description: 'Score < 800, pas de gains, encouragement',
      params: {
        program: {
          id: 'beginner-foundation',
          name: 'Fondations Débutant',
          icon: '🌱',
          color: '#4CAF50',
          levels: [
            { id: 1, name: 'Semaine 1-2 : Initiation' }
          ]
        },
        level: {
          id: 1,
          name: 'Semaine 1-2 : Initiation',
          xpReward: 100
        }
      },
      mockSessionData: {
        score: 650,
        percentage: 65,
        xpEarned: 65,
        levelCompleted: false,
        programCompleted: false,
        exercises: [
          {
            exerciseId: 1,
            exerciseName: 'Tractions assistées',
            type: 'reps',
            target: 24,
            actual: 15,
            sets: [4, 4, 4, 3]
          },
          {
            exerciseId: 2,
            exerciseName: 'Pompes',
            type: 'reps',
            target: 40,
            actual: 26,
            sets: [8, 7, 6, 5]
          }
        ]
      }
    }
  ];

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleBackToTest = () => {
    setSelectedScenario(null);
  };

  if (selectedScenario) {
    // Simuler la navigation et le contexte pour WorkoutSummaryScreen
    const mockRoute = {
      params: selectedScenario.params
    };

    const mockNavigation = {
      goBack: handleBackToTest,
      navigate: (screen, params) => {
        console.log('Navigation vers:', screen, params);
      },
      reset: (config) => {
        console.log('Reset navigation:', config);
      }
    };

    // Mock du contexte WorkoutContext
    const mockWorkoutContext = {
      setsData: selectedScenario.mockSessionData.exercises.map(ex => ex.sets),
      completeWorkout: async () => {
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 1000));
        return selectedScenario.mockSessionData;
      },
      resetWorkout: () => {
        console.log('Reset workout');
      }
    };

    return (
      <View style={{ flex: 1 }}>
        {/* Header de test */}
        <Card style={styles.testHeader}>
          <Card.Content>
            <Text style={styles.testTitle}>🧪 Test: {selectedScenario.name}</Text>
            <Text style={styles.testDescription}>{selectedScenario.description}</Text>
            <Button mode="outlined" onPress={handleBackToTest} style={{ marginTop: 8 }}>
              ← Retour aux tests
            </Button>
          </Card.Content>
        </Card>

        {/* Rendu du WorkoutSummaryScreen avec contexte simulé */}
        {/* Note: Nécessiterait une refactorisation pour injecter les mocks */}
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.mockNote}>
            📝 Note: Pour un test complet, il faudrait injecter les mocks du contexte
          </Text>
          
          {/* Simulation visuelle des gains */}
          {selectedScenario.expectedGains && (
            <Card style={styles.mockGainsCard}>
              <Card.Content>
                <Text style={styles.mockTitle}>🎁 Gains Simulés</Text>
                {Object.entries(selectedScenario.expectedGains).map(([stat, value]) => (
                  <View key={stat} style={styles.mockStatRow}>
                    <Text style={styles.mockStatName}>
                      {stat === 'strength' ? '💪 Force' :
                       stat === 'endurance' ? '🔋 Endurance' :
                       stat === 'power' ? '⚡ Puissance' : stat}
                    </Text>
                    <Chip mode="flat" style={styles.mockStatChip}>
                      +{value}
                    </Chip>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Simulation level up */}
          {selectedScenario.expectedLevelUp && (
            <Card style={styles.mockLevelUpCard}>
              <Card.Content>
                <Text style={styles.mockLevelUpTitle}>🎉 NIVEAU GLOBAL UP !</Text>
                <Text style={styles.mockLevelUpText}>
                  Niveau {selectedScenario.expectedLevelUp.previousLevel} → 
                  Niveau {selectedScenario.expectedLevelUp.newLevel}
                </Text>
                <Chip 
                  mode="flat" 
                  style={styles.mockTitleChip}
                  icon={() => <Text>👑</Text>}
                >
                  {selectedScenario.expectedLevelUp.newTitle}
                </Chip>
              </Card.Content>
            </Card>
          )}

          {/* Données de session */}
          <Card style={styles.mockDataCard}>
            <Card.Content>
              <Text style={styles.mockTitle}>📊 Données de Session</Text>
              <Text style={styles.mockDataText}>
                Score: {selectedScenario.mockSessionData.score}/1000
              </Text>
              <Text style={styles.mockDataText}>
                Pourcentage: {selectedScenario.mockSessionData.percentage}%
              </Text>
              <Text style={styles.mockDataText}>
                XP: +{selectedScenario.mockSessionData.xpEarned}
              </Text>
              <Text style={styles.mockDataText}>
                Niveau validé: {selectedScenario.mockSessionData.levelCompleted ? '✅' : '❌'}
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>🧪 Test WorkoutSummaryScreen</Text>
          <Text style={styles.subtitle}>
            Teste les nouveaux gains de stats et level ups globaux
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>🎯 Scénarios de Test</Text>

      {testScenarios.map((scenario) => (
        <Card key={scenario.id} style={styles.scenarioCard}>
          <Card.Content>
            <Text style={styles.scenarioName}>{scenario.name}</Text>
            <Text style={styles.scenarioDescription}>
              {scenario.description}
            </Text>
            
            {/* Prévisualisation des gains */}
            {scenario.expectedGains && (
              <View style={styles.previewGains}>
                <Text style={styles.previewTitle}>Gains attendus:</Text>
                <View style={styles.previewStatsRow}>
                  {Object.entries(scenario.expectedGains).map(([stat, value]) => (
                    <Chip key={stat} mode="flat" style={styles.previewChip}>
                      +{value} {stat}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {scenario.expectedLevelUp && (
              <View style={styles.previewLevelUp}>
                <Text style={styles.previewTitle}>Level Up:</Text>
                <Text style={styles.previewLevelUpText}>
                  Niveau {scenario.expectedLevelUp.newLevel} - {scenario.expectedLevelUp.newTitle}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => handleScenarioSelect(scenario)}
              style={styles.testButton}
            >
              Tester ce scénario
            </Button>
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>ℹ️ Informations de Test</Text>
          <Text style={styles.infoText}>
            • Les gains de stats sont basés sur les statBonuses des programmes dans programs.json
          </Text>
          <Text style={styles.infoText}>
            • Le level up global se déclenche tous les 1000 XP globaux
          </Text>
          <Text style={styles.infoText}>
            • Les animations se déclenchent en séquence: score → gains → level up
          </Text>
          <Text style={styles.infoText}>
            • Les gains ne s'affichent que si le niveau est validé (score ≥ 800)
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  
  // Scénarios
  scenarioCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scenarioName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  previewGains: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewChip: {
    backgroundColor: '#E3F2FD',
  },
  previewLevelUp: {
    marginBottom: 12,
  },
  previewLevelUpText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  testButton: {
    marginTop: 8,
  },

  // Test en cours
  testHeader: {
    margin: 16,
    backgroundColor: '#FFF3E0',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  
  // Mocks visuels
  mockNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 16,
  },
  mockGainsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FF',
  },
  mockLevelUpCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
  },
  mockDataCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  mockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  mockStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mockStatName: {
    fontSize: 14,
    color: '#333',
  },
  mockStatChip: {
    backgroundColor: '#4CAF50',
  },
  mockLevelUpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 12,
  },
  mockLevelUpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  mockTitleChip: {
    backgroundColor: '#FF9800',
    alignSelf: 'center',
  },
  mockDataText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },

  // Info
  infoCard: {
    margin: 16,
    backgroundColor: '#E8F5E8',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
});

export default WorkoutSummaryTest;
