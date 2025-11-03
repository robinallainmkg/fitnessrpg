import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { rpgTheme } from '../../theme/rpgTheme';

/**
 * NavigationBarV2 - Navigation RPG professionnelle avec icônes Material
 * 
 * Design inspiré de: League of Legends, Genshin Impact, Solo Leveling
 * - Icônes vectorielles (pas d'emojis)
 * - États actifs avec glow effet
 * - Animations scale au tap
 * - Dot indicator sous l'onglet actif
 */

const TAB_CONFIG = [
  {
    name: 'Programme',
    icon: 'sword-cross',
    activeColor: '#FFD700', // Gold
    inactiveColor: '#64748B', // Gray
  },
  {
    name: 'Battle',
    icon: 'flash',
    activeColor: '#06B6D4', // Cyan electric
    inactiveColor: '#64748B',
  },
  {
    name: 'Entrainement',
    icon: 'dumbbell',
    activeColor: '#10B981', // Green
    inactiveColor: '#64748B',
  },
];

const TabButton = ({ tab, isActive, onPress, index, hasNotification }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const iconColor = isActive ? tab.activeColor : tab.inactiveColor;
  const labelColor = isActive ? tab.activeColor : tab.inactiveColor;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Glow effect pour l'onglet actif */}
        {isActive && (
          <View style={[styles.glowEffect, { backgroundColor: tab.activeColor }]} />
        )}

        {/* Icon */}
        <Icon
          name={tab.icon}
          size={isActive ? 28 : 24}
          color={iconColor}
          style={styles.icon}
        />

        {/* Notification badge (optionnel) */}
        {hasNotification && !isActive && (
          <View style={styles.notificationDot} />
        )}

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: labelColor,
              fontSize: isActive ? 11 : 10,
              fontWeight: isActive ? '700' : '600',
            },
          ]}
        >
          {tab.name.toUpperCase()}
        </Text>

        {/* Active indicator (dot sous l'onglet) */}
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: tab.activeColor }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const NavigationBarV2 = ({ activeTab, onTabChange, notifications = {} }) => {
  return (
    <View style={styles.container}>
      {/* Gradient top border */}
      <View style={styles.topBorder} />

      {/* Tab buttons */}
      <View style={styles.tabContainer}>
        {TAB_CONFIG.map((tab, index) => (
          <TabButton
            key={tab.name}
            tab={tab}
            index={index}
            isActive={activeTab === tab.name}
            onPress={() => onTabChange(tab.name)}
            hasNotification={notifications[tab.name]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Dark navy
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)', // Subtle blue border
    ...Platform.select({
      ios: {
        shadowColor: '#06B6D4',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  topBorder: {
    height: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.15,
    top: -5,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626', // Red
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
});

export default NavigationBarV2;
