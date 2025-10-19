import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../../theme/rpgTheme';

/**
 * 🏷️ StatusBadge - Indicateur de statut (Actif, Verrouillé, Complété, etc)
 * 
 * Utilisation:
 * <StatusBadge status="active" />
 * <StatusBadge status="completed" label="Complété" />
 * <StatusBadge status="locked" icon="lock" />
 */
const StatusBadge = ({
  status = 'active',        // 'active' | 'completed' | 'locked' | 'inProgress'
  label,
  icon,
  position = 'inline',      // 'inline' | 'absolute' (top-right, bottom-left, etc)
  size = 'small',           // 'small' | 'medium' | 'large'
  style,
}) => {
  // Configuration par statut
  const statusMap = {
    active: {
      bg: 'rgba(0, 255, 148, 0.15)',
      border: rpgTheme.colors.status.active,
      text: rpgTheme.colors.status.active,
      icon: 'fire',
      label: 'Actif',
      emoji: '🔥',
    },
    completed: {
      bg: 'rgba(255, 215, 0, 0.15)',
      border: rpgTheme.colors.status.completed,
      text: rpgTheme.colors.status.completed,
      icon: 'check-circle',
      label: 'Complété',
      emoji: '✅',
    },
    locked: {
      bg: 'rgba(107, 122, 153, 0.15)',
      border: rpgTheme.colors.status.locked,
      text: rpgTheme.colors.status.locked,
      icon: 'lock',
      label: 'Verrouillé',
      emoji: '🔒',
    },
    inProgress: {
      bg: 'rgba(77, 158, 255, 0.15)',
      border: rpgTheme.colors.status.inProgress,
      text: rpgTheme.colors.status.inProgress,
      icon: 'progress-clock',
      label: 'En cours',
      emoji: '⏳',
    },
  };

  const config = statusMap[status] || statusMap.active;

  // Tailles
  const sizeMap = {
    small: { padding: 6, fontSize: 12, iconSize: 14 },
    medium: { padding: 8, fontSize: 13, iconSize: 16 },
    large: { padding: 10, fontSize: 14, iconSize: 18 },
  };

  const sizeConfig = sizeMap[size] || sizeMap.small;

  const displayLabel = label || config.label;
  const displayIcon = icon || config.icon;

  return (
    <View
      style={[
        styles.badge,
        position === 'absolute' && styles.absoluteBadge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding - 2,
        },
        style,
      ]}
    >
      {displayIcon && (
        <Icon
          name={displayIcon}
          size={sizeConfig.iconSize}
          color={config.text}
          style={styles.icon}
        />
      )}
      {displayLabel && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: config.text,
              fontWeight: rpgTheme.typography.weights.semibold,
            },
          ]}
        >
          {displayLabel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 1.5,
    gap: 6,
  },
  absoluteBadge: {
    position: 'absolute',
    top: rpgTheme.spacing.md,
    right: rpgTheme.spacing.md,
    zIndex: 10,
  },
  icon: {
    marginTop: -1,
  },
  label: {
    fontWeight: rpgTheme.typography.weights.semibold,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
