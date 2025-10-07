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

const AuthContext = createContext();

// Fonction utilitaire pour créer le profil utilisateur
const createUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const userData = {
        email: user.email,
        totalXP: 0,
        level: 1,
        completedPrograms: [],
        userProgress: {},
        streak: 0,
        lastWorkoutDate: null,
        createdAt: new Date(),
      };
      
      await setDoc(userRef, userData);
      console.log('✅ Profil utilisateur créé');
    }
  } catch (error) {
    console.error('❌ Erreur création profil:', error);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: Initialisation listener Firebase Auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔔 Firebase Auth State Changed:', firebaseUser ? `Connecté: ${firebaseUser.email}` : 'Déconnecté');
      
      if (firebaseUser) {
        // Utilisateur connecté - créer profil si nécessaire
        await createUserProfile(firebaseUser);
        setUser(firebaseUser);
      } else {
        // Utilisateur déconnecté
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup
    return () => {
      console.log('🔄 AuthContext: Nettoyage listener');
      unsubscribe();
    };
  }, []);

  const signup = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔄 Inscription avec Firebase:', email);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Inscription réussie');
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔄 Connexion avec Firebase:', email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion réussie');
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      
      let errorMessage = 'Erreur lors de la connexion';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cette adresse email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Attendez 15 minutes ou créez un nouveau compte pour tester';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Déconnexion Firebase');
      await signOut(auth);
      console.log('✅ Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
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
      
      // Reset des données dans Firestore
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
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, resetData);
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
