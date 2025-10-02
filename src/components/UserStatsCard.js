import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { colors } from '../theme/colors';

const UserStatsCard = ({ stats = {} }) => {
  const statsConfig = [
    { key: 'strength', label: 'Force', icon: '💪', color: '#FF6B6B' },
    { key: 'endurance', label: 'Endurance', icon: '🔋', color: '#4CAF50' },
    { key: 'power', label: 'Puissance', icon: '⚡', color: '#FFD700' },
    { key: 'speed', label: 'Vitesse', icon: '🚀', color: '#2196F3' },
    { key: 'flexibility', label: 'Souplesse', icon: '🧘', color: '#9C27B0' }
  ];

  const renderStatRow = (stat) => {
    const value = stats[stat.key] || 0;
    const progress = Math.min(Math.max(value, 0), 100) / 100; // Assure que la valeur est entre 0 et 1

    return (
      <View key={stat.key} style={styles.statRow}>
        {/* Icon */}
        <Text style={styles.icon}>{stat.icon}</Text>
        
        {/* Label */}
        <Text style={[styles.label, { color: colors.text }]}>{stat.label}</Text>
        
        {/* ProgressBar Container */}
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress}
            color={stat.color}
            style={[styles.progressBar, { backgroundColor: colors.surface + '40' }]}
          />
        </View>
        
        {/* Value */}
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    );
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <Text style={[styles.title, { color: colors.text }]}>Caractéristiques</Text>
        
        {statsConfig.map(renderStatRow)}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    marginRight: 8
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 8
  },
  progressBar: {
    height: 8,
    borderRadius: 4
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 35,
    textAlign: 'right',
    marginLeft: 8
  }
});

export default UserStatsCard;
