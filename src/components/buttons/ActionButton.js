import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../../theme/rpgTheme';

/**
 * 🎮 ActionButton - Bouton primaire avec gradient et glow
 * 
 * Utilisation:
 * <ActionButton onPress={handleStart} icon="play">Commencer</ActionButton>
 * <ActionButton color="success" onPress={handleConfirm}>Confirmer</ActionButton>
 */
const ActionButton = ({
  onPress,
  icon,
  children,
  disabled = false,
  color = 'primary',        // 'primary' | 'success' | 'warning'
  size = 'medium',          // 'small' | 'medium' | 'large'
  fullWidth = false,
  loading = false,
  style,
}) => {
  // Couleurs par type
  const colorMap = {
    primary: [rpgTheme.colors.neon.blue, '#3B82F6'],
    success: [rpgTheme.colors.status.active, '#00D980'],
    warning: [rpgTheme.colors.neon.pink, '#E60AA8'],
  };

  // Tailles
  const sizeMap = {
    small: { padding: 8, fontSize: 12, iconSize: 14 },
    medium: { padding: 12, fontSize: 14, iconSize: 16 },
    large: { padding: 16, fontSize: 16, iconSize: 18 },
  };

  const colors = colorMap[color] || colorMap.primary;
  const sizeConfig = sizeMap[size] || sizeMap.medium;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.buttonContainer,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#4A5568', '#2D3748'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeConfig.padding,
            shadowColor: disabled ? 'transparent' : colors[0],
          },
        ]}
      >
        <View style={styles.content}>
          {icon && !loading && (
            <Icon
              name={icon}
              size={sizeConfig.iconSize}
              color="#FFF"
              style={styles.icon}
            />
          )}
          {loading && (
            <ActivityIndicator color="#FFF" size="small" style={styles.loader} />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: disabled ? '#8892B0' : '#FFFFFF',
              },
            ]}
          >
            {children}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: rpgTheme.borderRadius.md,
  },
  fullWidth: {
    flex: 1,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  loader: {
    marginRight: 6,
  },
  text: {
    fontWeight: rpgTheme.typography.weights.bold,
    letterSpacing: 0.3,
  },
});

export default ActionButton;
