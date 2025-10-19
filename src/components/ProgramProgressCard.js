import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button, Chip, ProgressBar } from 'react-native-paper';
import { colors } from '../theme/colors';
import { getTopCumulativeStats } from '../utils/programStats';

const ProgramProgressCard = ({ 
  program, 
  progress = { xp: 0, level: 0, completedSkills: 0, totalSkills: 0 }, 
  onPress 
}) => {
  // Valeurs par défaut si programme non défini
  if (!program) {
    return null;
  }

  const {
    name = 'Programme',
    icon = '🏋️',
    color = colors.primary,
    description = ''
  } = program;

  const {
    xp = 0,
    level = 0,
    completedSkills = 0,
    totalSkills = program.programs?.length || 0
  } = progress;

  // Calcul du pourcentage de progression
  const progressPercentage = totalSkills > 0 ? (completedSkills / totalSkills) : 0;
  const progressPercentageDisplay = Math.round(progressPercentage * 100);

  // Calculer les top 3 stats cumulées
  // Si program.programs existe, c'est une catégorie complète avec les skills
  let topStats = [];
  if (program.programs) {
    topStats = getTopCumulativeStats(program);
  }
  // Note: Avec la nouvelle architecture, les stats principales sont dans program.primaryStats
  // getTopCumulativeStats nécessiterait d'être adapté pour la nouvelle architecture

  // Création du background gradient simulé avec superposition
  const cardBackgroundColor = color + '15'; // Transparence légère
  const borderColor = color + '40';

  const handlePress = () => {
    if (onPress) {
      onPress(program.id || program.name);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Card style={[
        styles.card, 
        { 
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor,
          borderWidth: 1
        }
      ]}>
        <Card.Content style={styles.cardContent}>
          {/* Header avec icône et info programme */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Text style={styles.programIcon}>{icon}</Text>
            </View>
            
            <View style={styles.programInfo}>
              <Text style={styles.programName} numberOfLines={1}>{name}</Text>
              {level > 0 && (
                <Text style={styles.programLevel}>Niveau {level}</Text>
              )}
              
              {/* Tags des stats principales */}
              {topStats.length > 0 && (
                <View style={styles.statsTagsContainer}>
                  {topStats.map((stat, index) => (
                    <Chip
                      key={stat.stat}
                      mode="outlined"
                      compact
                      style={[styles.statTag, { borderColor: color + '60' }]}
                      textStyle={[styles.statTagText, { color: color }]}
                    >
                      {stat.icon} {stat.label}
                    </Chip>
                  ))}
                </View>
              )}
              
              {description && (
                <Text style={styles.programDescription} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>
          </View>

          {/* Section progression */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <View style={styles.progressStats}>
                <Text style={styles.progressLabel}>Compétences maîtrisées</Text>
                <Text style={[styles.progressText, { color: color }]}>
                  {completedSkills} / {totalSkills}
                </Text>
              </View>
              
              {/* Badge XP */}
              <Chip 
                mode="flat" 
                style={[styles.xpChip, { backgroundColor: color + '20' }]}
                textStyle={[styles.xpText, { color: color }]}
                compact
              >
                {xp.toLocaleString()} XP
              </Chip>
            </View>

            {/* Barre de progression */}
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={progressPercentage}
                color={color}
                style={styles.progressBar}
              />
              <Text style={[styles.progressPercentage, { color: color }]}>
                {progressPercentageDisplay}%
              </Text>
            </View>
          </View>

          {/* Section actions */}
          <View style={styles.actionsSection}>
            <Button
              mode="contained"
              onPress={handlePress}
              style={[styles.viewButton, { backgroundColor: color }]}
              contentStyle={styles.viewButtonContent}
              labelStyle={styles.viewButtonLabel}
              icon="tree"
            >
              Voir l'arbre
            </Button>
            
            {completedSkills > 0 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementText}>
                  {completedSkills === totalSkills ? '🏆 Complété !' : '⚡ En cours'}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.surface + '30',
  },
  programIcon: {
    fontSize: 40,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  programLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  statsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  statTag: {
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  statTagText: {
    fontSize: 11,
    fontWeight: '600',
    marginVertical: 0,
    marginHorizontal: 4,
  },
  programDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  
  // Progress Section
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressStats: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.surface + '30',
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Progress Bar
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface + '40',
    marginRight: 12,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'right',
  },
  
  // Actions Section
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    borderRadius: 12,
    elevation: 2,
  },
  viewButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  viewButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  achievementBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
});

export default ProgramProgressCard;
