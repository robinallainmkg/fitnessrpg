import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../../theme/rpgTheme';

/**
 * 💛 StatBadge - Affiche les récompenses XP et autres stats
 * 
 * Utilisation:
 * <StatBadge icon="lightning-bolt" value={150} label="XP" />
 * <StatBadge value="12" label="Défis" color="success" />
 */
const StatBadge = ({
  icon,
  value,
  label,
  color = 'primary',        // 'primary' | 'success' | 'warning' | 'info'
  size = 'small',           // 'small' | 'medium' | 'large'
  variant = 'filled',       // 'filled' | 'outline' | 'ghost'
  style,
}) => {
  // Couleurs par type
  const colorMap = {
    primary: {
      bg: 'rgba(77, 158, 255, 0.15)',
      border: '#4D9EFF',
      text: '#4D9EFF',
      glow: '#4D9EFF',
    },
    success: {
      bg: 'rgba(0, 255, 148, 0.15)',
      border: '#00FF94',
      text: '#00FF94',
      glow: '#00FF94',
    },
    warning: {
      bg: 'rgba(255, 43, 151, 0.15)',
      border: '#FF2B97',
      text: '#FF2B97',
      glow: '#FF2B97',
    },
    info: {
      bg: 'rgba(0, 229, 255, 0.15)',
      border: '#00E5FF',
      text: '#00E5FF',
      glow: '#00E5FF',
    },
  };

  // Tailles
  const sizeMap = {
    small: { padding: 6, fontSize: 12, iconSize: 12, gap: 4 },
    medium: { padding: 8, fontSize: 13, iconSize: 14, gap: 6 },
    large: { padding: 10, fontSize: 14, iconSize: 16, gap: 8 },
  };

  const colorConfig = colorMap[color] || colorMap.primary;
  const sizeConfig = sizeMap[size] || sizeMap.small;

  // Variantes de style
  const variantStyles = {
    filled: {
      backgroundColor: colorConfig.bg,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colorConfig.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  };

  const variantStyle = variantStyles[variant] || variantStyles.filled;

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding - 2,
          gap: sizeConfig.gap,
          ...variantStyle,
        },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={sizeConfig.iconSize}
          color={colorConfig.text}
        />
      )}
      <View style={styles.content}>
        {value && (
          <Text
            style={[
              styles.value,
              {
                fontSize: sizeConfig.fontSize,
                color: colorConfig.text,
              },
            ]}
          >
            {value}
          </Text>
        )}
        {label && (
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeConfig.fontSize - 1,
                color: colorConfig.text,
              },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rpgTheme.borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontWeight: rpgTheme.typography.weights.bold,
    letterSpacing: 0.2,
  },
  label: {
    fontWeight: rpgTheme.typography.weights.medium,
    opacity: 0.8,
  },
});

export default StatBadge;
