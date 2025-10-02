/**
 * EXEMPLE D'INTÉGRATION UserStatsCard
 * 
 * Ce fichier montre comment intégrer UserStatsCard dans différents contextes
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import UserStatsCard from './UserStatsCard';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

// 1. UTILISATION AVEC CONTEXT AUTH
export const ProfileStatsSection = () => {
  const { user } = useAuth();
  
  // Stats depuis user.stats (après migration)
  const userStats = user?.stats || {
    strength: 0,
    endurance: 0,
    power: 0,
    speed: 0,
    flexibility: 0
  };

  return (
    <View style={styles.section}>
      <UserStatsCard stats={userStats} />
    </View>
  );
};

// 2. UTILISATION AVEC PROPS CALCULÉES
export const DynamicStatsCard = ({ completedSkills = [] }) => {
  // Calculer les stats basées sur les compétences complétées
  const calculateStats = (skills) => {
    let stats = {
      strength: 0,
      endurance: 0,
      power: 0,
      speed: 0,
      flexibility: 0
    };

    skills.forEach(skill => {
      if (skill.statBonuses) {
        stats.strength += skill.statBonuses.strength || 0;
        stats.endurance += skill.statBonuses.endurance || 0;
        stats.power += skill.statBonuses.power || 0;
        stats.speed += skill.statBonuses.speed || 0;
        stats.flexibility += skill.statBonuses.flexibility || 0;
      }
    });

    return stats;
  };

  const calculatedStats = calculateStats(completedSkills);

  return (
    <View style={styles.section}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Stats calculées depuis {completedSkills.length} compétences complétées
          </Text>
        </Card.Content>
      </Card>
      
      <UserStatsCard stats={calculatedStats} />
    </View>
  );
};

// 3. UTILISATION AVEC COMPARAISON AVANT/APRÈS
export const StatsComparison = ({ beforeStats, afterStats, title = "Évolution" }) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.comparisonTitle, { color: colors.text }]}>
        {title}
      </Text>
      
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonColumn}>
          <Text style={[styles.columnTitle, { color: colors.textSecondary }]}>
            Avant
          </Text>
          <UserStatsCard stats={beforeStats} />
        </View>
        
        <View style={styles.comparisonColumn}>
          <Text style={[styles.columnTitle, { color: colors.textSecondary }]}>
            Après
          </Text>
          <UserStatsCard stats={afterStats} />
        </View>
      </View>
    </View>
  );
};

// 4. UTILISATION AVEC LOADING STATE
export const StatsCardWithLoading = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Card style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            ⏳ Chargement des caractéristiques...
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return <UserStatsCard stats={stats} />;
};

// 5. UTILISATION AVEC DÉTAILS ÉTENDUS
export const DetailedStatsCard = ({ stats, showTotal = true, showAverage = true }) => {
  const totalStats = Object.values(stats || {}).reduce((sum, val) => sum + (val || 0), 0);
  const averageStats = totalStats / 5;

  return (
    <View style={styles.section}>
      <UserStatsCard stats={stats} />
      
      {(showTotal || showAverage) && (
        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.summaryRow}>
              {showTotal && (
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  📊 Total: {totalStats}
                </Text>
              )}
              {showAverage && (
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  📈 Moyenne: {averageStats.toFixed(1)}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 8
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  comparisonColumn: {
    flex: 1,
    marginHorizontal: 4
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8
  },
  loadingCard: {
    margin: 16,
    elevation: 4
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 2
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default {
  ProfileStatsSection,
  DynamicStatsCard,
  StatsComparison,
  StatsCardWithLoading,
  DetailedStatsCard
};
