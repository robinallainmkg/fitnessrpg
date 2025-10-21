import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { rpgTheme } from '../../theme/rpgTheme';

/**
 * 🎮 ProgramStatBadge - Badge de stat programme avec icône gamifiée
 * Utilisé dans ProgramSelectionScreen pour afficher strength, power, endurance
 * 
 * Utilisation:
 * <ProgramStatBadge stat="strength" />
 * <ProgramStatBadge stat="power" />
 * <ProgramStatBadge stat="endurance" />
 */

const STAT_CONFIG = {
  strength: {
    label: 'Strength',
    emoji: '💪',
    color: '#FF6B6B',         // Rouge
    bgColor: 'rgba(255, 107, 107, 0.15)',
  },
  power: {
    label: 'Power',
    emoji: '⚡',
    color: '#FFD93D',         // Jaune
    bgColor: 'rgba(255, 217, 61, 0.15)',
  },
  endurance: {
    label: 'Endurance',
    emoji: '🫀',
    color: '#6BCB77',         // Vert
    bgColor: 'rgba(107, 203, 119, 0.15)',
  },
  speed: {
    label: 'Speed',
    emoji: '🚀',
    color: '#4D96FF',         // Bleu ciel
    bgColor: 'rgba(77, 150, 255, 0.15)',
  },
  flexibility: {
    label: 'Flexibility',
    emoji: '🤸',
    color: '#A78BFA',         // Violet
    bgColor: 'rgba(167, 139, 250, 0.15)',
  },
  mobility: {
    label: 'Mobility',
    emoji: '🧘',
    color: '#F472B6',         // Rose
    bgColor: 'rgba(244, 114, 182, 0.15)',
  },
  coordination: {
    label: 'Coordination',
    emoji: '🎯',
    color: '#06B6D4',         // Cyan
    bgColor: 'rgba(6, 182, 212, 0.15)',
  },
};

const ProgramStatBadge = ({ stat = 'strength', size = 'small', variant = 'filled' }) => {
  const config = STAT_CONFIG[stat] || STAT_CONFIG.strength;

  const sizeConfig = {
    small: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 12,
      emojiSize: 14,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 13,
      emojiSize: 16,
    },
    large: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      emojiSize: 18,
    },
  }[size] || { paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, emojiSize: 14 };

  const variantStyles = {
    filled: {
      backgroundColor: config.bgColor,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: config.color,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  }[variant] || { backgroundColor: config.bgColor, borderWidth: 0 };

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
          ...variantStyles,
        },
      ]}
    >
      <Text style={{ fontSize: sizeConfig.emojiSize, marginRight: 4 }}>
        {config.emoji}
      </Text>
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeConfig.fontSize,
            color: config.color,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rpgTheme.borderRadius.md,
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default ProgramStatBadge;
