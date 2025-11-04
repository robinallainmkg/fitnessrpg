import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useChallenge } from '../contexts/ChallengeContext';
import { colors } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';
import UserHeader from '../components/UserHeader';
import QuestSelectionModal from '../components/modals/QuestSelectionModal';
import { getAvailableChallenges, recommendTodayChallenge } from '../services/skillChallengeService';
import { getFirestore } from '../config/firebase.simple';

const firestore = getFirestore();

const { width, height } = Dimensions.get('window');
const BACKGROUND_IMAGE = require('../../assets/programmes/street-bg.jpg');

/**
 * BattleScreenHeroLanding - Écran d'accueil épique style League of Legends
 * 
 * Features:
 * - Avatar animé qui marche (idle walk)
 * - Bouton "COMMENCER L'AVENTURE" central
 * - Background avec parallax
 * - Ouvre modal de sélection de quête (Game Mode Picker)
 */

const BattleScreenHeroLanding = ({ navigation }) => {
  const { user } = useAuth();
  const { todayChallenge } = useChallenge();
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const avatarBounceAnim = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [todaySkillChallenge, setTodaySkillChallenge] = useState(null);
  const [skillChallenges, setSkillChallenges] = useState([]);

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarBounceAnim, {
            toValue: -10,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(avatarBounceAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Charger les stats utilisateur
    if (user?.uid) {
      loadUserStats();
      loadChallenges();
    }
  }, [user?.uid]);

  const loadUserStats = async () => {
    if (!user?.uid) return;
    
    try {
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const data = userDoc.data();
        setUserStats({
          displayName: data.displayName || user.displayName || 'Guerrier',
          globalLevel: data.globalLevel || 1,
          globalXP: data.globalXP || 0,
          title: data.title || 'Débutant',
          streakDays: data.streakDays || 0,
          avatarId: data.avatarId || 0,
        });
      } else {
        // Fallback si pas de document
        setUserStats({
          displayName: user.displayName || 'Guerrier',
          globalLevel: 1,
          globalXP: 0,
          title: 'Débutant',
          streakDays: 0,
          avatarId: 0,
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
      // Fallback en cas d'erreur
      setUserStats({
        displayName: user.displayName || 'Guerrier',
        globalLevel: 1,
        globalXP: 0,
        title: 'Débutant',
        streakDays: 0,
        avatarId: 0,
      });
    }
  };

  const loadChallenges = async () => {
    if (!user?.uid) return;
    
    try {
      const challenges = await getAvailableChallenges(user.uid);
      setSkillChallenges(challenges || []);
      
      if (challenges && challenges.length > 0 && userStats) {
        const recommended = recommendTodayChallenge(challenges, userStats);
        setTodaySkillChallenge(recommended || null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement challenges:', error);
      setSkillChallenges([]);
      setTodaySkillChallenge(null);
    }
  };

  const handleStartAdventure = () => {
    setShowQuestModal(true);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Background avec parallax */}
      <ImageBackground
        source={BACKGROUND_IMAGE}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Gradient overlay */}
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.95)']}
          style={styles.gradient}
        />

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <UserHeader user={userStats} compact={true} />
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Avatar animé */}
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                transform: [{ translateY: avatarBounceAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Glow effect derrière l'avatar */}
            <Animated.View
              style={[
                styles.avatarGlow,
                { opacity: glowOpacity },
              ]}
            />

            {/* Avatar placeholder (remplacer par image réelle) */}
            <View style={styles.avatarCircle}>
              <Icon name="account" size={120} color="#06B6D4" />
            </View>

            {/* Titre du personnage */}
            <Text style={styles.heroTitle}>
              {userStats?.title || 'Guerrier'}
            </Text>
            <Text style={styles.heroLevel}>
              Niveau {userStats?.globalLevel || 1}
            </Text>
          </Animated.View>

          {/* Bouton principal "COMMENCER L'AVENTURE" */}
          <Animated.View
            style={[
              styles.mainButtonContainer,
              { opacity: fadeAnim },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleStartAdventure}
              style={styles.mainButton}
            >
              <LinearGradient
                colors={['#3B82F6', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {/* Glow effect */}
                <Animated.View
                  style={[
                    styles.buttonGlow,
                    { opacity: glowOpacity },
                  ]}
                />

                <Icon name="sword" size={32} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>COMMENCER L'AVENTURE</Text>
                <Icon name="chevron-right" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Sous-titre */}
            <Text style={styles.subtitle}>
              Choisis ta quête et prouve ta valeur
            </Text>
          </Animated.View>
        </View>

        {/* Quick Stats Footer */}
        <Animated.View
          style={[styles.quickStats, { opacity: fadeAnim }]}
        >
          <StatItem icon="fire" value={userStats?.streakDays || 0} label="Jours" color="#F59E0B" />
          <StatItem icon="star" value={userStats?.globalXP || 0} label="XP" color="#FFD700" />
          <StatItem icon="trophy" value="12" label="Rang" color="#10B981" />
        </Animated.View>
      </ImageBackground>

      {/* Quest Selection Modal */}
      <QuestSelectionModal
        visible={showQuestModal}
        onClose={() => setShowQuestModal(false)}
        navigation={navigation}
        todayChallenge={todayChallenge}
        mainQuest={todaySkillChallenge}
        sideQuests={skillChallenges}
      />
    </View>
  );
};

const StatItem = ({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  avatarGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#06B6D4',
    top: 10,
  },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 3,
    borderColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroLevel: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  mainButtonContainer: {
    alignItems: 'center',
  },
  mainButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    zIndex: -1,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginRight: 8,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});

export default BattleScreenHeroLanding;
