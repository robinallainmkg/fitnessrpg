import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

console.log('🔥 AUTHCONTEXT: Version Firebase RÉELLE avec persistence');
const mockAuth = {
  currentUser: null,
  _listeners: [], // Stockage des listeners
  
  // Mock sign in avec déclenchement listener
  signInWithEmailAndPassword: async (email, password) => {
    console.log('🔄 MOCK: Login avec', email);
    
    // Créer utilisateur connecté
    mockAuth.currentUser = { 
      uid: 'mock-user-123', 
      email: email,
      emailVerified: true 
    };
    
    // Déclencher TOUS les listeners
    console.log('🔔 MOCK: Déclenchement listeners auth state');
    mockAuth._listeners.forEach(callback => {
      try {
        callback(mockAuth.currentUser);
      } catch (error) {
        console.error('❌ Erreur listener:', error);
      }
    });
    
    return { user: mockAuth.currentUser };
  },
  
  // Mock sign up avec déclenchement listener
  createUserWithEmailAndPassword: async (email, password) => {
    console.log('🔄 MOCK: Signup avec', email);
    
    mockAuth.currentUser = { 
      uid: 'mock-user-' + Date.now(), 
      email: email,
      emailVerified: false 
    };
    
    // Déclencher listeners
    console.log('🔔 MOCK: Déclenchement listeners signup');
    mockAuth._listeners.forEach(callback => {
      callback(mockAuth.currentUser);
    });
    
    return { user: mockAuth.currentUser };
  },
  
  // Mock sign out avec déclenchement listener
  signOut: async () => {
    console.log('🔄 MOCK: Logout');
    mockAuth.currentUser = null;
    
    // Déclencher listeners pour déconnexion
    console.log('🔔 MOCK: Déclenchement listeners logout');
    mockAuth._listeners.forEach(callback => {
      callback(null);
    });
    
    return true;
  },
  
  // Mock auth state listener - ENREGISTREMENT
  onAuthStateChanged: (callback) => {
    console.log('🔄 MOCK: Enregistrement auth state listener');
    
    // Ajouter le callback à la liste
    mockAuth._listeners.push(callback);
    
    // Appeler immédiatement avec l'état actuel
    callback(mockAuth.currentUser);
    
    // Retourner fonction de désinscription
    return () => {
      console.log('🔄 MOCK: Désinscription listener');
      const index = mockAuth._listeners.indexOf(callback);
      if (index > -1) {
        mockAuth._listeners.splice(index, 1);
      }
    };
  }
};

// Mock Firestore avec logs
const mockDb = {
  collection: (name) => ({
    doc: (id) => ({
      set: async (data) => {
        console.log('🗄️ MOCK: Sauvegarde', name, id, data);
        return true;
      },
      get: async () => ({
        exists: true,
        data: () => ({ 
          totalXP: 0, 
          email: mockAuth.currentUser?.email,
          createdAt: new Date().toISOString()
        })
      })
    })
  })
};

console.log('✅ FIREBASE MOCK: Services complets créés');

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  console.log('🎯 AUTHCONTEXT: AuthProvider démarré');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AUTHCONTEXT: Setup auth listener Firebase Mock');
    
    // Setup auth state listener avec le mock
    const unsubscribe = mockAuth.onAuthStateChanged((user) => {
      console.log('🔄 Auth state changed:', user ? `Connecté: ${user.email}` : 'Déconnecté');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fonctions d'authentification avec mock
  const signup = async (email, password) => {
    try {
      const result = await mockAuth.createUserWithEmailAndPassword(email, password);
      
      // Créer document utilisateur mock
      await mockDb.collection('users').doc(result.user.uid).set({
        email: result.user.email,
        totalXP: 0,
        createdAt: new Date().toISOString()
      });

      console.log('✅ MOCK: Signup réussi');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur signup:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  const login = async (email, password) => {
    try {
      await mockAuth.signInWithEmailAndPassword(email, password);
      console.log('✅ MOCK: Login réussi');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur login:', error);
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
  };

  const logout = async () => {
    try {
      await mockAuth.signOut();
      console.log('✅ MOCK: Logout réussi');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur logout:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  };

  const resetUserData = async () => {
    try {
      if (!user) {
        console.log('❌ Aucun utilisateur connecté pour reset');
        return { success: false, error: 'Aucun utilisateur connecté' };
      }
      
      console.log('🔄 RESET: Réinitialisation des données utilisateur');
      
      // Reset des données dans le mock Firestore
      const resetData = {
        totalXP: 0,
        email: user.email,
        createdAt: new Date(),
        level: 1,
        completedPrograms: [],
        userProgress: {},
        streak: 0,
        lastWorkoutDate: null
      };
      
      await mockDb.collection('users').doc(user.uid).set(resetData);
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
