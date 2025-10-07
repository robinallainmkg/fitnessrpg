import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TIER_COLORS = {
  0: '#4CAF50',
  2: '#FF9800',
  4: '#9C27B0',
  6: '#E91E63',
  8: '#FFD700',
};

const NativeCompanionViewer = ({ avatarUrl, tier = 0 }) => {
  const tierColor = TIER_COLORS[Math.floor(tier / 2) * 2] || TIER_COLORS[0];

  return (
    <View style={[styles.container, { borderColor: tierColor }]}>
      <Text style={styles.title}>Avatar 3D</Text>
      <Text style={[styles.subtitle, { color: tierColor }]}>
        Chargement du visualiseur...
      </Text>
      <Text style={styles.note}>
        Fonctionnalité disponible sur mobile
      </Text>
    </View>
  );
};

const styles = {
  container: {
    width: '100%',
    height: 400,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 8,
  },
  note: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
};

export default NativeCompanionViewer;
