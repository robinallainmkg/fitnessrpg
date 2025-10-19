import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Context pour tracker le statut de connexion Firestore
 * Permet d'afficher des bannières/warnings à l'utilisateur
 */
const FirestoreStatusContext = createContext({
  isAvailable: true,
  isChecking: true,
  lastError: null,
  checkStatus: () => {},
});

export const useFirestoreStatus = () => useContext(FirestoreStatusContext);

export const FirestoreStatusProvider = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [lastError, setLastError] = useState(null);

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      
      // Get current user
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        // Can't test without user, assume unavailable
        setIsAvailable(false);
        setLastError('no-auth');
        return false;
      }
      
      // Quick test avec timeout - using user's own document (authorized by rules)
      const testPromise = firestore().collection('users').doc(currentUser.uid).get();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 2000)
      );
      
      await Promise.race([testPromise, timeoutPromise]);
      
      setIsAvailable(true);
      setLastError(null);
      return true;
      
    } catch (error) {
      setIsAvailable(false);
      setLastError(error.code || error.message);
      return false;
      
    } finally {
      setIsChecking(false);
    }
  };

  // Check au montage
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <FirestoreStatusContext.Provider
      value={{
        isAvailable,
        isChecking,
        lastError,
        checkStatus,
      }}
    >
      {children}
    </FirestoreStatusContext.Provider>
  );
};
