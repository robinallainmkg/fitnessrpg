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

// Screens
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProgramSelectionScreen from './src/screens/ProgramSelectionScreen';
import ProgramsScreen from './src/screens/ProgramsScreen';
import SkillTreeScreen from './src/screens/SkillTreeScreen';
import SkillDetailScreen from './src/screens/SkillDetailScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutSummaryScreen from './src/screens/WorkoutSummaryScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DebugOnboardingScreen from './src/screens/DebugOnboardingScreen';
import DebugScreen from './src/screens/DebugScreen';
import ManageActiveProgramsScreen from './src/screens/ManageActiveProgramsScreen';
import FirestoreDiagnosticScreen from './src/screens/FirestoreDiagnosticScreen';

// Components
import FirebaseDebug from './src/components/FirebaseDebug';
import ErrorBoundary from './src/components/ErrorBoundary';

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
  const { user, isGuest, loading } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Vérifier UNIQUEMENT AsyncStorage pour l'onboarding
        // L'onboarding ne doit s'afficher qu'UNE SEULE FOIS au premier lancement
        const completed = await AsyncStorage.getItem('@fitnessrpg:onboarding_completed');
        const isCompleted = completed === 'true';
        setIsOnboardingCompleted(isCompleted);
        console.log('========================================');
        console.log('🔍 ONBOARDING CHECK');
        console.log('========================================');
        console.log('AsyncStorage value:', completed);
        console.log('Is completed?', isCompleted);
        console.log('User:', user?.email || 'Guest');
        console.log('Is Guest?', isGuest);
        console.log('Loading:', loading);
        console.log('Will navigate to:', isCompleted ? 'Main' : 'Onboarding');
        console.log('========================================');
      } catch (error) {
        console.error('❌ Erreur vérification onboarding:', error);
        setIsOnboardingCompleted(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    // Vérifier pour tous (user, guest, ou anonyme)
    setIsCheckingOnboarding(true);
    checkOnboarding();
  }, [user, isGuest, loading]); // ✅ Ajouter 'loading' pour re-check quand auth change

  // Afficher un écran de chargement pendant la vérification AuthContext OU onboarding
  if (loading || isCheckingOnboarding) {
    console.log('⏳ Loading... (AuthContext:', loading, ', CheckingOnboarding:', isCheckingOnboarding, ')');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text }}>Chargement...</Text>
      </View>
    );
  }

  console.log('🎯 RENDERING NAVIGATOR');
  console.log('User:', user?.email || 'Not logged in');
  console.log('Is Guest:', isGuest);
  console.log('isOnboardingCompleted:', isOnboardingCompleted);

  // PRIORITÉ 1: Si onboarding pas complété, afficher Onboarding + ProgramSelection
  // Ceci permet aux nouveaux utilisateurs de découvrir l'app en mode guest
  if (!isOnboardingCompleted) {
    console.log('→ Showing Onboarding screen (onboarding not completed)');
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, headerBackVisible: true }}>
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ 
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="ProgramSelection" 
            component={ProgramSelectionScreen}
            options={{
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // PRIORITÉ 2: Si onboarding complété MAIS pas d'user ET pas guest
  // = Utilisateur qui s'est déconnecté et veut se reconnecter
  if (!user && !isGuest) {
    console.log('→ Showing Auth screen (onboarding done, but no user and no guest - returning user)');
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // PRIORITÉ 3: Main app (user connecté OU en mode guest)
  console.log('→ Showing Main app', user ? '(authenticated)' : '(guest mode)');
  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Composant de chargement Firebase
const FirebaseInitializer = ({ children }) => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Run quick Firestore diagnostic (only in development)
        if (__DEV__) {
          console.log('\n🔍 === FIRESTORE CONNECTION TEST ===');
          const firestore = require('@react-native-firebase/firestore').default;
          const auth = require('@react-native-firebase/auth').default;
          
          try {
            // Wait for auth to be ready first
            const currentUser = auth().currentUser;
            
            if (!currentUser) {
              console.log('⏭️  Skipping Firestore test - user not authenticated yet\n');
              setIsFirebaseReady(true);
              return;
            }
            
            // Quick test with user's own document (authorized by rules)
            const testPromise = firestore().collection('users').doc(currentUser.uid).get();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('TIMEOUT')), 3000)
            );
            
            await Promise.race([testPromise, timeoutPromise]);
            console.log('✅ Firestore CONNECTED - app will work normally\n');
            
          } catch (error) {
            if (error.message === 'TIMEOUT' || error.code === 'firestore/unavailable') {
              console.warn('\n⚠️  ========================================');
              console.warn('⚠️  FIRESTORE UNAVAILABLE');
              console.warn('⚠️  ========================================');
              console.warn('');
              console.warn('📋 CHECKLIST:');
              console.warn('   1. Vérifier connexion internet');
              console.warn('   2. Firebase Console → Firestore Database');
              console.warn('      → Créer la base si nécessaire');
              console.warn('   3. Vérifier Security Rules (test mode)');
              console.warn('   4. Vérifier google-services.json');
              console.warn('');
              console.warn("💡 L'app fonctionne en MODE DEGRADÉ");
              console.warn('   (données par défaut affichées)\n');
              console.warn('📖 Guide complet: FIRESTORE_UNAVAILABLE_FIX_GUIDE.md');
              console.warn('⚠️  ========================================\n');
            } else if (error.code === 'firestore/permission-denied') {
              console.error('\n🔒 PERMISSION DENIED - Firestore rules blocking');
              console.error('💡 Set test mode rules in Firebase Console\n');
            }
          }
        }
        
        setIsFirebaseReady(true);
      } catch (error) {
        console.error('Firebase init error:', error);
        setIsFirebaseReady(true); // Continue anyway
      }
    };
    
    initFirebase();
  }, []);

  if (!isFirebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text }}>Initialisation...</Text>
      </View>
    );
  }

  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <FirebaseInitializer>
          <AuthProvider>
            <WorkoutProvider>
              <StatusBar style="light" backgroundColor={colors.primary} />
              <AppNavigator />
              <FirebaseDebug />
            </WorkoutProvider>
          </AuthProvider>
        </FirebaseInitializer>
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
