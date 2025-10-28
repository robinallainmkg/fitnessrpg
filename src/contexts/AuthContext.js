import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const IS_DEV = __DEV__;
const log = (...args) => IS_DEV && console.log(...args);
const logError = (...args) => console.error(...args);

// Batch AsyncStorage operations
const batchAsyncStorage = {
  async setMultiple(items) {
    return AsyncStorage.multiSet(items);
  },
  async removeMultiple(keys) {
    return AsyncStorage.multiRemove(keys);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState(null);

  // Initialisation Firebase Auth
  useEffect(() => {
    log('🔄 Initialisation Firebase Auth');
    
    // Charger le mode guest
    const loadGuestMode = async () => {
      try {
        const guestMode = await AsyncStorage.getItem('@fitnessrpg:guest_mode');
        const savedGuestData = await AsyncStorage.getItem('@fitnessrpg:guest_data');
        
        if (guestMode === 'true') {
          log('👤 Mode invité actif');
          setIsGuest(true);
          if (savedGuestData) {
            setGuestData(JSON.parse(savedGuestData));
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement guest mode:', error);
      }
    };
    
    loadGuestMode();

    // Écouter les changements d'authentification
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        log('✅ Utilisateur connecté:', firebaseUser.email || firebaseUser.phoneNumber);
        setUser(firebaseUser);
        setIsGuest(false);
        
        // Vérifier que le document existe (backup - normalement déjà créé par login/signup)
        try {
          const doc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
          
          if (!doc.exists) {
            log('📝 Création du document utilisateur (onAuthStateChanged backup)');
            await firestore()
              .collection('users')
              .doc(firebaseUser.uid)
              .set({
                email: firebaseUser.email || null,
                phoneNumber: firebaseUser.phoneNumber || null,
                totalXP: 0,
                level: 1,
                completedPrograms: [],
                userProgress: {},
                activePrograms: [],
                selectedPrograms: [],
                streak: 0,
                lastWorkoutDate: null,
                totalChallengesSubmitted: 0,
                totalChallengesApproved: 0,
                lastSubmissionDate: null,
                createdAt: firestore.FieldValue.serverTimestamp(),
              });
          }
        } catch (error) {
          console.error('⚠️ Erreur document:', error);
          // Non bloquant - l'utilisateur peut continuer
        }
      } else {
        log('ℹ️ Aucun utilisateur connecté');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // SIGNUP
  const signup = async (email, password) => {
    try {
      log('📝 Inscription:', email);
      
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email et mot de passe requis',
          code: 'validation/missing-fields'
        };
      }
      
      if (password.length < 6) {
        return {
          success: false,
          error: 'Le mot de passe doit contenir au moins 6 caractères',
          code: 'auth/weak-password'
        };
      }
      
      // Créer le compte
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const newUser = userCredential.user;
      
      // Créer le document Firestore
      await firestore()
        .collection('users')
        .doc(newUser.uid)
        .set({
          email: newUser.email,
          totalXP: 0,
          level: 1,
          completedPrograms: [],
          userProgress: {},
          activePrograms: [],      // ⭐ CORRECTION
          selectedPrograms: [],    // ⭐ CORRECTION
          streak: 0,
          lastWorkoutDate: null,
          totalChallengesSubmitted: 0,
          totalChallengesApproved: 0,
          lastSubmissionDate: null,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      
      // Nettoyer le mode invité
      await AsyncStorage.multiRemove([
        '@fitnessrpg:guest_mode',
        '@fitnessrpg:guest_data'
      ]);
      await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
      
      setIsGuest(false);
      setGuestData(null);
      
      log('✅ Inscription réussie');
      
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      
      const errorMessages = {
        'auth/email-already-in-use': 'Cet email est déjà utilisé',
        'auth/invalid-email': 'Email invalide',
        'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      };
      
      return { 
        success: false, 
        error: errorMessages[error.code] || error.message || 'Erreur lors de l\'inscription',
        code: error.code 
      };
    }
  };

  // PHONE AUTH - ENVOYER CODE SMS
  const sendVerificationCode = async (phoneNumber) => {
    try {
      log('📱 Envoi code SMS à:', phoneNumber);
      
      if (!phoneNumber || phoneNumber.length < 9) {
        return {
          success: false,
          error: 'Numéro de téléphone invalide',
          code: 'validation/invalid-phone'
        };
      }
      
      // Formater le numéro (ajouter +33 si nécessaire)
      let formattedPhone = phoneNumber.trim().replace(/\s/g, '');
      
      // Si commence pas par +, ajouter +33
      if (!formattedPhone.startsWith('+')) {
        // Si commence par 0, remplacer par +33
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+33' + formattedPhone.substring(1);
        } else {
          // Sinon (ex: 612345678), ajouter directement +33
          formattedPhone = '+33' + formattedPhone;
        }
      }
      
      log('📱 Numéro formaté:', formattedPhone);
      
      // Vérifier que Firebase est initialisé
      const app = auth().app;
      log('🔥 Firebase app:', app ? app.name : 'NOT INITIALIZED');
      
      if (!app) {
        throw new Error('Firebase not initialized');
      }
      
      // Appel Firebase avec timeout de 30s
      log('⏳ Appel Firebase signInWithPhoneNumber...');
      const signInPromise = auth().signInWithPhoneNumber(formattedPhone);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout après 30s')), 30000)
      );
      
      const confirmation = await Promise.race([signInPromise, timeoutPromise]);
      
      log('✅ Code SMS envoyé');
      
      return {
        success: true,
        confirmation,
        phoneNumber: formattedPhone
      };
      
    } catch (error) {
      logError('❌ Erreur envoi SMS:', error);
      
      let errorMessage = 'Erreur lors de l\'envoi du code';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  };

  // PHONE AUTH - VÉRIFIER CODE SMS
  const verifyCode = async (confirmation, code) => {
    try {
      log('🔐 Vérification code SMS:', code);
      
      if (!code || code.length !== 6) {
        return {
          success: false,
          error: 'Code invalide (6 chiffres requis)',
          code: 'validation/invalid-code'
        };
      }
      
      const userCredential = await confirmation.confirm(code);
      const loggedUser = userCredential.user;
      
      log('✅ Code validé, utilisateur connecté:', loggedUser.uid);
      
      // Créer/mettre à jour le document utilisateur
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(loggedUser.uid)
          .get();
        
        if (!userDoc.exists) {
          log('📝 Création document utilisateur...');
          
          // Récupérer les données invité si elles existent
          const guestDataStr = await AsyncStorage.getItem('@fitnessrpg:guest_data');
          const guestData = guestDataStr ? JSON.parse(guestDataStr) : null;
          
          await firestore()
            .collection('users')
            .doc(loggedUser.uid)
            .set({
              phoneNumber: loggedUser.phoneNumber,
              totalXP: guestData?.totalXP || 0,
              level: guestData?.level || 1,
              completedPrograms: guestData?.completedPrograms || [],
              userProgress: guestData?.userProgress || {},
              activePrograms: guestData?.activePrograms || [],
              selectedPrograms: guestData?.selectedPrograms || [],
              streak: guestData?.streak || 0,
              lastWorkoutDate: guestData?.lastWorkoutDate || null,
              totalChallengesSubmitted: 0,
              totalChallengesApproved: 0,
              lastSubmissionDate: null,
              createdAt: firestore.FieldValue.serverTimestamp(),
            });
          log('✅ Document créé avec données invité');
        } else {
          log('✅ Document existe déjà');
        }
      } catch (firestoreError) {
        logError('⚠️ Erreur Firestore (non bloquant):', firestoreError);
      }
      
      // Nettoyer le mode invité
      await AsyncStorage.multiRemove([
        '@fitnessrpg:guest_mode',
        '@fitnessrpg:guest_data'
      ]);
      await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
      
      setIsGuest(false);
      setGuestData(null);
      
      log('✅ CONNEXION COMPLETE');
      
      return { success: true, user: loggedUser };
      
    } catch (error) {
      logError('❌ Erreur vérification code:', error);
      
      let errorMessage = 'Code incorrect';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Code invalide ou expiré';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Code expiré. Demandez-en un nouveau.';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  };

  // LOGIN (OLD - KEEP FOR COMPATIBILITY)
  const login = async (email, password) => {
    try {
      log('🔐 Login START (EMAIL - DEPRECATED):', email);
      
      // � EMAIL AUTH NE MARCHE PAS - TIMEOUT
      // Redirige vers Phone Auth à la place
      return {
        success: false,
        error: 'Email auth temporairement indisponible. Utilise Phone Auth.',
        code: 'auth/email-deprecated',
        usePhoneAuth: true
      };
      
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      
      const errorMessages = {
        'auth/user-not-found': 'Aucun compte avec cet email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/invalid-email': 'Email invalide',
        'auth/user-disabled': 'Ce compte a été désactivé',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/invalid-credential': 'Email ou mot de passe incorrect',
      };
      
      return { 
        success: false, 
        error: errorMessages[error.code] || error.message || 'Erreur lors de la connexion',
        code: error.code 
      };
    }
  };

  // RESET PASSWORD
  const resetPassword = async (email) => {
    try {
      log('🔑 Reset password pour:', email);
      
      if (!email) {
        return {
          success: false,
          error: 'Email requis',
          code: 'validation/missing-email'
        };
      }
      
      await auth().sendPasswordResetEmail(email);
      
      log('✅ Email de reset envoyé');
      
      return { 
        success: true,
        message: 'Email de réinitialisation envoyé'
      };
      
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      
      const errorMessages = {
        'auth/user-not-found': 'Aucun compte associé à cet email',
        'auth/invalid-email': 'Email invalide',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
      };
      
      return {
        success: false,
        error: errorMessages[error.code] || error.message || 'Erreur lors de l\'envoi',
        code: error.code
      };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      setLoading(true);
      log('🔄 Déconnexion...');
      
      await auth().signOut();
      
      await AsyncStorage.multiRemove([
        '@fitnessrpg:onboarding_completed',
        '@fitnessrpg:guest_mode',
        '@fitnessrpg:guest_data',
        '@fitnessrpg:tree_tooltip_shown'
      ]);
      
      setUser(null);
      setIsGuest(false);
      setGuestData(null);
      
      log('✅ Déconnexion réussie');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // MODE INVITÉ
  const setGuestMode = async () => {
    try {
      log('👤 Activation mode invité');
      setIsGuest(true);
      await AsyncStorage.setItem('@fitnessrpg:guest_mode', 'true');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mode invité:', error);
      return { success: false, error: error.message };
    }
  };

  const saveGuestData = async (data) => {
    try {
      setGuestData(data);
      await AsyncStorage.setItem('@fitnessrpg:guest_data', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde guest:', error);
      return { success: false, error: error.message };
    }
  };

  // CONVERSION INVITÉ → UTILISATEUR
  const convertGuestToUser = async (email, password) => {
    try {
      log('🔄 Conversion invité → utilisateur:', email);
      
      // Validation
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email et mot de passe requis',
          code: 'validation/missing-fields'
        };
      }
      
      // Vérification de l'existence de l'email (SANS TIMEOUT)
      log('🔍 Vérification email...', email);
      try {
        const signInMethods = await auth().fetchSignInMethodsForEmail(email);
        
        if (signInMethods && signInMethods.length > 0) {
          log('❌ Email déjà utilisé');
          return {
            success: false,
            error: 'Cet email est déjà utilisé. Connecte-toi plutôt !',
            code: 'auth/email-already-in-use'
          };
        }
        log('✅ Email disponible');
      } catch (emailCheckError) {
        log('⚠️ Impossible de vérifier email, on continue quand même...', emailCheckError.message);
        // Continue anyway - Firebase will catch duplicate email during signup
      }
      
      // Création du compte (SANS TIMEOUT)
      log('🔐 Création du compte Firebase...');
      const createAccountPromise = auth().createUserWithEmailAndPassword(email, password);
      
      const [userCredential] = await Promise.all([
        createAccountPromise,
        AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true')
      ]);
      
      log('✅ Compte créé:', userCredential.user.uid);
      const newUser = userCredential.user;
      
      // Migrer les données du guest (non-bloquant)
      const guestDataToMigrate = guestData || {};
      firestore()
        .collection('users')
        .doc(newUser.uid)
        .set({
          email: newUser.email,
          totalXP: 0,
          level: 1,
          completedPrograms: [],
          userProgress: {},
          activePrograms: [],      // ⭐ CORRECTION
          selectedPrograms: [],    // ⭐ CORRECTION
          streak: 0,
          lastWorkoutDate: null,
          totalChallengesSubmitted: 0,
          totalChallengesApproved: 0,
          lastSubmissionDate: null,
          createdAt: firestore.FieldValue.serverTimestamp(),
          ...guestDataToMigrate,
        })
        .catch((error) => {
          logError('⚠️ Migration sera complétée plus tard:', error.code);
        });
      
      // Nettoyer le guest mode
      await batchAsyncStorage.removeMultiple([
        '@fitnessrpg:guest_mode',
        '@fitnessrpg:guest_data'
      ]);
      
      setIsGuest(false);
      setGuestData(null);
      
      log('✅ Conversion réussie');
      
      return { success: true, user: newUser };
      
    } catch (error) {
      logError('❌ Erreur conversion:', error);
      
      const errorMap = {
        'auth/email-already-in-use': 'Cet email est déjà utilisé',
        'auth/invalid-email': 'Email invalide',
        'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
      };
      
      return { 
        success: false, 
        error: errorMap[error.code] || 'Erreur lors de la création du compte',
        code: error.code 
      };
    }
  };

  // RESET PROFIL (supprime toutes les données utilisateur)
  const resetUserData = async () => {
    try {
      log('🔄 Réinitialisation du profil...');
      
      // 1. Supprimer le document Firestore si utilisateur authentifié
      if (user && !isGuest) {
        try {
          log('🗑️ Suppression document Firestore...');
          await firestore()
            .collection('users')
            .doc(user.uid)
            .delete();
          log('✅ Document Firestore supprimé');
        } catch (error) {
          logError('⚠️ Erreur suppression Firestore:', error.code);
          // Continue quand même
        }
      }
      
      // 2. Nettoyer AsyncStorage
      await batchAsyncStorage.removeMultiple([
        '@fitnessrpg:onboarding_completed',
        '@fitnessrpg:guest_mode',
        '@fitnessrpg:guest_data',
        '@fitnessrpg:guest_programs',
        '@fitnessrpg:tree_tooltip_shown',
        '@fitnessrpg:open_program_selection'
      ]);
      
      // 3. Reset états
      setGuestData(null);
      setIsGuest(false);
      
      log('✅ Profil réinitialisé');
      
      return { success: true };
    } catch (error) {
      logError('❌ Erreur reset profil:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la réinitialisation' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isGuest,
      guestData,
      sendVerificationCode,
      verifyCode,
      signup, 
      login, 
      logout,
      resetPassword,
      setGuestMode,
      saveGuestData,
      convertGuestToUser,
      resetUserData,
    }}>
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