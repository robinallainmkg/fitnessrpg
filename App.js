import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supprimer les warnings de dépréciation Firebase (temporaire jusqu'à migration v9)
LogBox.ignoreLogs([
  'deprecated',
  'React Native Firebase',
  'migrating-to-v22',
]);

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { WorkoutProvider } from './src/contexts/WorkoutContext';
import { ChallengeProvider } from './src/contexts/ChallengeContext';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { PhoneLoginScreen } from './src/screens/PhoneLoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProgramSelectionScreen from './src/screens/ProgramSelectionScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import SkillTreeScreen from './src/screens/SkillTreeScreen';
import SkillDetailScreen from './src/screens/SkillDetailScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutPreviewScreen from './src/screens/WorkoutPreviewScreen';
import WorkoutSummaryScreen from './src/screens/WorkoutSummaryScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DebugOnboardingScreen from './src/screens/DebugOnboardingScreen';
import DebugScreen from './src/screens/DebugScreen';
import ManageActiveProgramsScreen from './src/screens/ManageActiveProgramsScreen';
import FirestoreDiagnosticScreen from './src/screens/FirestoreDiagnosticScreen';
import DevDiagnosticScreen from './src/screens/DevDiagnosticScreen';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { AdminReviewScreen } from './src/screens/AdminReviewScreen';

// Components
import FirebaseDebug from './src/components/FirebaseDebug';
import ErrorBoundary from './src/components/ErrorBoundary';
import FirebaseDiagnostic from './src/components/FirebaseDiagnostic';

// Theme
import { colors } from './src/theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    disabled: colors.textSecondary,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Composant personnalisé pour les boutons de navigation
const CustomTabBarButton = ({ children, onPress, accessibilityState, label }) => {
  const focused = accessibilityState.selected;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        {/* Indicateur lumineux en haut quand actif */}
        {focused && (
          <View style={styles.activeIndicator} />
        )}
        
        {/* Label du texte */}
        <Text style={[
          styles.tabLabel,
          focused && styles.tabLabelActive
        ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false, // On gère le label nous-mêmes
        tabBarStyle: {
          backgroundColor: '#0F172A', // Bleu marine très foncé
          borderTopWidth: 2,
          borderTopColor: 'rgba(77, 158, 255, 0.2)', // Bordure néon subtile
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#4D9EFF',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 20,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          headerShown: false,
          tabBarButton: (props) => <CustomTabBarButton {...props} label="ACCUEIL" />,
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ 
          title: 'Progression',
          tabBarButton: (props) => <CustomTabBarButton {...props} label="PROGRESSION" />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profil',
          tabBarButton: (props) => <CustomTabBarButton {...props} label="PROFIL" />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, isGuest, loading, startGuestMode } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isInitializingGuest, setIsInitializingGuest] = useState(false);
  const navigationRef = React.useRef(null);

  // ═══ HOOK 1: Vérifier onboarding ═══
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('@fitnessrpg:onboarding_completed');
        const isCompleted = completed === 'true';
        setIsOnboardingCompleted(isCompleted);
      } catch (error) {
        console.error('❌ Erreur vérification onboarding:', error);
        setIsOnboardingCompleted(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    setIsCheckingOnboarding(true);
    checkOnboarding();
    
    // Pas d'interval - on vérifie juste une fois au mount
  }, []); // Dépendances vides = vérifie seulement au premier mount

  // ═══ HOOK 2: Auto-démarrer mode invité si pas d'utilisateur ═══
  useEffect(() => {
    const initGuestMode = async () => {
      // Si onboarding complété mais pas d'utilisateur Firebase → Démarrer anonymous auth
      if (isOnboardingCompleted && !user && !loading && !isCheckingOnboarding && !isInitializingGuest) {
        console.log('🎮 Démarrage automatique du mode invité (Anonymous Auth)');
        setIsInitializingGuest(true);
        const result = await startGuestMode();
        
        // Si erreur, arrêter le loading pour éviter boucle infinie
        if (!result.success) {
          console.error('❌ Impossible de démarrer le mode invité:', result.error);
          setIsInitializingGuest(false);
        }
      }
    };

    initGuestMode();
  }, [isOnboardingCompleted, user, loading, isCheckingOnboarding, isInitializingGuest]);

  // ═══ HOOK 3: Réinitialiser isInitializingGuest quand user est défini ═══
  useEffect(() => {
    if (user && isInitializingGuest) {
      console.log('✅ Mode invité initialisé - user défini');
      setIsInitializingGuest(false);
    }
  }, [user, isInitializingGuest]);

  // ═══ RENDERING LOGIC ═══
  // Si pas d'utilisateur et pas en cours d'init → Erreur de configuration
  if (!user && !loading && !isCheckingOnboarding && !isInitializingGuest && isOnboardingCompleted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12, textAlign: 'center' }}>
          Erreur de configuration
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          L'authentification anonyme doit être activée dans Firebase Console.
          {'\n\n'}
          Authentication → Sign-in method → Anonymous → Activer
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12 }}
          onPress={() => {
            setIsInitializingGuest(false);
            // Force reload
            window.location.reload?.();
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Afficher un écran de chargement pendant la vérification AuthContext OU onboarding OU initialisation guest
  if (loading || isCheckingOnboarding || isInitializingGuest) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text }}>
          {isInitializingGuest ? 'Initialisation...' : 'Chargement...'}
        </Text>
      </View>
    );
  }

  // Si pas d'onboarding → Afficher Onboarding screen
  if (!isOnboardingCompleted) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen 
                {...props} 
                onComplete={() => setIsOnboardingCompleted(true)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Main app
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E293B',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            letterSpacing: 0.5,
          },
          headerBackVisible: true, // Forcer l'affichage du bouton retour
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PhoneLogin" 
          component={PhoneLoginScreen}
          options={{ 
            title: 'Connexion',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ProgramSelection" 
          component={ProgramSelectionScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="SkillTree" 
          component={SkillTreeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProgramDetail"
          component={SkillDetailScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="WorkoutPreview"
          component={WorkoutPreviewScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="WorkoutSummary"
          component={WorkoutSummaryScreen}
          options={{ 
            title: '🏆 Résumé de Session',
            gestureEnabled: false,
            headerStyle: {
              backgroundColor: '#7B61FF',
              elevation: 8,
              shadowColor: '#7B61FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              letterSpacing: 0.5,
            },
          }}
        />
        <Stack.Screen
          name="Challenge"
          component={ChallengeScreen}
          options={{ 
            title: '⚔️ Défi du Jour',
            headerStyle: {
              backgroundColor: '#F59E0B',
              elevation: 6,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              letterSpacing: 0.5,
            },
          }}
        />
        <Stack.Screen
          name="Programs"
          component={ProgramsScreen}
          options={{ 
            title: '📚 Mes Programmes',
            headerStyle: {
              backgroundColor: '#4D9EFF',
              elevation: 6,
              shadowColor: '#4D9EFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              letterSpacing: 0.5,
            },
          }}
        />
        <Stack.Screen
          name="ManageActivePrograms"
          component={ManageActiveProgramsScreen}
          options={{ 
            title: '⚙️ Gérer mes Programmes',
            headerStyle: {
              backgroundColor: '#4D9EFF',
              elevation: 6,
              shadowColor: '#4D9EFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              letterSpacing: 0.5,
            },
          }}
        />
        <Stack.Screen
          name="DebugScreen"
          component={DebugScreen}
          options={{ 
            title: '🔍 Debug Onboarding',
            headerStyle: {
              backgroundColor: '#6366f1',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="FirebaseDiagnostic"
          component={FirebaseDiagnostic}
          options={{ 
            title: '🔥 Firebase Diagnostic',
            headerStyle: {
              backgroundColor: '#f59e0b',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="DebugOnboarding"
          component={DebugOnboardingScreen}
          options={{ 
            title: '🔧 Debug Onboarding',
            headerStyle: {
              backgroundColor: '#6366f1',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="FirestoreDiagnostic"
          component={FirestoreDiagnosticScreen}
          options={{ 
            title: '🔍 Diagnostic Firestore',
            headerStyle: {
              backgroundColor: '#EF4444',
              elevation: 6,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="DevDiagnostic"
          component={DevDiagnosticScreen}
          options={{ 
            title: '🔧 Developer Diagnostics',
            headerStyle: {
              backgroundColor: '#FF9800',
              elevation: 6,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="AdminReview"
          component={AdminReviewScreen}
          options={{ 
            title: '🔍 Validation Défis',
            headerStyle: {
              backgroundColor: '#F59E0B',
              elevation: 6,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              letterSpacing: 0.5,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <WorkoutProvider>
            <ChallengeProvider>
              <StatusBar style="light" backgroundColor={colors.primary} />
              <AppNavigator />
              <FirebaseDebug />
            </ChallengeProvider>
          </WorkoutProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}

// Styles pour la navigation personnalisée
const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: '70%',
    height: 3,
    backgroundColor: '#4D9EFF',
    borderRadius: 2,
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(148, 163, 184, 0.6)', // Inactif : gris bleuté transparent
    marginTop: 8,
  },
  tabLabelActive: {
    color: '#4D9EFF', // Actif : bleu néon
    textShadowColor: 'rgba(77, 158, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
