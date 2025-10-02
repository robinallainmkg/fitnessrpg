/**
 * EXEMPLES D'UTILISATION ProgramProgressCard
 * 
 * Ce fichier montre différents patterns d'utilisation du composant
 * ProgramProgressCard dans diverses situations
 */

import React from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import ProgramProgressCard from './ProgramProgressCard';
import { colors } from '../theme/colors';

// 1. UTILISATION STANDARD DANS HOMESCREEN
export const HomeScreenProgramsList = ({ userPrograms, programs, navigation }) => {
  const handleProgramPress = (programId) => {
    navigation.navigate('SkillTree', { programId });
  };

  return (
    <View style={styles.programsList}>
      {Object.keys(userPrograms || {}).map(programId => {
        const program = programs.categories
          .flatMap(cat => cat.programs)
          .find(p => p.id === programId);
        
        if (!program) return null;
        
        return (
          <ProgramProgressCard
            key={programId}
            program={program}
            progress={userPrograms[programId]}
            onPress={handleProgramPress}
          />
        );
      })}
    </View>
  );
};

// 2. LISTE HORIZONTALE (CAROUSEL)
export const HorizontalProgramsCarousel = ({ programs, userPrograms, onProgramSelect }) => {
  const renderProgram = ({ item: programId }) => {
    const program = programs.find(p => p.id === programId);
    const progress = userPrograms[programId] || { xp: 0, level: 0, completedSkills: 0 };
    
    return (
      <View style={styles.carouselItem}>
        <ProgramProgressCard
          program={program}
          progress={progress}
          onPress={onProgramSelect}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={Object.keys(userPrograms)}
      renderItem={renderProgram}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
      ItemSeparatorComponent={() => <View style={styles.horizontalSeparator} />}
    />
  );
};

// 3. PROGRAMME AVEC ACHIEVEMENTS
export const ProgramWithAchievements = ({ program, progress, achievements, onPress }) => {
  const getAchievementBadge = () => {
    const { completedSkills, totalSkills } = progress;
    const completionRate = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;
    
    if (completionRate === 100) return { text: '🏆 Maîtrisé', color: colors.warning };
    if (completionRate >= 75) return { text: '⭐ Expert', color: colors.success };
    if (completionRate >= 50) return { text: '💪 Avancé', color: colors.primary };
    if (completionRate >= 25) return { text: '🌱 En cours', color: colors.info };
    return { text: '🎯 Débutant', color: colors.textSecondary };
  };

  const badge = getAchievementBadge();

  return (
    <View style={styles.programWithAchievements}>
      <ProgramProgressCard
        program={program}
        progress={progress}
        onPress={onPress}
      />
      
      <Card style={[styles.achievementOverlay, { backgroundColor: badge.color + '20' }]}>
        <Card.Content style={styles.achievementContent}>
          <Text style={[styles.achievementText, { color: badge.color }]}>
            {badge.text}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

// 4. PROGRAMME COMPACT (POUR SIDEBAR/DRAWER)
export const CompactProgramCard = ({ program, progress, onPress }) => {
  const progressPercentage = progress.totalSkills > 0 
    ? Math.round((progress.completedSkills / progress.totalSkills) * 100) 
    : 0;

  return (
    <Card style={styles.compactCard} onPress={() => onPress(program.id)}>
      <Card.Content style={styles.compactContent}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactIcon}>{program.icon}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {program.name}
            </Text>
            <Text style={styles.compactProgress}>
              {progressPercentage}% • {progress.completedSkills}/{progress.totalSkills}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

// 5. PROGRAMME AVEC STATISTIQUES ÉTENDUES
export const DetailedProgramCard = ({ program, progress, stats, onPress }) => {
  const {
    xp = 0,
    level = 0,
    completedSkills = 0,
    totalSkills = 0,
    lastSession = null,
    totalSessions = 0,
    averageScore = 0
  } = progress;

  return (
    <View style={styles.detailedContainer}>
      <ProgramProgressCard
        program={program}
        progress={{ xp, level, completedSkills, totalSkills }}
        onPress={onPress}
      />
      
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>📊 Statistiques détaillées</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Séances</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{averageScore}%</Text>
              <Text style={styles.statLabel}>Score moyen</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {lastSession ? formatTimeSince(lastSession) : 'Jamais'}
              </Text>
              <Text style={styles.statLabel}>Dernière fois</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

// 6. PROGRAMME AVEC ÉTAT DE CHARGEMENT
export const LoadingProgramCard = ({ isLoading, program, progress, onPress }) => {
  if (isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <Card.Content>
          <View style={styles.loadingSkeleton}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonProgress} />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <ProgramProgressCard
      program={program}
      progress={progress}
      onPress={onPress}
    />
  );
};

// 7. PROGRAMME AVEC ACTIONS PERSONNALISÉES
export const ActionableProgramCard = ({ program, progress, actions, onPress }) => {
  return (
    <View style={styles.actionableContainer}>
      <ProgramProgressCard
        program={program}
        progress={progress}
        onPress={onPress}
      />
      
      <View style={styles.actionButtons}>
        {actions.map((action, index) => (
          <Card 
            key={index} 
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <Card.Content style={styles.actionContent}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionText}>{action.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
};

// Utilitaires
const formatTimeSince = (date) => {
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return `${diff}j`;
  if (diff < 30) return `${Math.floor(diff / 7)}sem`;
  return `${Math.floor(diff / 30)}mois`;
};

const styles = StyleSheet.create({
  programsList: {
    paddingVertical: 8
  },
  
  // Carousel
  carouselItem: {
    width: 280,
  },
  horizontalList: {
    paddingHorizontal: 8
  },
  horizontalSeparator: {
    width: 8
  },
  
  // Achievements
  programWithAchievements: {
    position: 'relative',
    marginBottom: 8
  },
  achievementOverlay: {
    position: 'absolute',
    top: 8,
    right: 24,
    elevation: 8,
    borderRadius: 12
  },
  achievementContent: {
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  achievementText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  
  // Compact
  compactCard: {
    marginHorizontal: 8,
    marginVertical: 4,
    elevation: 2
  },
  compactContent: {
    padding: 12
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  compactIcon: {
    fontSize: 24,
    marginRight: 12
  },
  compactInfo: {
    flex: 1
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  compactProgress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  
  // Detailed
  detailedContainer: {
    marginBottom: 8
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: -8,
    elevation: 2
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  
  // Loading
  loadingCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2
  },
  loadingSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  skeletonIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.textSecondary + '30',
    marginRight: 16
  },
  skeletonContent: {
    flex: 1
  },
  skeletonLine: {
    height: 16,
    backgroundColor: colors.textSecondary + '30',
    borderRadius: 8,
    marginBottom: 8
  },
  skeletonLineShort: {
    height: 12,
    width: '60%',
    backgroundColor: colors.textSecondary + '20',
    borderRadius: 6,
    marginBottom: 12
  },
  skeletonProgress: {
    height: 8,
    backgroundColor: colors.textSecondary + '20',
    borderRadius: 4
  },
  
  // Actionable
  actionableContainer: {
    marginBottom: 8
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -8
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 8
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  }
});

export default {
  HomeScreenProgramsList,
  HorizontalProgramsCarousel,
  ProgramWithAchievements,
  CompactProgramCard,
  DetailedProgramCard,
  LoadingProgramCard,
  ActionableProgramCard
};
