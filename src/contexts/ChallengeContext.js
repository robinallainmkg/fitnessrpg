import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, FieldValue } from '../config/firebase.simple';
import storage from '@react-native-firebase/storage';
import { useAuth } from './AuthContext';

const firestore = getFirestore();

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Clear error and success messages
   */
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

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
      const userChallengeRef = firestore
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
        createdAt: FieldValue.serverTimestamp()
      };

      // Sauvegarder dans Firestore
      const userChallengeRef = firestore
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
   * Soumettre un défi complété avec vidéo
   */
  const submitChallenge = async (videoUri, userId, challengeType) => {
    if (!userId) {
      console.log('⏭️ No user - cannot submit challenge');
      setError('Utilisateur non connecté');
      return false;
    }

    if (!videoUri) {
      console.log('⏭️ No video URI - cannot submit challenge');
      setError('Aucune vidéo sélectionnée');
      return false;
    }

    try {
      console.log('📤 Submitting challenge with video:', videoUri);
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      setSuccess(null);

      // Format date YYYY-MM-DD
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Create unique filename
      const filename = `challenge_${userId}_${dateStr}_${Date.now()}.mp4`;
      const storageRef = storage().ref(`challenges/${dateStr}/${filename}`);

      console.log('📹 Uploading video to:', storageRef.fullPath);

      // Upload the video with progress tracking
      const uploadTask = storageRef.putFile(videoUri);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log(`📊 Upload progress: ${progress.toFixed(0)}%`);
        },
        (error) => {
          console.error('❌ Upload error:', error);
          setIsUploading(false);
          setError(`Erreur d'upload: ${error.message}`);
        }
      );

      // Wait for upload to complete
      await uploadTask;

      // Get download URL
      const downloadUrl = await storageRef.getDownloadURL();
      console.log('✅ Video uploaded, URL:', downloadUrl);

      // Update Firestore with video URL and submission
      const userChallengeRef = firestore
        .collection('dailyChallenges')
        .doc(dateStr)
        .collection('users')
        .doc(userId);

      await userChallengeRef.update({
        submitted: true,
        videoUrl: downloadUrl,
        videoPath: storageRef.fullPath,
        submittedAt: FieldValue.serverTimestamp(),
        status: 'pending' // En attente de validation admin
      });

      // Mettre à jour l'état local
      setTodayChallenge(prev => ({
        ...prev,
        submitted: true,
        videoUrl: downloadUrl,
        status: 'pending'
      }));

      setIsUploading(false);
      setSuccess('✅ Challenge soumis avec succès ! En attente de validation.');
      console.log('✅ Challenge submitted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to submit challenge:', error);
      setIsUploading(false);
      setError(`Erreur: ${error.message}`);
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
    isUploading,
    uploadProgress,
    error,
    success,
    loadTodayChallenge,
    submitChallenge,
    clearMessages
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};
