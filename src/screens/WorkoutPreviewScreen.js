import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Text, Card, Chip, Button, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../theme/rpgTheme';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const WorkoutPreviewScreen = ({ navigation, route }) => {
  const { workout } = route.params;

  // Calcul de la durée estimée si pas fournie
  const calculateDuration = (exercises) => {
    if (workout.estimatedDuration) return workout.estimatedDuration;

    const totalTime = exercises.reduce((sum, ex) => {
      const setTime = ex.type === 'time' ? ex.target : 45; // 45s par set de reps
      return sum + (ex.sets * (setTime + ex.rest));
    }, 0);
    return Math.ceil(totalTime / 60); // en minutes
  };

  // Calcul du nombre total de séries
  const totalSets = workout.exercises?.reduce((sum, ex) => sum + ex.sets, 0) || 0;

  // Couleur selon difficulté
  const getDifficultyColor = (difficulty) => {
    const difficultyMap = {
      'Débutant': '#22C55E',
      'Intermédiaire': '#3B82F6',
      'Avancé': '#F59E0B',
      'Expert': '#EF4444',
      'Maître': '#A855F7'
    };
    return difficultyMap[difficulty] || '#6B7A99';
  };

  const handleStartWorkout = () => {
    // Navigation vers WorkoutScreen avec les données du workout
    navigation.navigate('Workout', { workout });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require('../assets/Home-BG-0.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={rpgTheme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Aperçu de l'entraînement</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Info Card */}
            <Card style={styles.mainCard}>
              <LinearGradient
                colors={rpgTheme.colors.gradients.cardBorder}
                style={styles.cardGradient}
              >
                <Card.Content style={styles.cardContent}>
                  <Text style={styles.workoutTitle}>{workout.name}</Text>
                  <Text style={styles.workoutSubtitle}>{workout.subtitle}</Text>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <View style={[styles.statIcon, { backgroundColor: rpgTheme.colors.neon.blue + '20' }]}>
                        <Icon name="dumbbell" size={20} color={rpgTheme.colors.neon.blue} />
                      </View>
                      <Text style={styles.statValue}>{workout.exercises?.length || 0}</Text>
                      <Text style={styles.statLabel}>Exercices</Text>
                    </View>

                    <View style={styles.statItem}>
                      <View style={[styles.statIcon, { backgroundColor: rpgTheme.colors.neon.purple + '20' }]}>
                        <Icon name="counter" size={20} color={rpgTheme.colors.neon.purple} />
                      </View>
                      <Text style={styles.statValue}>{totalSets}</Text>
                      <Text style={styles.statLabel}>Séries</Text>
                    </View>

                    <View style={styles.statItem}>
                      <View style={[styles.statIcon, { backgroundColor: rpgTheme.colors.neon.cyan + '20' }]}>
                        <Icon name="clock-outline" size={20} color={rpgTheme.colors.neon.cyan} />
                      </View>
                      <Text style={styles.statValue}>{calculateDuration(workout.exercises)}</Text>
                      <Text style={styles.statLabel}>Minutes</Text>
                    </View>

                    <View style={styles.statItem}>
                      <View style={[styles.statIcon, { backgroundColor: getDifficultyColor(workout.difficulty) + '20' }]}>
                        <Icon name="chart-line" size={20} color={getDifficultyColor(workout.difficulty)} />
                      </View>
                      <Text style={styles.statValue}>{workout.difficulty}</Text>
                      <Text style={styles.statLabel}>Niveau</Text>
                    </View>
                  </View>

                  {/* XP Reward Badge */}
                  <View style={styles.xpBadge}>
                    <LinearGradient
                      colors={rpgTheme.colors.gradients.xpBar}
                      style={styles.xpGradient}
                    >
                      <Icon name="star" size={16} color="#FFD700" />
                      <Text style={styles.xpText}>+{workout.xpReward || 0} XP</Text>
                    </LinearGradient>
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>

            {/* Exercises List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Exercices</Text>
              {workout.exercises?.map((exercise, index) => (
                <Card key={index} style={styles.exerciseCard}>
                  <Card.Content style={styles.exerciseContent}>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                      </View>
                    </View>

                    <View style={styles.exerciseDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Séries:</Text>
                        <Text style={styles.detailValue}>{exercise.sets}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {exercise.type === 'time' ? 'Durée:' : 'Répétitions:'}
                        </Text>
                        <Text style={styles.detailValue}>
                          {exercise.type === 'time' ? `${exercise.target}s` : exercise.target}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Repos:</Text>
                        <Text style={styles.detailValue}>{Math.floor(exercise.rest / 60)}min {exercise.rest % 60}s</Text>
                      </View>

                      {exercise.rpe && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Intensité:</Text>
                          <Text style={styles.detailValue}>{exercise.rpe}</Text>
                        </View>
                      )}
                    </View>

                    {exercise.tips && (
                      <View style={styles.tipsContainer}>
                        <Text style={styles.tipsLabel}>💡 Conseil:</Text>
                        <Text style={styles.tipsText}>{exercise.tips}</Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>

            {/* Tips Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Conseils pour réussir</Text>
              <Card style={styles.tipsCard}>
                <Card.Content>
                  <View style={styles.tipsList}>
                    <View style={styles.tipItem}>
                      <Icon name="water" size={20} color={rpgTheme.colors.neon.cyan} />
                      <Text style={styles.tipText}>Hydrate-toi régulièrement pendant la séance</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Icon name="target" size={20} color={rpgTheme.colors.neon.green} />
                      <Text style={styles.tipText}>Concentre-toi sur la qualité des mouvements</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Icon name="clock-outline" size={20} color={rpgTheme.colors.neon.purple} />
                      <Text style={styles.tipText}>Respecte les temps de repos entre les séries</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Icon name="heart" size={20} color={rpgTheme.colors.neon.pink} />
                      <Text style={styles.tipText}>Écoute ton corps et ajuste si nécessaire</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Bottom Spacer for Fixed Button */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Fixed CTA Button */}
          <View style={styles.ctaContainer}>
            <LinearGradient
              colors={rpgTheme.colors.gradients.primary}
              style={styles.ctaGradient}
            >
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleStartWorkout}
              >
                <Icon name="play" size={24} color="#FFFFFF" />
                <Text style={styles.ctaText}>Commencer l'entraînement</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rpgTheme.colors.background.overlay,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpgTheme.spacing.md,
    paddingVertical: rpgTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: rpgTheme.colors.neon.blue + '30',
  },
  backButton: {
    padding: rpgTheme.spacing.sm,
    borderRadius: 8,
    backgroundColor: rpgTheme.colors.background.card + '80',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: rpgTheme.typography.sizes.heading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: rpgTheme.spacing.md,
  },
  mainCard: {
    marginBottom: rpgTheme.spacing.md,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    padding: rpgTheme.spacing.lg,
  },
  workoutTitle: {
    fontSize: rpgTheme.typography.sizes.title,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.xs,
  },
  workoutSubtitle: {
    fontSize: rpgTheme.typography.sizes.subheading,
    color: rpgTheme.colors.neon.blue,
    marginBottom: rpgTheme.spacing.md,
  },
  workoutDescription: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: rpgTheme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: rpgTheme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rpgTheme.spacing.xs,
  },
  statValue: {
    fontSize: rpgTheme.typography.sizes.heading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.xs,
  },
  statLabel: {
    fontSize: rpgTheme.typography.sizes.caption,
    color: rpgTheme.colors.text.secondary,
    textAlign: 'center',
  },
  xpBadge: {
    alignSelf: 'center',
  },
  xpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpgTheme.spacing.md,
    paddingVertical: rpgTheme.spacing.sm,
    borderRadius: 20,
  },
  xpText: {
    color: '#FFD700',
    fontWeight: rpgTheme.typography.weights.bold,
    marginLeft: rpgTheme.spacing.xs,
  },
  section: {
    marginBottom: rpgTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: rpgTheme.typography.sizes.heading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.md,
  },
  exerciseCard: {
    backgroundColor: rpgTheme.colors.background.card,
    marginBottom: rpgTheme.spacing.sm,
    borderWidth: 1,
    borderColor: rpgTheme.colors.neon.blue + '30',
  },
  exerciseContent: {
    padding: rpgTheme.spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: rpgTheme.spacing.md,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: rpgTheme.colors.neon.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rpgTheme.spacing.md,
  },
  exerciseNumberText: {
    color: '#FFFFFF',
    fontWeight: rpgTheme.typography.weights.bold,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: rpgTheme.typography.sizes.subheading,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.xs,
  },
  exerciseDescription: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.text.secondary,
    lineHeight: 20,
  },
  exerciseDetails: {
    backgroundColor: rpgTheme.colors.background.secondary + '50',
    padding: rpgTheme.spacing.md,
    borderRadius: 8,
    marginBottom: rpgTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rpgTheme.spacing.xs,
  },
  detailLabel: {
    fontSize: rpgTheme.typography.sizes.caption,
    color: rpgTheme.colors.text.secondary,
  },
  detailValue: {
    fontSize: rpgTheme.typography.sizes.caption,
    fontWeight: rpgTheme.typography.weights.medium,
    color: rpgTheme.colors.text.primary,
  },
  tipsContainer: {
    backgroundColor: rpgTheme.colors.neon.green + '10',
    padding: rpgTheme.spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: rpgTheme.colors.neon.green,
  },
  tipsLabel: {
    fontSize: rpgTheme.typography.sizes.caption,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: rpgTheme.colors.neon.green,
    marginBottom: rpgTheme.spacing.xs,
  },
  tipsText: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.text.secondary,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: rpgTheme.colors.background.card,
    borderWidth: 1,
    borderColor: rpgTheme.colors.neon.purple + '30',
  },
  tipsList: {
    gap: rpgTheme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.text.secondary,
    marginLeft: rpgTheme.spacing.sm,
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: rpgTheme.spacing.md,
    backgroundColor: rpgTheme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: rpgTheme.colors.neon.blue + '30',
  },
  ctaGradient: {
    borderRadius: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rpgTheme.spacing.md,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: rpgTheme.typography.sizes.subheading,
    fontWeight: rpgTheme.typography.weights.bold,
    marginLeft: rpgTheme.spacing.sm,
  },
});

export default WorkoutPreviewScreen;