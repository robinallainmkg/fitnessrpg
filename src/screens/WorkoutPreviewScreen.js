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
    // Reconstruire program et level pour WorkoutScreen
    const program = {
      id: workout.programId || 'beginner-foundation',
      name: workout.programName || workout.name?.split(' - ')[0] || 'Programme',
    };
    
    const level = {
      id: workout.id || 1,
      name: workout.name || 'Niveau 1',
      subtitle: workout.subtitle || '',
      xpReward: workout.xpReward || 100,
      exercises: workout.exercises || []
    };
    
    console.log('🚀 Démarrage workout avec program:', program, 'level:', level);
    
    // Navigation vers WorkoutScreen avec program et level
    navigation.navigate('Workout', { program, level });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require('../../assets/Home-BG-0.jpg')}
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

                  {/* Stats Grid - 2 lignes de 2 colonnes */}
                  <View style={styles.statsGrid}>
                    {/* Première ligne */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                          <Icon name="dumbbell" size={20} color="#7B61FF" />
                        </View>
                        <Text style={styles.statValue}>{workout.exercises?.length || 0}</Text>
                        <Text style={styles.statLabel}>Exercices</Text>
                      </View>

                      <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                          <Icon name="counter" size={20} color="#7B61FF" />
                        </View>
                        <Text style={styles.statValue}>{totalSets}</Text>
                        <Text style={styles.statLabel}>Séries</Text>
                      </View>
                    </View>

                    {/* Deuxième ligne */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                          <Icon name="clock-outline" size={20} color="#7B61FF" />
                        </View>
                        <Text style={styles.statValue}>{calculateDuration(workout.exercises)}</Text>
                        <Text style={styles.statLabel}>Minutes</Text>
                      </View>

                      <View style={styles.statItem}>
                        <View style={styles.statIcon}>
                          <Icon name="chart-line" size={20} color="#7B61FF" />
                        </View>
                        <Text style={styles.statValue}>{workout.difficulty}</Text>
                        <Text style={styles.statLabel}>Niveau</Text>
                      </View>
                    </View>
                  </View>

                  {/* XP Reward Badge */}
                  <View style={styles.xpBadge}>
                    <View style={styles.xpGradient}>
                      <Icon name="star" size={16} color="#E9D5FF" />
                      <Text style={styles.xpText}>+{workout.xpReward || 0} XP</Text>
                    </View>
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
                      <Icon name="water" size={20} color="#7B61FF" />
                      <Text style={styles.tipText}>Hydrate-toi régulièrement pendant la séance</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Icon name="target" size={20} color="#7B61FF" />
                      <Text style={styles.tipText}>Concentre-toi sur la qualité des mouvements</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Icon name="clock-outline" size={20} color="#7B61FF" />
                      <Text style={styles.tipText}>Respecte les temps de repos entre les séries</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Icon name="heart" size={20} color="#7B61FF" />
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
            <View style={styles.ctaGradient}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleStartWorkout}
              >
                <Icon name="play" size={24} color="#FFFFFF" />
                <Text style={styles.ctaText}>Commencer l'entraînement</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 40, // ✅ Ajouté pour descendre le contenu
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpgTheme.spacing.md,
    paddingVertical: rpgTheme.spacing.md, // Augmenté de sm à md
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 97, 255, 0.3)', // ✅ Violet plus doux
  },
  backButton: {
    padding: rpgTheme.spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 30, 50, 0.8)', // ✅ Fond sombre adouci
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
    marginTop: rpgTheme.spacing.sm, // ✅ Espace supplémentaire en haut
    backgroundColor: 'transparent',
    elevation: 0,
  },
  cardGradient: {
    borderRadius: 16,
    borderWidth: 2, // ✅ Bordure ajoutée
    borderColor: 'rgba(123, 97, 255, 0.3)', // ✅ Violet doux
  },
  cardContent: {
    padding: rpgTheme.spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // ✅ Fond sombre/transparent
    borderRadius: 14,
  },
  workoutTitle: {
    fontSize: rpgTheme.typography.sizes.title,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.xs,
  },
  workoutSubtitle: {
    fontSize: rpgTheme.typography.sizes.subheading,
    color: '#94A3B8', // ✅ Gris doux au lieu de bleu néon
    marginBottom: rpgTheme.spacing.md,
  },
  workoutDescription: {
    fontSize: rpgTheme.typography.sizes.body,
    color: '#CBD5E1', // ✅ Gris clair adouci
    lineHeight: 22,
    marginBottom: rpgTheme.spacing.lg,
  },
  statsGrid: {
    marginBottom: rpgTheme.spacing.lg,
    gap: rpgTheme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: rpgTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: rpgTheme.spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rpgTheme.spacing.xs,
    backgroundColor: 'rgba(123, 97, 255, 0.15)', // ✅ Violet adouci uniforme
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.4)',
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
    marginTop: rpgTheme.spacing.sm,
  },
  xpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpgTheme.spacing.md,
    paddingVertical: rpgTheme.spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(123, 97, 255, 0.2)', // ✅ Fond violet doux
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.5)',
  },
  xpText: {
    color: '#E9D5FF', // ✅ Violet clair adouci au lieu d'or
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
    backgroundColor: 'rgba(30, 30, 50, 0.6)', // ✅ Fond sombre adouci
    marginBottom: rpgTheme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)', // ✅ Bordure violette douce
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
    backgroundColor: 'rgba(123, 97, 255, 0.8)', // ✅ Violet adouci
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // ✅ Fond sombre doux
    padding: rpgTheme.spacing.md,
    borderRadius: 8,
    marginBottom: rpgTheme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.2)',
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
    backgroundColor: 'rgba(123, 97, 255, 0.1)', // ✅ Violet très doux
    padding: rpgTheme.spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7B61FF', // ✅ Violet principal
  },
  tipsLabel: {
    fontSize: rpgTheme.typography.sizes.caption,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: '#C4B5FD', // ✅ Violet clair
    marginBottom: rpgTheme.spacing.xs,
  },
  tipsText: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.text.secondary,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: 'rgba(30, 30, 50, 0.6)', // ✅ Fond sombre adouci
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)', // ✅ Bordure violette douce
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
    backgroundColor: 'rgba(10, 14, 39, 0.95)', // ✅ Fond sombre semi-transparent
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 97, 255, 0.3)', // ✅ Bordure violette douce
  },
  ctaGradient: {
    borderRadius: 12,
    backgroundColor: '#7B61FF', // ✅ Violet principal au lieu de gradient
    borderWidth: 2,
    borderColor: '#9F7AEA', // ✅ Bordure violet clair
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