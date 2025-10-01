import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { testFirebaseConnection } from '../utils/firebaseTest';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthProvider: Setting up auth listener');
    
    // Test Firebase connection
    testFirebaseConnection();
    
    // Vérification visuelle
    if (!auth) {
      console.error('❌ AUTH NOT AVAILABLE');
      Alert.alert('Erreur Firebase', 'Auth service non disponible');
      setLoading(false);
      return;
    }
    
    if (!db) {
      console.error('❌ FIRESTORE NOT AVAILABLE');
      Alert.alert('Erreur Firebase', 'Firestore service non disponible');
    }
    
    console.log('✅ Firebase services OK, setting up listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? `Logged in: ${user.email}` : 'Logged out');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Inscription avec email et mot de passe
   */
  const signup = async (email, password) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        totalXP: 0,
        createdAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur signup:', error);
      return { success: false, error: translateFirebaseError(error.code) };
    }
  };

  /**
   * Connexion avec email et mot de passe
   */
  const login = async (email, password) => {
    try {
      console.log('Tentative de connexion avec:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Connexion réussie');
      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      console.error('Code erreur:', error.code);
      console.error('Message:', error.message);
      return { success: false, error: translateFirebaseError(error.code) };
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Erreur logout:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  };

  /**
   * Traduit les codes d'erreur Firebase en français
   */
  const translateFirebaseError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/operation-not-allowed':
        return 'Opération non autorisée';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet';
      default:
        return 'Une erreur est survenue. Veuillez réessayer';
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
