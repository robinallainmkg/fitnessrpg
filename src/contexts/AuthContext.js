import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authModule from '@react-native-firebase/auth';

// ✅ IMPORT UNIFIÉ - Un seul point d'entrée Firebase
import { getAuth, getFirestore, FieldValue } from '../config/firebase.simple';

const auth = getAuth();
const firestore = getFirestore();

// PhoneAuthProvider depuis le module Firebase Auth
const PhoneAuthProvider = authModule.PhoneAuthProvider;

export const AuthContext = createContext();

const IS_DEV = __DEV__;
const log = (...args) => IS_DEV && console.log(...args);
const logError = (...args) => console.error(...args);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isLinking, setIsLinking] = useState(false); // Flag pour empêcher auto-guest pendant linking

  // ═══════════════════════════════════════════════════════════
  // INITIALISATION: Écoute Firebase Auth
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    log('🔄 Initialisation Firebase Auth');

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        log('✅ Utilisateur connecté:', firebaseUser.phoneNumber || firebaseUser.uid);
        setUser(firebaseUser);
        
        // Détecter si c'est un invité (anonymous)
        const isAnonymous = firebaseUser.isAnonymous;
        setIsGuest(isAnonymous);
        log(`👤 Mode: ${isAnonymous ? 'INVITÉ (anonymous)' : 'AUTHENTIFIÉ (phone)'}`);
        
        // Vérifier que le document Firestore existe
        try {
          const doc = await firestore
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
          
          if (!doc.exists) {
            log('📝 Création du document utilisateur');
            await firestore
              .collection('users')
              .doc(firebaseUser.uid)
              .set({
                phoneNumber: firebaseUser.phoneNumber || null,
                isGuest: isAnonymous,
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
                createdAt: FieldValue.serverTimestamp(),
              });
          }
        } catch (error) {
          logError('⚠️ Erreur Firestore (non bloquant):', error);
        }
      } else {
        log('ℹ️ Aucun utilisateur connecté');
        setUser(null);
        setIsGuest(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ═══════════════════════════════════════════════════════════
  // GUEST MODE: Démarrer en mode anonymous
  // ═══════════════════════════════════════════════════════════
  const startGuestMode = async () => {
    try {
      log('👤 Démarrage mode invité (Firebase Anonymous Auth)');
      
      const userCredential = await auth.signInAnonymously();
      const anonymousUser = userCredential.user;
      
      log('✅ Anonymous Auth créé:', anonymousUser.uid);
      
      // Créer le document Firestore
      await firestore
        .collection('users')
        .doc(anonymousUser.uid)
        .set({
          isGuest: true,
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
          createdAt: FieldValue.serverTimestamp(),
        });
      
      // Marquer l'onboarding comme complété
      await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
      
      setUser(anonymousUser);
      setIsGuest(true);
      
      log('✅ Mode invité activé - uid permanent:', anonymousUser.uid);
      
      return { success: true, user: anonymousUser };
    } catch (error) {
      logError('❌ Erreur startGuestMode:', error);
      return {
        success: false,
        error: 'Impossible de démarrer le mode invité',
        code: error.code
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // PHONE AUTH: Envoi code SMS
  // ═══════════════════════════════════════════════════════════
  const sendVerificationCode = async (phoneNumber) => {
    try {
      log('📱 Envoi code SMS à:', phoneNumber);
      
      // Normaliser le numéro de téléphone français
      let normalizedPhone = phoneNumber.replace(/\s/g, ''); // Retirer espaces
      
      // Si commence par 0 (format français), remplacer par +33
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+33' + normalizedPhone.substring(1);
      }
      // Si commence par 6 ou 7 (sans 0), ajouter +33
      else if (/^[67]/.test(normalizedPhone)) {
        normalizedPhone = '+33' + normalizedPhone;
      }
      // Si ne commence pas par +, ajouter +33
      else if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = '+33' + normalizedPhone;
      }
      
      log('📱 Numéro normalisé:', normalizedPhone);
      
      if (normalizedPhone.length < 11) {
        return {
          success: false,
          error: 'Numéro de téléphone invalide',
          code: 'validation/invalid-phone'
        };
      }
      
      const confirmation = await auth.signInWithPhoneNumber(normalizedPhone);
      
      log('✅ Code SMS envoyé');
      
      return {
        success: true,
        confirmation: confirmation,
        phoneNumber: normalizedPhone
      };
    } catch (error) {
      logError('❌ Erreur envoi code:', error);
      
      let errorMessage = 'Erreur lors de l\'envoi du code';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Problème de connexion internet';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // PHONE AUTH: Vérifier code + LIER au compte anonymous
  // ═══════════════════════════════════════════════════════════
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
      
      const currentUser = auth.currentUser;
      
      // ─────────────────────────────────────────────────────────
      // CAS 1: Utilisateur anonymous → LINKING (préserve les données)
      // ─────────────────────────────────────────────────────────
      if (currentUser && currentUser.isAnonymous) {
        log('🔗 Linking phone credential to anonymous account...');
        
        try {
          // Créer le credential phone avec PhoneAuthProvider
          const credential = PhoneAuthProvider.credential(
            confirmation.verificationId,
            code
          );
          
          // LIER au compte anonymous existant
          const linkedUser = await currentUser.linkWithCredential(credential);
          
          log('✅ Phone linked! UID reste le même:', linkedUser.user.uid);
          
          // Mettre à jour le document Firestore (MERGE pour garder les données)
          await firestore
            .collection('users')
            .doc(linkedUser.user.uid)
            .set({
              phoneNumber: linkedUser.user.phoneNumber,
              isGuest: false, // Plus un invité maintenant
            }, { merge: true }); // ← CRITIQUE: merge préserve userProgress, activePrograms, etc.
          
          setIsGuest(false);
          
          log('✅ LINKING COMPLETE - Données préservées automatiquement');
          
          return { success: true, user: linkedUser.user };
          
        } catch (linkError) {
          console.log('🔍 linkError:', linkError);
          console.log('🔍 linkError.code:', linkError?.code);
          
          // Si le numéro est déjà utilisé → ABANDON du guest, connexion au compte existant
          if (linkError?.code === 'auth/credential-already-in-use') {
            log('⚠️ Numéro déjà utilisé - Abandon du compte guest et connexion au compte principal...');
            
            const guestUid = currentUser.uid;
            log('🗑️ UID guest à abandonner:', guestUid);
            
            try {
              // ACTIVER le flag de linking pour bloquer App.js
              setIsLinking(true);
              
              // Se déconnecter du compte anonymous
              await auth.signOut();
              log('👋 Déconnexion du compte guest');
              
              // Se connecter avec le numéro existant
              const userCredential = await confirmation.confirm(code);
              const existingUser = userCredential.user;
              
              log('✅ Connecté au compte principal existant:', existingUser.uid);
              log('⚠️ Données du guest abandonnées (compte sera nettoyé automatiquement)');
              
              setIsGuest(false);
              setIsLinking(false); // Désactiver le flag
              
              return { 
                success: true, 
                user: existingUser,
                message: '✅ Connecté au compte principal!'
              };
            } catch (signInError) {
              logError('❌ Erreur lors de la connexion au compte principal:', signInError);
              setIsLinking(false); // Désactiver le flag en cas d'erreur
              
              return {
                success: false,
                error: 'Impossible de se connecter au compte principal',
                code: signInError?.code
              };
            }
          } else {
            // Autre erreur de linking (pas credential-already-in-use)
            log('❌ Erreur linking non gérée:', linkError?.code || linkError);
            return {
              success: false,
              error: linkError?.message || 'Erreur lors de la liaison du compte',
              code: linkError?.code
            };
          }
        }
      }
      
      // ─────────────────────────────────────────────────────────
      // CAS 2: Pas d'utilisateur anonymous → Connexion classique
      // ─────────────────────────────────────────────────────────
      else {
        log('📱 Connexion phone classique (pas de linking)');
        log('🔍 Current user before confirm:', currentUser?.uid || 'null');
        
        const userCredential = await confirmation.confirm(code);
        const loggedUser = userCredential.user;
        
        log('✅ Code validé, utilisateur connecté:', loggedUser.uid);
        log('🔍 Phone number:', loggedUser.phoneNumber);
        
        // Créer le document si n'existe pas
        const userDoc = await firestore
          .collection('users')
          .doc(loggedUser.uid)
          .get();
        
        if (!userDoc.exists) {
          log('📝 Création nouveau document utilisateur');
          await firestore
            .collection('users')
            .doc(loggedUser.uid)
            .set({
              phoneNumber: loggedUser.phoneNumber,
              isGuest: false,
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
              createdAt: FieldValue.serverTimestamp(),
            });
        } else {
          log('✅ Document utilisateur existe déjà');
        }
        
        setIsGuest(false);
        
        log('✅ CONNEXION COMPLETE');
        
        return { success: true, user: loggedUser };
      }
      
    } catch (error) {
      logError('❌ Erreur vérification code:', error);
      
      let errorMessage = 'Code incorrect';
      if (error?.code === 'auth/invalid-verification-code') {
        errorMessage = 'Code invalide ou expiré';
      } else if (error?.code === 'auth/code-expired') {
        errorMessage = 'Code expiré. Demandez-en un nouveau.';
      } else if (error?.code === 'auth/credential-already-in-use') {
        errorMessage = 'Ce numéro est déjà utilisé par un autre compte';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error?.code
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // LOGOUT: Déconnexion + redémarrer en mode anonymous
  // ═══════════════════════════════════════════════════════════
  const logout = async () => {
    try {
      log('🚪 Déconnexion...');
      
      await auth.signOut();
      
      log('✅ Déconnecté - Redémarrage en mode invité');
      
      // Redémarrer automatiquement en mode anonymous
      await startGuestMode();
      
      return { success: true };
    } catch (error) {
      logError('❌ Erreur logout:', error);
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
        code: error.code
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RESET: Réinitialiser toutes les données utilisateur
  // ═══════════════════════════════════════════════════════════
  const resetUserData = async () => {
    try {
      if (!user?.uid) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }

      log('🔄 Réinitialisation données utilisateur:', user.uid);

      const userDocRef = firestore.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();
      
      if (!userDoc.exists) {
        return { success: false, error: 'Document utilisateur introuvable' };
      }

      const currentData = userDoc.data();
      const isAdmin = currentData.isAdmin === true;

      // Réinitialiser en préservant phoneNumber, isAdmin, isGuest
      await userDocRef.set({
        phoneNumber: user.phoneNumber || null,
        isGuest: user.isAnonymous,
        isAdmin: isAdmin,
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
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      log('✅ Données réinitialisées');

      return { success: true };
    } catch (error) {
      logError('❌ Erreur resetUserData:', error);
      return {
        success: false,
        error: 'Erreur lors de la réinitialisation',
        code: error.code
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════
  const value = {
    user,
    loading,
    isGuest,
    isLinking, // Exposer le flag pour App.js
    startGuestMode,
    sendVerificationCode,
    verifyCode,
    logout,
    resetUserData,
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
