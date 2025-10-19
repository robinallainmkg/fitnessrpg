import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../../theme/rpgTheme';

/**
 * 👁️ OutlineButton - Bouton secondaire avec bordure
 * 
 * Utilisation:
 * <OutlineButton onPress={handlePreview} icon="eye-outline">Aperçu</OutlineButton>
 * <OutlineButton borderColor="#4D9EFF" onPress={handleAction}>Action</OutlineButton>
 */
const OutlineButton = ({
  onPress,
  icon,
  children,
  borderColor = rpgTheme.colors.neon.blue,
  disabled = false,
  size = 'medium',          // 'small' | 'medium' | 'large'
  fullWidth = false,
  style,
}) => {
  // Tailles
  const sizeMap = {
    small: { padding: 8, fontSize: 12, iconSize: 14, borderWidth: 1.5 },
    medium: { padding: 12, fontSize: 14, iconSize: 16, borderWidth: 2 },
    large: { padding: 16, fontSize: 16, iconSize: 18, borderWidth: 2 },
  };

  const sizeConfig = sizeMap[size] || sizeMap.medium;
  const textColor = disabled ? rpgTheme.colors.text.muted : borderColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={[
        styles.buttonContainer,
        {
          borderColor: disabled ? rpgTheme.colors.text.muted : borderColor,
          borderWidth: sizeConfig.borderWidth,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <Icon
            name={icon}
            size={sizeConfig.iconSize}
            color={textColor}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
              color: textColor,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: rpgTheme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  fullWidth: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: rpgTheme.typography.weights.bold,
    letterSpacing: 0.3,
  },
});

export default OutlineButton;
