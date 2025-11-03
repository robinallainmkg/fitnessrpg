import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

/**
 * QuestSelectionModal - Modal de sélection de mode de jeu
 * 
 * Inspiré de:
 * - League of Legends: Ranked selection
 * - Valorant: Game mode picker
 * - Genshin Impact: Domain selection
 * 
 * 3 Game Modes:
 * 1. Défi du Jour (Daily Challenge - Video submission)
 * 2. Quête Principale (Main Quest - Recommended skill challenge)
 * 3. Quêtes Secondaires (Side Quests - All available challenges)
 */

const GAME_MODES = [
  {
    id: 'daily',
    title: 'DÉFI DU JOUR',
    subtitle: 'Challenge vidéo quotidien',
    icon: 'calendar-star',
    color: '#F59E0B', // Orange
    gradient: ['#F59E0B', '#EF4444'],
    xpReward: 150,
    description: 'Filme-toi en train de réaliser le défi et gagne 150 XP',
    difficulty: 'Facile',
    duration: '5-10 min',
  },
  {
    id: 'main-quest',
    title: 'QUÊTE PRINCIPALE',
    subtitle: 'Challenge recommandé pour toi',
    icon: 'sword-cross',
    color: '#3B82F6', // Blue
    gradient: ['#3B82F6', '#06B6D4'],
    xpReward: 500,
    description: 'Complète le challenge adapté à ton niveau',
    difficulty: 'Moyen',
    duration: '20-30 min',
  },
  {
    id: 'side-quests',
    title: 'QUÊTES SECONDAIRES',
    subtitle: 'Explore tous les challenges',
    icon: 'map-marker-multiple',
    color: '#10B981', // Green
    gradient: ['#10B981', '#059669'],
    xpReward: '200-500',
    description: 'Choisis parmi tous les challenges disponibles',
    difficulty: 'Variable',
    duration: '15-45 min',
  },
];

const QuestSelectionModal = ({ visible, onClose, navigation, todayChallenge, mainQuest, sideQuests }) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    if (visible) {
      // Animation d'ouverture
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de fermeture
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelectMode = (modeId) => {
    setSelectedMode(modeId);
    
    // Vibration légère
    if (Platform.OS === 'ios') {
      // TODO: Ajouter haptic feedback
    }

    // Navigation basée sur le mode sélectionné
    setTimeout(() => {
      switch (modeId) {
        case 'daily':
          // Naviguer vers l'écran de soumission vidéo
          navigation.navigate('DailyChallenge');
          break;
        case 'main-quest':
          // Démarrer la quête principale
          navigation.navigate('WorkoutSession', { challenge: mainQuest });
          break;
        case 'side-quests':
          // Afficher la liste des quêtes
          navigation.navigate('QuestList');
          break;
      }
      onClose();
    }, 300);
  };

  const handleClose = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Background blur */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleClose}
            style={StyleSheet.absoluteFill}
          >
            <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
          </TouchableOpacity>
        </Animated.View>

        {/* Modal content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>CHOISIS TON MODE DE JEU</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Game modes */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {GAME_MODES.map((mode, index) => (
              <GameModeCard
                key={mode.id}
                mode={mode}
                index={index}
                isSelected={selectedMode === mode.id}
                onSelect={() => handleSelectMode(mode.id)}
              />
            ))}
          </ScrollView>

          {/* Footer hint */}
          <View style={styles.footer}>
            <Icon name="information-outline" size={16} color="#64748B" />
            <Text style={styles.footerText}>
              Gagne de l'XP et monte de niveau en complétant les challenges
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const GameModeCard = ({ mode, index, isSelected, onSelect }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de glow si sélectionné
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
    onSelect();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={mode.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Glow effect si sélectionné */}
          {isSelected && (
            <Animated.View
              style={[
                styles.cardGlow,
                {
                  backgroundColor: mode.color,
                  opacity: glowOpacity,
                },
              ]}
            />
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name={mode.icon} size={48} color="#FFFFFF" />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{mode.title}</Text>
            <Text style={styles.cardSubtitle}>{mode.subtitle}</Text>
            
            <Text style={styles.cardDescription}>{mode.description}</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatBadge icon="star" value={`${mode.xpReward} XP`} />
              <StatBadge icon="clock-outline" value={mode.duration} />
              <StatBadge icon="signal" value={mode.difficulty} />
            </View>
          </View>

          {/* Arrow */}
          <Icon name="chevron-right" size={32} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const StatBadge = ({ icon, value }) => (
  <View style={styles.statBadge}>
    <Icon name={icon} size={14} color="rgba(255,255,255,0.9)" />
    <Text style={styles.statBadgeText}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#06B6D4',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    minHeight: 140,
  },
  cardGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 24,
    zIndex: -1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
});

export default QuestSelectionModal;
