import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

const ChallengeContext = createContext({});

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenge must be used within ChallengeProvider');
  }
  return context;
};

export const ChallengeProvider = ({ children }) => {
  const { user } = useAuth();
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  /**
   * Charge le défi du jour pour un utilisateur
   * Structure Firestore: dailyChallenges/{date}/users/{userId}
   */
  const loadTodayChallenge = async (userId) => {
    if (!userId) {
      console.log('⏭️ Skip loadTodayChallenge - no userId');
      return;
    }

    try {
      setLoadingChallenge(true);
      
      // Format date YYYY-MM-DD
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      console.log('📅 Loading daily challenge for:', dateStr, 'user:', userId);

      // Charger le défi du jour de l'utilisateur
      const userChallengeRef = firestore()
        .collection('dailyChallenges')
        .doc(dateStr)
        .collection('users')
        .doc(userId);

      const userChallengeDoc = await userChallengeRef.get();

      if (userChallengeDoc.exists) {
        const data = userChallengeDoc.data();
        console.log('✅ Daily challenge found:', data);
        setTodayChallenge({
          ...data,
          id: dateStr,
          submitted: data.submitted || false
        });
      } else {
        // Pas de défi pour aujourd'hui - en créer un
        console.log('🆕 No challenge for today - creating one');
        const newChallenge = await createDailyChallenge(dateStr, userId);
        setTodayChallenge(newChallenge);
      }
    } catch (error) {
      console.error('❌ [ChallengeContext] Failed to load today challenge:', error);
      setTodayChallenge(null);
    } finally {
      setLoadingChallenge(false);
    }
  };

  /**
   * Crée un nouveau défi journalier pour l'utilisateur
   */
  const createDailyChallenge = async (dateStr, userId) => {
    try {
      console.log('🎲 Creating daily challenge for:', dateStr);

      // Pool de défis possibles
      const challengePool = [
        {
          type: 'reps',
          exercise: 'Pompes',
          target: 50,
          description: 'Faire 50 pompes',
          xpReward: 100,
          icon: '💪'
        },
        {
          type: 'reps',
          exercise: 'Squats',
          target: 100,
          description: 'Faire 100 squats',
          xpReward: 100,
          icon: '🦵'
        },
        {
          type: 'time',
          exercise: 'Planche',
          target: 120, // secondes
          description: 'Tenir la planche 2 minutes',
          xpReward: 150,
          icon: '⏱️'
        },
        {
          type: 'reps',
          exercise: 'Burpees',
          target: 30,
          description: 'Faire 30 burpees',
          xpReward: 120,
          icon: '🔥'
        },
        {
          type: 'reps',
          exercise: 'Jumping Jacks',
          target: 100,
          description: 'Faire 100 jumping jacks',
          xpReward: 80,
          icon: '⚡'
        }
      ];

      // Sélectionner aléatoirement un défi
      const randomIndex = Math.floor(Math.random() * challengePool.length);
      const selectedChallenge = challengePool[randomIndex];

      const challengeData = {
        ...selectedChallenge,
        date: dateStr,
        submitted: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      // Sauvegarder dans Firestore
      const userChallengeRef = firestore()
        .collection('dailyChallenges')
        .doc(dateStr)
        .collection('users')
        .doc(userId);

      await userChallengeRef.set(challengeData);

      console.log('✅ Daily challenge created:', selectedChallenge.description);

      return {
        ...challengeData,
        id: dateStr
      };
    } catch (error) {
      console.error('❌ [ChallengeService] Failed to create daily challenge:', error);
      throw error;
    }
  };

  /**
   * Soumettre un défi complété
   */
  const submitChallenge = async (challengeId, actualValue) => {
    if (!user?.uid) {
      console.log('⏭️ No user - cannot submit challenge');
      return false;
    }

    try {
      console.log('📤 Submitting challenge:', challengeId, 'value:', actualValue);

      const userChallengeRef = firestore()
        .collection('dailyChallenges')
        .doc(challengeId)
        .collection('users')
        .doc(user.uid);

      await userChallengeRef.update({
        submitted: true,
        actualValue: actualValue,
        submittedAt: firestore.FieldValue.serverTimestamp()
      });

      // Mettre à jour l'état local
      setTodayChallenge(prev => ({
        ...prev,
        submitted: true,
        actualValue
      }));

      console.log('✅ Challenge submitted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to submit challenge:', error);
      return false;
    }
  };

  // Charger le défi du jour quand l'utilisateur change
  useEffect(() => {
    if (user?.uid) {
      loadTodayChallenge(user.uid);
    }
  }, [user?.uid]);

  const value = {
    todayChallenge,
    loadingChallenge,
    loadTodayChallenge,
    submitChallenge
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};
