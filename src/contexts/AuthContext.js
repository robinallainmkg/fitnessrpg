import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🔥 AUTHCONTEXT: Mode Développement avec Persistence AsyncStorage');

const AuthContext = createContext();

// Clés de stockage
const STORAGE_KEY = '@user_session';
const USER_DATA_KEY = '@user_data';

// Simulateur Firebase avec vraie persistence
const DevAuthService = {
  // Sauvegarder la session
  saveSession: async (user) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      console.log('💾 Session sauvegardée dans AsyncStorage');
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
    }
  },

  // Charger la session
  loadSession: async () => {
    try {
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log('✅ Session restaurée:', user.email);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur chargement session:', error);
      return null;
    }
  },

  // Supprimer la session
  clearSession: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      console.log('🗑️ Session supprimée');
    } catch (error) {
      console.error('❌ Erreur suppression session:', error);
    }
  },

  // Sauvegarder données utilisateur
  saveUserData: async (userData) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('💾 Données utilisateur sauvegardées');
    } catch (error) {
      console.error('❌ Erreur sauvegarde données:', error);
    }
  },

  // Login simulé
  login: async (email, password) => {
    console.log('🔄 Login développement:', email);
    
    // Simuler délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = {
      uid: 'dev-user-' + Date.now(),
      email: email,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    await DevAuthService.saveSession(user);
    
    // Créer données utilisateur par défaut
    const userData = {
      email: user.email,
      totalXP: 0,
      level: 1,
      completedPrograms: [],
      userProgress: {},
      streak: 0,
      lastWorkoutDate: null,
      createdAt: new Date().toISOString(),
    };
    
    await DevAuthService.saveUserData(userData);
    
    return user;
  },

  // Signup simulé
  signup: async (email, password) => {
    console.log('🔄 Signup développement:', email);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return await DevAuthService.login(email, password);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger la session au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initialisation Auth avec persistence...');
      
      try {
        const savedUser = await DevAuthService.loadSession();
        if (savedUser) {
          setUser(savedUser);
          console.log('✅ Utilisateur connecté automatiquement:', savedUser.email);
        } else {
          console.log('ℹ️ Aucune session sauvegardée');
        }
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signup = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔄 Inscription:', email);
      
      const newUser = await DevAuthService.signup(email, password);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔄 Connexion:', email);
      
      const loggedUser = await DevAuthService.login(email, password);
      setUser(loggedUser);
      
      return { success: true, user: loggedUser };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Déconnexion');
      await DevAuthService.clearSession();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  };

  const resetUserData = async () => {
    try {
      if (!user) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }
      
      console.log('🔄 RESET: Réinitialisation des données utilisateur');
      
      const resetData = {
        totalXP: 0,
        email: user.email,
        createdAt: new Date().toISOString(),
        level: 1,
        completedPrograms: [],
        userProgress: {},
        streak: 0,
        lastWorkoutDate: null
      };
      
      await DevAuthService.saveUserData(resetData);
      console.log('✅ RESET: Données utilisateur réinitialisées');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur reset:', error);
      return { success: false, error: 'Erreur lors de la réinitialisation' };
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
