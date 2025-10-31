import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Animated
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { useWorkout } from '../contexts/WorkoutContext';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { calculateWorkoutScore, isLevelCompleted } from '../utils/scoring';
import firestore from '@react-native-firebase/firestore';

const WorkoutSummaryScreen = ({ route, navigation }) => {
  const { program, level } = route.params;
  const { setsData, completeWorkout, resetWorkout } = useWorkout();
  const { user, isGuest } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [gainsAnim] = useState(new Animated.Value(0));
  const [levelUpAnim] = useState(new Animated.Value(0));
  const [statGains, setStatGains] = useState(null);
  const [globalLevelUp, setGlobalLevelUp] = useState(null);
  const [previousGlobalLevel, setPreviousGlobalLevel] = useState(0);

  useEffect(() => {
    finalizeWorkout();
  }, []);

  const calculateStatGains = async (levelCompleted) => {
    if (!levelCompleted || !user?.uid) {
      console.log('⏭️ Skip calculateStatGains - no level completed or no user');
      return null;
    }
    
    console.log('🎯 Calculating stat gains for user:', user.uid, isGuest ? '(guest)' : '(authenticated)');

    try {
      // Récupérer les données utilisateur actuelles
      const userDocRef = firestore().doc(`users/${user.uid}`);
      const userDoc = await userDocRef.get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const currentStats = userData.stats || {};
      const currentGlobalXP = userData.globalXP || 0;

      // TODO: Adapter pour nouvelle architecture - temporairement désactivé
      // Trouver le programme actuel dans programs.json
      /* 
      const currentProgram = programs.categories
        .flatMap(cat => cat.programs)
        .find(p => p.id === program.id);

      if (!currentProgram?.statBonuses) return null;
      */

      // Utiliser directement les statBonuses du programme passé en paramètre
      if (!program?.statBonuses) return null;

      // Calculer le niveau global actuel
      const currentGlobalLevel = Math.floor(currentGlobalXP / 1000) + 1;
      setPreviousGlobalLevel(currentGlobalLevel);

      // Calculer les gains de stats
      const gains = {
        strength: program.statBonuses.strength || 0,
        endurance: program.statBonuses.endurance || 0,
        power: program.statBonuses.power || 0,
        speed: program.statBonuses.speed || 0,
        flexibility: program.statBonuses.flexibility || 0
      };

      // Calculer le nouveau XP global et vérifier le level up
      const xpFromSession = sessionData?.xpEarned || 0;
      const newGlobalXP = currentGlobalXP + xpFromSession;
      const newGlobalLevel = Math.floor(newGlobalXP / 1000) + 1;

      let levelUpInfo = null;
      if (newGlobalLevel > currentGlobalLevel) {
        const getTitleForLevel = (level) => {
          if (level >= 10) return "Légende";
          if (level >= 7) return "Champion";
          if (level >= 4) return "Guerrier";
          if (level >= 2) return "Apprenti";
          return "Débutant";
        };

        levelUpInfo = {
          newLevel: newGlobalLevel,
          previousLevel: currentGlobalLevel,
          newTitle: getTitleForLevel(newGlobalLevel)
        };
      }

      return { gains, levelUpInfo };
    } catch (error) {
      console.error('Erreur calcul gains:', error);
      return null;
    }
  };

  const finalizeWorkout = async () => {
    try {
      setLoading(true);
      const result = await completeWorkout();
      setSessionData(result);
      
      console.log('💾 Workout completed - result:', result);
      
      // ═══ SAUVEGARDE DES XP ═══
      if (result.xpEarned && user?.uid) {
        console.log('⭐ Updating user XP: +', result.xpEarned);
        const userDocRef = firestore().doc(`users/${user.uid}`);
        const userDoc = await userDocRef.get();
        const currentXP = userDoc.data()?.totalXP || 0;
        const newXP = currentXP + result.xpEarned;
        
        // Calculer le nouveau niveau global (1000 XP = 1 niveau)
        const newGlobalLevel = Math.floor(newXP / 1000) + 1;
        
        await userDocRef.update({
          totalXP: newXP,
          globalXP: newXP,
          globalLevel: newGlobalLevel,
          lastXPUpdate: firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ XP updated:', currentXP, '→', newXP, '| Level:', newGlobalLevel);
      }
      
      // ═══ SAUVEGARDE DE LA PROGRESSION SI NIVEAU VALIDÉ ═══
      const levelValidated = result.levelCompleted || isLevelCompleted(result.score);
      if (levelValidated && user?.uid) {
        console.log('🎯 Level validated - updating progression for program:', program.id, 'level:', level.id);
        
        // Mettre à jour la progression du programme dans userProgress
        const categoryId = program.category || program.id;
        const progressRef = firestore().doc(`userProgress/${user.uid}_${categoryId}`);
        const progressDoc = await progressRef.get();
        const currentProgress = progressDoc.exists ? progressDoc.data() : {};
        
        // Mettre à jour skillProgress
        const skillProgress = currentProgress.skillProgress || {};
        const skillId = program.id; // ex: "beginner-foundation"
        const currentSkillData = skillProgress[skillId] || { completedLevels: [], currentLevel: 1 };
        
        // Ajouter le niveau complété
        const newCompletedLevels = [...currentSkillData.completedLevels];
        if (!newCompletedLevels.includes(level.id)) {
          newCompletedLevels.push(level.id);
          console.log(`✅ Level ${level.id} completed for skill ${skillId}`);
        }
        
        // Calculer le nouveau niveau actuel
        const nextLevel = Math.max(...newCompletedLevels) + 1;
        
        skillProgress[skillId] = {
          completedLevels: newCompletedLevels,
          currentLevel: nextLevel
        };
        
        // Vérifier si la compétence est 100% complétée
        const totalLevels = 6; // TODO: Récupérer dynamiquement
        const isSkillComplete = newCompletedLevels.length >= totalLevels;
        
        const completedSkills = [...(currentProgress.completedSkills || [])];
        if (isSkillComplete && !completedSkills.includes(skillId)) {
          completedSkills.push(skillId);
          console.log(`🏆 Skill ${skillId} 100% completed!`);
        }
        
        await progressRef.set({
          ...currentProgress,
          skillProgress,
          completedSkills,
          lastSessionAt: firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Progression saved:', { skillId, completedLevels: newCompletedLevels, currentLevel: nextLevel });
        
        // Calculer les gains de stats
        const gainsData = await calculateStatGains(true);
        if (gainsData) {
          setStatGains(gainsData.gains);
          setGlobalLevelUp(gainsData.levelUpInfo);
        }
      }
      
      // Animations séquentielles
      if (result.programCompleted) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Animation des gains après un délai
      if (levelValidated) {
        setTimeout(() => {
          Animated.timing(gainsAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }, 1000);

        // Animation level up après les gains
        if (globalLevelUp) {
          setTimeout(() => {
            Animated.spring(levelUpAnim, {
              toValue: 1,
              tension: 50,
              friction: 4,
              useNativeDriver: true,
            }).start();
          }, 1800);
        }
      }
    } catch (error) {
      console.error('Erreur finalisation:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre séance');
    } finally {
      setLoading(false);
    }
  };

  const navigateToProgress = () => {
    resetWorkout();
    navigation.navigate('Main', { 
      screen: 'Progress' 
    });
  };

  const navigateToNextLevel = () => {
    resetWorkout();
    // Retourner vers le détail de la compétence - l'utilisateur pourra voir le niveau suivant débloqué
    navigation.navigate('SkillDetail', { 
      program,
      userProgress: sessionData?.userProgress || null
    });
  };

  const navigateToHome = () => {
    resetWorkout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  const navigateToNewPrograms = () => {
    resetWorkout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  const shareSuccess = async () => {
    try {
      await Share.share({
        message: `Je viens de maîtriser la compétence ${program.name} sur Fitness Game ! 💪`,
        title: 'Ma réussite Fitness Game'
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          Sauvegarde de votre séance...
        </Text>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Erreur lors de la sauvegarde
        </Text>
        <Button onPress={() => navigation.goBack()}>
          Retour
        </Button>
      </View>
    );
  }

  const levelValidated = sessionData.levelCompleted || isLevelCompleted(sessionData.score);
  const programCompleted = sessionData.programCompleted || false;
  const unlockedPrograms = sessionData.unlockedPrograms || [];
  const isLastLevel = level.id === (program.levels?.length || 1); // ✅ Protection

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bouton retour personnalisé */}
      <View style={styles.backButtonContainer}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          icon="arrow-left"
          labelStyle={{ color: colors.primary }}
        >
          Retour
        </Button>
      </View>

      {/* Header de félicitations */}
      <View style={styles.header}>
        <Text style={styles.congratsIcon}>
          {programCompleted ? '🎉' : levelValidated ? '🎉' : '💪'}
        </Text>
        <Text style={styles.title}>
          {programCompleted ? 'COMPÉTENCE MAÎTRISÉE !' : levelValidated ? 'Félicitations !' : 'Séance terminée !'}
        </Text>
        <Text style={styles.subtitle}>
          {level.name} - {program.name}
        </Text>
      </View>

      {/* Card de programme complété */}
      {programCompleted && (
        <Animated.View 
          style={[
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Card style={[styles.completionCard, styles.successGradient]}>
            <Card.Content style={styles.completionContent}>
              <Text style={styles.completionIcon}>🎉</Text>
              <Text style={styles.completionTitle}>COMPÉTENCE MAÎTRISÉE !</Text>
              <Text style={styles.completionMessage}>
                Félicitations ! Tu as maîtrisé la compétence {program.name}
              </Text>
              <View style={styles.bonusXPContainer}>
                <Text style={styles.bonusXPLabel}>XP Bonus</Text>
                <Text style={styles.bonusXPValue}>+500 XP</Text>
              </View>
              
              {/* Bouton de partage */}
              <Button
                mode="outlined"
                onPress={shareSuccess}
                style={styles.shareButton}
                icon="share-variant"
                labelStyle={{ color: colors.success }}
              >
                Partager ma réussite
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Programmes débloqués */}
      {programCompleted && unlockedPrograms.length > 0 && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card style={styles.unlockedCard}>
            <Card.Content>
              <Text style={styles.unlockedTitle}>
                🔓 Nouvelles compétences débloquées :
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.unlockedScrollView}
              >
                {unlockedPrograms.map((programName, index) => (
                  <Card key={index} style={styles.unlockedProgramCard}>
                    <Card.Content style={styles.unlockedProgramContent}>
                      <Text style={styles.unlockedProgramIcon}>🚀</Text>
                      <Text style={styles.unlockedProgramName}>
                        {programName}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </ScrollView>
              
              <Button
                mode="contained"
                onPress={navigateToNewPrograms}
                style={styles.discoverButton}
                contentStyle={styles.discoverButtonContent}
              >
                Découvrir
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Score principal */}
      <Card style={styles.scoreCard}>
        <Card.Content style={styles.scoreContent}>
          <Text style={styles.scoreLabel}>Votre score</Text>
          <Text style={[
            styles.scoreValue,
            { color: levelValidated ? colors.success : colors.warning }
          ]}>
            {sessionData.score}/1000
          </Text>
          <Text style={styles.percentageValue}>
            {sessionData.percentage}%
          </Text>
          
          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>XP gagnés</Text>
            <Text style={styles.xpValue}>+{sessionData.xpEarned} XP</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Gains de stats - Affiché uniquement si niveau complété */}
      {levelValidated && statGains && (
        <Animated.View style={{ opacity: gainsAnim }}>
          <Card style={styles.gainsCard}>
            <Card.Content style={styles.gainsContent}>
              <Text style={styles.gainsTitle}>🎁 Gains de Stats</Text>
              <Text style={styles.gainsSubtitle}>
                Compétence maîtrisée - Tes caractéristiques augmentent !
              </Text>
              
              {/* XP Global gagné */}
              <View style={styles.xpGlobalContainer}>
                <View style={styles.xpGlobalRow}>
                  <Text style={styles.xpGlobalIcon}>✨</Text>
                  <Text style={styles.xpGlobalLabel}>XP Global</Text>
                  <Chip 
                    mode="flat" 
                    style={styles.xpGlobalChip}
                    textStyle={styles.xpGlobalChipText}
                  >
                    +{sessionData.xpEarned} XP
                  </Chip>
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                {Object.entries(statGains)
                  .filter(([stat, value]) => value > 0)
                  .map(([stat, value]) => {
                    const statIcons = {
                      strength: '💪',
                      endurance: '🔋',
                      power: '⚡',
                      speed: '💨',
                      flexibility: '🤸'
                    };
                    const statLabels = {
                      strength: 'Force',
                      endurance: 'Endurance',
                      power: 'Puissance',
                      speed: 'Vitesse',
                      flexibility: 'Flexibilité'
                    };

                    return (
                      <View key={stat} style={styles.statGainRow}>
                        <View style={styles.statIconContainer}>
                          <Text style={styles.statIcon}>{statIcons[stat]}</Text>
                        </View>
                        <View style={styles.statInfo}>
                          <Text style={styles.statName}>{statLabels[stat]}</Text>
                          <Text style={styles.statGainValue}>+{value}</Text>
                        </View>
                        <Chip 
                          mode="flat" 
                          style={styles.statGainChip}
                          textStyle={styles.statGainChipText}
                        >
                          +{value}
                        </Chip>
                      </View>
                    );
                  })
                }
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Level Up Global */}
      {globalLevelUp && (
        <Animated.View 
          style={[
            { 
              opacity: levelUpAnim, 
              transform: [{ scale: levelUpAnim }] 
            }
          ]}
        >
          <Card style={styles.levelUpCard}>
            <Card.Content style={styles.levelUpContent}>
              <Text style={styles.levelUpIcon}>🎉</Text>
              <Text style={styles.levelUpTitle}>NIVEAU GLOBAL UP !</Text>
              <Text style={styles.levelUpMessage}>
                Tu es maintenant niveau {globalLevelUp.newLevel} - {globalLevelUp.newTitle} !
              </Text>
              <View style={styles.levelUpDetails}>
                <Text style={styles.levelUpFrom}>
                  Niveau {globalLevelUp.previousLevel} → Niveau {globalLevelUp.newLevel}
                </Text>
                <Chip 
                  mode="flat" 
                  style={styles.titleChip}
                  textStyle={styles.titleChipText}
                  icon={() => <Text style={styles.titleChipIcon}>👑</Text>}
                >
                  {globalLevelUp.newTitle}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      )}

      {/* Message de validation */}
      {levelValidated && (
        <Card style={[styles.messageCard, styles.successCard]}>
          <Card.Content style={styles.messageContent}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Niveau validé !</Text>
            <Text style={styles.successMessage}>
              {isLastLevel 
                ? 'Vous avez terminé le programme ! Vous êtes maintenant un maître du muscle-up ! 🏆'
                : `Le niveau ${level.id + 1} est maintenant débloqué !`
              }
            </Text>
          </Card.Content>
        </Card>
      )}

      {!levelValidated && (
        <Card style={[styles.messageCard, styles.encouragementCard]}>
          <Card.Content style={styles.messageContent}>
            <Text style={styles.encouragementIcon}>🔥</Text>
            <Text style={styles.encouragementTitle}>Continue comme ça !</Text>
            <Text style={styles.encouragementMessage}>
              Il vous faut 800+ points pour valider le niveau. Réessayez pour débloquer le suivant !
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Détail des exercices */}
      <Card style={styles.detailCard}>
        <Card.Content style={styles.detailContent}>
          <Text style={styles.detailTitle}>Détail de votre performance</Text>
          
          {sessionData.exercises.map((exercise, index) => {
            const percentage = exercise.target > 0 
              ? Math.round((exercise.actual / exercise.target) * 100)
              : 0;
            
            return (
              <View key={exercise.exerciseId} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {exercise.exerciseName}
                  </Text>
                  <Text style={styles.exerciseResult}>
                    {exercise.actual}/{exercise.target} {exercise.type === 'time' ? 's' : 'reps'}
                  </Text>
                </View>
                
                <Chip 
                  mode="flat"
                  style={[
                    styles.performanceChip,
                    { 
                      backgroundColor: percentage >= 100 
                        ? colors.success + '20'
                        : percentage >= 80 
                        ? colors.warning + '20'
                        : colors.error + '20'
                    }
                  ]}
                  textStyle={[
                    styles.performanceChipText,
                    {
                      color: percentage >= 100 
                        ? colors.success
                        : percentage >= 80 
                        ? colors.warning
                        : colors.error
                    }
                  ]}
                >
                  {percentage}%
                </Chip>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Boutons d'actions */}
      <View style={styles.actionsContainer}>
        {!programCompleted && (
          <Button
            mode="outlined"
            onPress={navigateToProgress}
            style={styles.actionButton}
            labelStyle={{ color: colors.primary }}
          >
            Voir ma progression
          </Button>
        )}

        {programCompleted ? (
          <>
            {/* Boutons pour compétence maîtrisée */}
            <Button
              mode="contained"
              onPress={navigateToHome}
              style={[styles.actionButton, styles.primaryButton]}
              contentStyle={styles.primaryButtonContent}
            >
              Retour à l'accueil
            </Button>
            
            {unlockedPrograms.length > 0 && (
              <Button
                mode="outlined"
                onPress={navigateToNewPrograms}
                style={styles.actionButton}
                labelStyle={{ color: colors.warning }}
              >
                Voir les nouvelles compétences
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Boutons pour progression normale */}
            {levelValidated && !isLastLevel && (
              <Button
                mode="contained"
                onPress={navigateToNextLevel}
                style={[styles.actionButton, styles.primaryButton]}
                contentStyle={styles.primaryButtonContent}
              >
                Niveau suivant
              </Button>
            )}

            {!levelValidated && (
              <Button
                mode="contained"
                onPress={() => {
                  resetWorkout();
                  navigation.navigate('Workout', { program, level });
                }}
                style={[styles.actionButton, styles.primaryButton]}
                contentStyle={styles.primaryButtonContent}
              >
                Réessayer
              </Button>
            )}

            <Button
              mode="text"
              onPress={navigateToHome}
              style={styles.actionButton}
              labelStyle={{ color: colors.textSecondary }}
            >
              Retour à l'accueil
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  backButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    elevation: 6,
  },
  scoreContent: {
    alignItems: 'center',
    padding: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  percentageValue: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  xpLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.warning,
  },
  messageCard: {
    marginBottom: 16,
    elevation: 4,
  },
  successCard: {
    backgroundColor: colors.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  encouragementCard: {
    backgroundColor: colors.warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  messageContent: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  encouragementIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.warning,
    marginBottom: 8,
  },
  encouragementMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailCard: {
    backgroundColor: colors.surface,
    marginBottom: 24,
    elevation: 4,
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  exerciseResult: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  performanceChip: {
    marginLeft: 12,
  },
  performanceChipText: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonContent: {
    paddingVertical: 8,
  },
  // Styles pour la complétion de programme
  completionCard: {
    elevation: 8,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  successGradient: {
    backgroundColor: colors.success,
    borderLeftWidth: 6,
    borderLeftColor: colors.warning,
  },
  completionContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  completionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 8,
  },
  completionMessage: {
    fontSize: 16,
    color: colors.background,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  bonusXPContainer: {
    backgroundColor: colors.background + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  bonusXPLabel: {
    color: colors.background,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  bonusXPValue: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shareButton: {
    borderColor: colors.background,
    borderWidth: 2,
  },
  // Styles pour les programmes débloqués
  unlockedCard: {
    elevation: 6,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  unlockedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockedScrollView: {
    marginBottom: 16,
  },
  unlockedProgramCard: {
    marginRight: 12,
    minWidth: 120,
    backgroundColor: colors.card,
    elevation: 3,
  },
  unlockedProgramContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  unlockedProgramIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  unlockedProgramName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  discoverButton: {
    backgroundColor: colors.warning,
    borderRadius: 10,
  },
  discoverButtonContent: {
    paddingVertical: 8,
  },

  // Styles pour les gains de stats
  gainsCard: {
    elevation: 8,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#F8F9FF',
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  gainsContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  gainsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  gainsSubtitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  
  // XP Global section
  xpGlobalContainer: {
    marginBottom: 20,
  },
  xpGlobalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  xpGlobalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  xpGlobalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
  },
  xpGlobalChip: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
  },
  xpGlobalChipText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  statsContainer: {
    gap: 12,
  },
  statGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 24,
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  statGainValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statGainChip: {
    backgroundColor: colors.success + '20',
    borderRadius: 20,
  },
  statGainChipText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Styles pour le level up global
  levelUpCard: {
    elevation: 12,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#FFF3E0',
    borderWidth: 3,
    borderColor: '#FF9800',
  },
  levelUpContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  levelUpIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  levelUpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelUpMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  levelUpDetails: {
    alignItems: 'center',
    gap: 12,
  },
  levelUpFrom: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 8,
  },
  titleChip: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  titleChipText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  titleChipIcon: {
    fontSize: 16,
    marginRight: 4,
  },
});

export default WorkoutSummaryScreen;
