/**
 * EXEMPLES D'UTILISATION UserHeader
 * 
 * Ce fichier montre différents patterns d'utilisation du composant UserHeader
 * dans diverses situations et écrans
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import UserHeader from './UserHeader';
import { useUserHeader, useUserStats, useUserAchievements } from '../hooks/useUserHeader';
import { colors } from '../theme/colors';

// 1. UTILISATION STANDARD DANS HOMESCREEN
export const HomeScreenHeader = () => {
  const headerData = useUserHeader();
  
  return (
    <UserHeader
      username={headerData.username}
      globalLevel={headerData.globalLevel}
      globalXP={headerData.globalXP}
      title={headerData.title}
      streak={headerData.streak}
    />
  );
};

// 2. HEADER AVEC STATS ADDITIONNELLES
export const EnhancedUserHeader = () => {
  const headerData = useUserHeader();
  const stats = useUserStats();
  
  return (
    <View style={styles.enhancedContainer}>
      <UserHeader {...headerData} />
      
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Entraînements</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedSkills}</Text>
              <Text style={styles.statLabel}>Compétences</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageScoreFormatted}%</Text>
              <Text style={styles.statLabel}>Score Moyen</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

// 3. HEADER COMPACT POUR MODAL/DRAWER
export const CompactUserHeader = () => {
  const headerData = useUserHeader();
  
  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactAvatar}>
        <Text style={styles.compactAvatarText}>
          {headerData.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.compactInfo}>
        <Text style={styles.compactName} numberOfLines={1}>
          {headerData.username}
        </Text>
        <Text style={styles.compactLevel}>
          {headerData.title} • Niveau {headerData.globalLevel}
        </Text>
      </View>
      
      {headerData.hasStreak && (
        <Text style={styles.compactStreak}>🔥{headerData.streak}</Text>
      )}
    </View>
  );
};

// 4. HEADER AVEC ACHIEVEMENTS
export const AchievementUserHeader = () => {
  const headerData = useUserHeader();
  const achievements = useUserAchievements();
  
  return (
    <View style={styles.achievementContainer}>
      <UserHeader {...headerData} />
      
      {achievements.nextToUnlock.length > 0 && (
        <Card style={styles.achievementCard}>
          <Card.Content>
            <Text style={styles.achievementTitle}>
              🏆 Prochain Achievement
            </Text>
            
            {achievements.nextToUnlock[0] && (
              <View style={styles.nextAchievement}>
                <Text style={styles.achievementName}>
                  {achievements.nextToUnlock[0].name}
                </Text>
                <Text style={styles.achievementDesc}>
                  {achievements.nextToUnlock[0].description}
                </Text>
                <Text style={styles.achievementProgress}>
                  {achievements.nextToUnlock[0].progress} / {achievements.nextToUnlock[0].target} 
                  ({achievements.nextToUnlock[0].percentage}%)
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

// 5. HEADER AVEC ACTIONS RAPIDES
export const ActionableUserHeader = ({ onViewProfile, onViewStats, onViewAchievements }) => {
  const headerData = useUserHeader();
  
  return (
    <View style={styles.actionableContainer}>
      <UserHeader {...headerData} />
      
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          compact
          onPress={onViewProfile}
          style={styles.actionButton}
        >
          Profil
        </Button>
        
        <Button
          mode="outlined"
          compact
          onPress={onViewStats}
          style={styles.actionButton}
        >
          Stats
        </Button>
        
        <Button
          mode="outlined"
          compact
          onPress={onViewAchievements}
          style={styles.actionButton}
        >
          Trophées
        </Button>
      </View>
    </View>
  );
};

// 6. HEADER AVEC COMPARAISON (LEADERBOARD)
export const ComparisonUserHeader = ({ userRank, totalUsers }) => {
  const headerData = useUserHeader();
  
  return (
    <View style={styles.comparisonContainer}>
      <UserHeader {...headerData} />
      
      <Card style={styles.rankCard}>
        <Card.Content>
          <View style={styles.rankInfo}>
            <Text style={styles.rankLabel}>Classement Global</Text>
            <Text style={styles.rankValue}>
              #{userRank} / {totalUsers}
            </Text>
            <Text style={styles.rankPercentile}>
              Top {Math.round((userRank / totalUsers) * 100)}%
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

// 7. HEADER RESPONSIVE AVEC BREAKPOINTS
export const ResponsiveUserHeader = ({ screenWidth }) => {
  const headerData = useUserHeader();
  const isTablet = screenWidth > 768;
  const isMobile = screenWidth < 480;
  
  if (isMobile) {
    return <CompactUserHeader />;
  }
  
  if (isTablet) {
    return <EnhancedUserHeader />;
  }
  
  return <UserHeader {...headerData} />;
};

// 8. HEADER AVEC ÉTAT DE CHARGEMENT
export const LoadingUserHeader = ({ isLoading }) => {
  const headerData = useUserHeader();
  
  if (isLoading || headerData.isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <Card.Content>
          <View style={styles.loadingSkeleton}>
            <View style={styles.skeletonAvatar} />
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
  
  return <UserHeader {...headerData} />;
};

const styles = StyleSheet.create({
  enhancedContainer: {
    marginBottom: 8
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
    elevation: 2
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  compactAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface
  },
  compactInfo: {
    flex: 1
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  compactLevel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  compactStreak: {
    fontSize: 12,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    color: colors.primary
  },
  
  achievementContainer: {
    marginBottom: 8
  },
  achievementCard: {
    marginHorizontal: 16,
    marginTop: -8,
    elevation: 2,
    backgroundColor: colors.warning + '10'
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  nextAchievement: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 8
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  achievementDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2
  },
  achievementProgress: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  
  actionableContainer: {
    marginBottom: 8
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  actionButton: {
    minWidth: 80
  },
  
  comparisonContainer: {
    marginBottom: 8
  },
  rankCard: {
    marginHorizontal: 16,
    marginTop: -8,
    elevation: 2,
    backgroundColor: colors.success + '10'
  },
  rankInfo: {
    alignItems: 'center'
  },
  rankLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase'
  },
  rankValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginVertical: 2
  },
  rankPercentile: {
    fontSize: 12,
    color: colors.textSecondary
  },
  
  loadingCard: {
    margin: 16,
    elevation: 4
  },
  loadingSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    height: 6,
    backgroundColor: colors.textSecondary + '20',
    borderRadius: 3
  }
});

export default {
  HomeScreenHeader,
  EnhancedUserHeader,
  CompactUserHeader,
  AchievementUserHeader,
  ActionableUserHeader,
  ComparisonUserHeader,
  ResponsiveUserHeader,
  LoadingUserHeader
};
