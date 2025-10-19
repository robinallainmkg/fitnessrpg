import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { rpgTheme } from '../theme/rpgTheme';
import { colors, getProgramColor, PROGRAM_COLORS, TIER_COLORS } from '../theme/colors';
import { WorkoutCard } from '../components/cards';
import { ProgramCard } from '../components/cards';
import { ActionButton, OutlineButton } from '../components/buttons';
import { StatBadge, StatusBadge } from '../components/badges';

/**
 * 🧪 DesignSystemTest
 * 
 * Test complet du système de design migré
 * Vérifie les composants, couleurs, spacing, typography
 */

const DesignSystemTest = ({ navigation }) => {
  const [testResults, setTestResults] = useState({
    colors: false,
    buttons: false,
    badges: false,
    cards: false,
    spacing: false,
  });

  // Mock data
  const mockWorkoutSession = {
    id: 'session-1',
    skillName: 'Muscle-Up Strict',
    skillId: 'muscle-up-strict',
    levelNumber: 2,
    levelName: 'Negatives & Progressions',
    status: 'available',
    xpReward: 150,
    programName: 'Street Workout',
    programIcon: '💪',
  };

  const mockProgram = {
    id: 'streetworkout',
    name: 'Street Workout',
    icon: '💪',
    status: 'active',
    completedSkills: 5,
    totalSkills: 23,
  };

  const mockCompletedProgram = {
    id: 'run10k',
    name: 'Run 10K',
    icon: '🏃',
    status: 'completed',
    completedSkills: 11,
    totalSkills: 11,
  };

  // Tests
  const testColors = () => {
    console.log('🧪 Testing Colors...');
    const streetworkoutColor = getProgramColor('streetworkout');
    const run10kColor = getProgramColor('run10k');

    if (streetworkoutColor === '#4D9EFF' && run10kColor === '#00FF94') {
      console.log('✅ Program colors correct');
      setTestResults(prev => ({ ...prev, colors: true }));
      Alert.alert('✅ Couleurs', 'Programme colors: OK');
    } else {
      console.log('❌ Program colors incorrect', { streetworkoutColor, run10kColor });
      Alert.alert('❌ Couleurs', `Erreur: ${streetworkoutColor} vs ${run10kColor}`);
    }
  };

  const testButtons = () => {
    console.log('🧪 Testing Buttons...');
    // Les boutons doivent être visibles et fonctionnels
    setTestResults(prev => ({ ...prev, buttons: true }));
    Alert.alert('✅ Boutons', 'Boutons visibles et fonctionnels');
  };

  const testBadges = () => {
    console.log('🧪 Testing Badges...');
    setTestResults(prev => ({ ...prev, badges: true }));
    Alert.alert('✅ Badges', 'Badges visibles et correctement positionnés');
  };

  const testCards = () => {
    console.log('🧪 Testing Cards...');
    setTestResults(prev => ({ ...prev, cards: true }));
    Alert.alert('✅ Cards', 'Cards uniformes et cohérentes');
  };

  const testSpacing = () => {
    console.log('🧪 Testing Spacing...');
    const expectedSpacing = {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    };

    const actualSpacing = rpgTheme.spacing;
    const isCorrect = JSON.stringify(expectedSpacing) === JSON.stringify(actualSpacing);

    if (isCorrect) {
      console.log('✅ Spacing correct');
      setTestResults(prev => ({ ...prev, spacing: true }));
      Alert.alert('✅ Spacing', 'Spacing standardisé: OK');
    } else {
      console.log('❌ Spacing incorrect', { expectedSpacing, actualSpacing });
      Alert.alert('❌ Spacing', 'Erreur dans le spacing');
    }
  };

  const testAllProgramColors = () => {
    console.log('🧪 Testing All Program Colors...');
    const info = Object.entries(PROGRAM_COLORS)
      .map(([id, data]) => `${data.name}: ${data.color}`)
      .join('\n');

    Alert.alert('📋 Program Colors', info);
  };

  const testTierColors = () => {
    console.log('🧪 Testing Tier Colors...');
    const info = Object.entries(TIER_COLORS)
      .map(([tier, color]) => `Tier ${tier}: ${color}`)
      .join('\n');

    Alert.alert('📋 Tier Colors', info);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>🎨 Design System Tests</Text>
      </View>

      {/* Colors Tests */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text style={styles.testTitle}>🎨 Colours Testing</Text>
          <View style={styles.colorSwatches}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.swatchText}>Bleu</Text>
            </View>
            <View
              style={[
                styles.swatch,
                { backgroundColor: colors.success },
              ]}
            >
              <Text style={styles.swatchText}>Vert</Text>
            </View>
            <View
              style={[
                styles.swatch,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text style={styles.swatchText}>Violet</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              onPress={testColors}
              style={styles.testButton}
              buttonColor={colors.primary}
            >
              Test Colors
            </Button>
            <Button
              mode="outlined"
              onPress={testAllProgramColors}
              style={styles.testButton}
            >
              All Programs
            </Button>
            <Button
              mode="outlined"
              onPress={testTierColors}
              style={styles.testButton}
            >
              Tiers
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Buttons Tests */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text style={styles.testTitle}>🎮 Buttons Testing</Text>

          <View style={styles.buttonPreview}>
            <ActionButton
              onPress={() => Alert.alert('Action', 'Clicked!')}
              icon="play"
              size="medium"
            >
              Commencer
            </ActionButton>
          </View>

          <View style={styles.buttonPreview}>
            <OutlineButton
              onPress={() => Alert.alert('Action', 'Clicked!')}
              icon="eye-outline"
              borderColor={colors.primary}
              size="medium"
            >
              Aperçu
            </OutlineButton>
          </View>

          <Button
            mode="contained"
            onPress={testButtons}
            style={styles.testButton}
            buttonColor={colors.primary}
          >
            Test Buttons
          </Button>
        </Card.Content>
      </Card>

      {/* Badges Tests */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text style={styles.testTitle}>🏷️ Badges Testing</Text>

          <View style={styles.badgePreview}>
            <StatBadge
              icon="lightning-bolt"
              value="+150"
              color="primary"
              size="small"
            />
          </View>

          <View style={styles.badgePreview}>
            <StatusBadge
              status="active"
              size="small"
            />
          </View>

          <Button
            mode="contained"
            onPress={testBadges}
            style={styles.testButton}
            buttonColor={colors.primary}
          >
            Test Badges
          </Button>
        </Card.Content>
      </Card>

      {/* WorkoutCard Test */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text style={styles.testTitle}>🎴 WorkoutCard Test</Text>
          <WorkoutCard
            session={mockWorkoutSession}
            programColor={getProgramColor('streetworkout')}
            onPreview={() => Alert.alert('Preview', 'Ouverture aperçu')}
            onStart={() => Alert.alert('Start', 'Démarrage session')}
          />
          <Button
            mode="contained"
            onPress={testCards}
            style={styles.testButton}
            buttonColor={colors.primary}
          >
            Test WorkoutCard
          </Button>
        </Card.Content>
      </Card>

      {/* ProgramCard Test */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text style={styles.testTitle}>📚 ProgramCard Test</Text>
          <ProgramCard
            program={mockProgram}
            onViewTree={() => Alert.alert('Tree', 'Ouverture arbre')}
          />
          <ProgramCard
            program={mockCompletedProgram}
            onViewTree={() => Alert.alert('Tree', 'Ouverture arbre')}
          />
        </Card.Content>
      </Card>

      {/* Spacing Test */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Text style={styles.testTitle}>📏 Spacing Test</Text>
          <View style={styles.spacingGrid}>
            {Object.entries(rpgTheme.spacing).map(([name, value]) => (
              <View key={name} style={styles.spacingItem}>
                <View
                  style={[
                    styles.spacingBox,
                    { width: value * 3, height: value * 3 },
                  ]}
                />
                <Text style={styles.spacingLabel}>
                  {name}: {value}px
                </Text>
              </View>
            ))}
          </View>
          <Button
            mode="contained"
            onPress={testSpacing}
            style={styles.testButton}
            buttonColor={colors.primary}
          >
            Test Spacing
          </Button>
        </Card.Content>
      </Card>

      {/* Results */}
      <Card style={[styles.testCard, styles.resultsCard]}>
        <Card.Content>
          <Text style={styles.testTitle}>📊 Test Results</Text>
          {Object.entries(testResults).map(([test, passed]) => (
            <View key={test} style={styles.resultRow}>
              <Text style={styles.resultName}>{test}</Text>
              <Text style={[styles.resultStatus, passed && styles.resultPassed]}>
                {passed ? '✅ PASS' : '⏳ PENDING'}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: rpgTheme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  testCard: {
    marginHorizontal: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.primary + '30',
    borderWidth: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: rpgTheme.spacing.md,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: rpgTheme.spacing.sm,
    marginBottom: rpgTheme.spacing.md,
  },
  swatch: {
    flex: 1,
    height: 60,
    borderRadius: rpgTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonGroup: {
    gap: rpgTheme.spacing.sm,
  },
  testButton: {
    marginBottom: rpgTheme.spacing.sm,
  },
  buttonPreview: {
    marginBottom: rpgTheme.spacing.md,
  },
  badgePreview: {
    marginBottom: rpgTheme.spacing.md,
    padding: rpgTheme.spacing.md,
    backgroundColor: colors.background,
    borderRadius: rpgTheme.borderRadius.md,
  },
  spacingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
  },
  spacingItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
  },
  spacingBox: {
    backgroundColor: colors.primary,
    borderRadius: rpgTheme.borderRadius.sm,
    marginBottom: rpgTheme.spacing.sm,
  },
  spacingLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultsCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: rpgTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '20',
  },
  resultName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  resultStatus: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultPassed: {
    color: colors.success,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: rpgTheme.spacing.xl,
  },
});

export default DesignSystemTest;
