import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

/**
 * SkillNode - Nœud individuel dans l'arbre de compétences avec visuels améliorés
 * 
 * États visuels drastiquement différenciés :
 * - LOCKED : Noir, gris, icône désaturée + cadenas
 * - UNLOCKED : Brillant, coloré, badge "NOUVEAU", animation pulse
 * - IN_PROGRESS : Bordure dorée, barre de progression circulaire
 * - COMPLETED : Vert vibrant, badge "✅ Complété", XP affiché
 */
const SkillNode = ({ 
  program, 
  state,
  progress,
  onPress,
  onLongPress
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  // Utiliser directement l'état passé depuis SkillTreeScreen
  const nodeState = state || 'LOCKED';

  // Calculer le pourcentage de progression
  const getProgressPercentage = () => {
    if (!progress || !program.levels) return 0;
    return (progress.currentLevel - 1) / program.levels.length;
  };

  // Animation pulse pour les nœuds UNLOCKED (plus visible)
  useEffect(() => {
    if (nodeState === 'UNLOCKED') {
      const startPulseAnimation = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08, // Plus prononcé
            duration: 2000, // Plus lent
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => startPulseAnimation());
      };
      startPulseAnimation();
    } else {
      // Arrêter l'animation pour les autres états
      pulseAnim.setValue(1);
    }
  }, [nodeState, pulseAnim]);

  // Animation de pression améliorée
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };



  // Styles visuels drastiquement améliorés selon l'état
  const getNodeContainerStyle = () => {
    const baseTransform = [{ scale: pressAnim }];
    
    // Ajouter l'animation pulse seulement pour UNLOCKED
    if (nodeState === 'UNLOCKED') {
      baseTransform.push({ scale: pulseAnim });
    }

    const baseStyle = {
      transform: baseTransform,
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
    };

    switch (nodeState) {
      case 'LOCKED':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(42, 42, 42, 0.9)', // Gris très foncé
          borderColor: '#444444', // Gris foncé
          borderWidth: 2,
          // Pas de shadow
        };
        
      case 'UNLOCKED':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Noir semi-transparent
          borderColor: '#4ECDC4', // Turquoise brillant
          borderWidth: 3,
          // Shadow/glow turquoise
          shadowColor: '#4ECDC4',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 12,
          elevation: 12,
        };
        
      case 'IN_PROGRESS':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Noir semi-transparent
          borderColor: '#FFB800', // Orange
          borderWidth: 3,
          shadowColor: '#FFB800',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 8,
        };
        
      case 'COMPLETED':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Noir semi-transparent
          borderColor: '#4CAF50', // Vert
          borderWidth: 3,
          shadowColor: '#4CAF50',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 8,
        };
        
      default:
        return baseStyle;
    }
  };

  // Style de l'icône selon l'état
  const getIconStyle = () => {
    switch (nodeState) {
      case 'LOCKED':
        return {
          fontSize: 32,
          color: '#FFB800', // Jaune-orange pour le cadenas
          opacity: 1,
        };
      case 'UNLOCKED':
      case 'IN_PROGRESS':
      case 'COMPLETED':
        return {
          fontSize: 36,
          opacity: 1,
        };
      default:
        return { fontSize: 36 };
    }
  };

  // Style du texte selon l'état
  const getTextStyle = () => {
    switch (nodeState) {
      case 'LOCKED':
        return {
          color: '#666666',
          fontWeight: 'normal',
        };
      case 'UNLOCKED':
      case 'IN_PROGRESS':  
      case 'COMPLETED':
        return {
          color: '#FFFFFF',
          fontWeight: 'bold',
        };
      default:
        return { color: '#FFFFFF' };
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={false}
        activeOpacity={0.9}
      >
        {/* Nœud principal avec nouveau style */}
        <Animated.View style={[getNodeContainerStyle()]}>
          {/* Icône du programme ou cadenas */}
          {nodeState === 'LOCKED' ? (
            <Text style={[styles.programIcon, getIconStyle()]}>🔒</Text>
          ) : (
            <Text style={[styles.programIcon, getIconStyle()]}>
              {program.icon}
            </Text>
          )}

          {/* Checkmark pour COMPLETED */}
          {nodeState === 'COMPLETED' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>
          )}

          {/* Barre de progression circulaire pour IN_PROGRESS */}
          {nodeState === 'IN_PROGRESS' && (
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressArc,
                  { 
                    transform: [{ 
                      rotate: `${getProgressPercentage() * 360}deg` 
                    }]
                  }
                ]} 
              />
              <Text style={styles.progressText}>
                {progress?.currentLevel || 1}/{program.levels?.length || 4}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Badges selon l'état */}
        <View style={styles.badgeContainer}>
          {nodeState === 'UNLOCKED' && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>NOUVEAU</Text>
            </View>
          )}
          
          {nodeState === 'IN_PROGRESS' && (
            <View style={[styles.badge, styles.progressBadge]}>
              <Text style={styles.badgeText}>EN COURS</Text>
            </View>
          )}
          
          {nodeState === 'COMPLETED' && (
            <View style={[styles.badge, styles.completedBadge]}>
              <Text style={styles.badgeText}>COMPLÉTÉ</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Nom du programme */}
      <Text style={[styles.programName, getTextStyle()]} numberOfLines={2}>
        {program.name}
      </Text>

      {/* XP gagné pour les programmes complétés */}
      {nodeState === 'COMPLETED' && (
        <Text style={styles.xpText}>
          +{program.xpReward || 300} XP
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
    width: 100, // Ajusté pour les nouveaux nœuds 80px
  },
  programIcon: {
    textAlign: 'center',
    // fontSize et opacity définis dynamiquement dans getIconStyle()
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 40,
  },
  lockIcon: {
    fontSize: 30,
    color: 'white',
    opacity: 0.5,
  },
  checkmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkmarkIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 86, // 80 + 6px pour la bordure
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    borderColor: '#FFB800',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -25,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -10,
    left: -10,
    alignItems: 'center',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 50,
    maxWidth: 80,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    backgroundColor: '#00D9B5', // Turquoise
  },
  progressBadge: {
    backgroundColor: '#FFB800', // Orange
  },
  completedBadge: {
    backgroundColor: '#4CAF50', // Vert
  },
  badgeText: {
    fontSize: 9,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  programName: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 120,
    // color définie dynamiquement dans getTextStyle()
  },
  xpText: {
    marginTop: 4,
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default memo(SkillNode);
