import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 1,
    icon: '🚀',
    title: 'Bienvenue dans HybridRPG',
    subtitle: 'Entraîne-toi. Gagne de l\'XP. Évolue.',
    description: 'Ton corps est ton avatar. Chaque entraînement est une mission qui te rapporte de l\'XP et te fait monter de niveau. Transforme ta progression fitness en aventure RPG.',
  },
  {
    id: 2,
    icon: '🌳',
    title: 'Arbre de Compétences',
    subtitle: 'Deviens un athlète hybride complet',
    description: 'Choisis tes disciplines, débloque des skills et développe-toi dans plusieurs domaines. Force, endurance, mobilité : maîtrise-les tous.',
  },
  {
    id: 3,
    icon: '⚔️',
    title: 'Quêtes & Programmes',
    subtitle: 'Ta transformation commence maintenant',
    description: 'Suis des programmes structurés, accomplis des quêtes uniques et atteins tes objectifs. Chaque séance te rapproche de la forme ultime.',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const { setGuestMode } = useAuth();

  const animateTransition = (callback) => {
    // Changer le contenu immédiatement
    callback();
    
    // Réinitialiser fadeAnim à 1 pour s'assurer que le contenu est visible
    fadeAnim.setValue(1);
    iconScale.setValue(1);
  };

  const handleNext = () => {
    console.log('📱 handleNext - currentStep:', currentStep);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      animateTransition(() => {
        const newStep = currentStep + 1;
        console.log('✅ Moving to step:', newStep);
        setCurrentStep(newStep);
      });
    } else {
      console.log('🏁 Last step - finishing onboarding');
      handleFinish();
    }
  };

  const handleBack = () => {
    console.log('⬅️ handleBack - currentStep:', currentStep);
    if (currentStep > 0) {
      animateTransition(() => {
        const newStep = currentStep - 1;
        console.log('✅ Moving to step:', newStep);
        setCurrentStep(newStep);
      });
    }
  };

  const handleSkip = async () => {
    console.log('⏭️ Skip onboarding - Activation mode invité');
    try {
      await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
      // Flag pour dire à HomeScreen d'ouvrir ProgramSelection
      await AsyncStorage.setItem('@fitnessrpg:open_program_selection', 'true');
      console.log('✅ AsyncStorage updated with flag to open ProgramSelection');
      await setGuestMode();
      console.log('✅ Guest mode activated - App.js will navigate to Main');
    } catch (error) {
      console.error('❌ Error in handleSkip:', error);
    }
  };

  const handleFinish = async () => {
    console.log('🏁 Finish onboarding - Activation mode invité');
    try {
      await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
      // Flag pour dire à HomeScreen d'ouvrir ProgramSelection
      await AsyncStorage.setItem('@fitnessrpg:open_program_selection', 'true');
      console.log('✅ AsyncStorage updated with flag to open ProgramSelection');
      await setGuestMode();
      console.log('✅ Guest mode activated - App.js will navigate to Main');
    } catch (error) {
      console.error('❌ Error in handleFinish:', error);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Animation de pulse pour l'icône
  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [currentStep]);

  return (
    <ImageBackground
      source={require('../../assets/Home-BG-2.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <View style={styles.container}>
        {/* Bouton Skip en haut à droite */}
        {!isLastStep && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Passer →</Text>
          </TouchableOpacity>
        )}

        {/* Contenu principal */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icône avec animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            <View style={styles.iconGlow}>
              <Text style={styles.icon}>{currentStepData.icon}</Text>
            </View>
          </Animated.View>

          {/* Titre principal */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>

            {/* Sous-titre */}
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

            {/* Description */}
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>
        </Animated.View>

        {/* Indicateurs de progression (Dots) */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
              ]}
            >
              {index === currentStep && <View style={styles.dotGlow} />}
            </View>
          ))}
        </View>

        {/* Boutons de navigation */}
        <View style={styles.buttonsContainer}>
          {/* Bouton Retour */}
          {!isFirstStep && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
          )}

          {/* Espaceur pour pousser le bouton suivant à droite */}
          <View style={{ flex: 1 }} />

          {/* Bouton Suivant / Commencer */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <View style={styles.nextButtonGlow} />
            <Text style={styles.nextButtonText}>
              {isLastStep ? '⚔️ GO' : 'Suivant →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Légèrement moins sombre pour plus de contraste
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  iconGlow: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 100,
    textAlign: 'center',
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  textContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
    maxWidth: 600,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
    lineHeight: 38,
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4D9EFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    position: 'relative',
  },
  dotActive: {
    width: 32,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4D9EFF',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  dotGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
    backgroundColor: '#4D9EFF',
    opacity: 0.5,
    transform: [{ scale: 1.5 }],
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#4D9EFF',
    borderWidth: 3,
    borderColor: '#7B61FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7B61FF',
    opacity: 0.3,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default OnboardingScreen;
