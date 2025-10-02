import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Initialiser Firebase en premier
import './src/services/firebase';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { WorkoutProvider } from './src/contexts/WorkoutContext';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import SkillTreeScreen from './src/screens/SkillTreeScreen';
import ProgramDetailScreen from './src/screens/ProgramDetailScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutSummaryScreen from './src/screens/WorkoutSummaryScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Components
import FirebaseDebug from './src/components/FirebaseDebug';

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

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'chart-line' : 'chart-line-variant';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ title: 'Progression' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SkillTree" 
              component={SkillTreeScreen}
              options={({ route }) => ({
                title: route.params?.category?.name || 'Arbre de Compétences',
                headerStyle: {
                  backgroundColor: route.params?.category?.color || '#6C63FF',
                },
                headerTintColor: '#fff',
              })}
            />
            <Stack.Screen
              name="ProgramDetail"
              component={ProgramDetailScreen}
              options={{ title: 'Programme' }}
            />
            <Stack.Screen
              name="Workout"
              component={WorkoutScreen}
              options={{ 
                title: 'Entraînement',
                headerLeft: null,
                gestureEnabled: false
              }}
            />
            <Stack.Screen
              name="WorkoutSummary"
              component={WorkoutSummaryScreen}
              options={{ 
                title: 'Résumé',
                gestureEnabled: false
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Composant de chargement Firebase
const FirebaseInitializer = ({ children }) => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    // Petit délai pour s'assurer que Firebase est complètement initialisé
    const timer = setTimeout(() => {
      setIsFirebaseReady(true);
    }, 100);

    return () => clearTimeout(timer);
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
  );
}
