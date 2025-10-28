/**
 * Script de test pour AdminReviewScreen
 * 
 * Utilise pour tester la validation des challenges
 * sans avoir besoin de créer plusieurs comptes utilisateurs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Créer des soumissions de test dans AsyncStorage
 * Utile pour tester AdminReviewScreen sans backend
 */
export const createMockSubmissions = async () => {
  console.log('🎭 Creating mock submissions for testing...');

  const mockSubmissions = [
    {
      id: 'test_sub_1',
      userId: 'user_123',
      challengeType: '10_pullups',
      videoURL: 'https://example.com/video1.mp4',
      videoFileName: 'video1.mp4',
      status: 'pending',
      submittedAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
      xpRewarded: 0,
    },
    {
      id: 'test_sub_2',
      userId: 'user_456',
      challengeType: '30s_planche',
      videoURL: 'https://example.com/video2.mp4',
      videoFileName: 'video2.mp4',
      status: 'pending',
      submittedAt: new Date(Date.now() - 7200000).toISOString(), // 2h ago
      xpRewarded: 0,
    },
    {
      id: 'test_sub_3',
      userId: 'user_789',
      challengeType: '1min_planche',
      videoURL: 'https://example.com/video3.mp4',
      videoFileName: 'video3.mp4',
      status: 'pending',
      submittedAt: new Date(Date.now() - 10800000).toISOString(), // 3h ago
      xpRewarded: 0,
    },
  ];

  await AsyncStorage.setItem(
    '@mock:submissions',
    JSON.stringify(mockSubmissions)
  );

  console.log('✅ Created 3 mock submissions');
  console.log('📋 Submissions:', mockSubmissions.map(s => s.challengeType).join(', '));
};

/**
 * Nettoyer les données de test
 */
export const cleanMockSubmissions = async () => {
  console.log('🧹 Cleaning mock submissions...');
  await AsyncStorage.removeItem('@mock:submissions');
  console.log('✅ Mock submissions cleaned');
};

/**
 * Afficher les soumissions actuelles
 */
export const listMockSubmissions = async () => {
  const data = await AsyncStorage.getItem('@mock:submissions');
  
  if (!data) {
    console.log('📭 No mock submissions found');
    return [];
  }

  const submissions = JSON.parse(data);
  console.log('📋 Current mock submissions:', submissions.length);
  submissions.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.challengeType} - ${s.status} (${s.id})`);
  });

  return submissions;
};

/**
 * Commandes de test rapides
 */
export const testCommands = {
  create: createMockSubmissions,
  clean: cleanMockSubmissions,
  list: listMockSubmissions,
};

// Usage dans la console Metro:
// import { testCommands } from './src/utils/testAdminReview';
// testCommands.create();
// testCommands.list();
// testCommands.clean();
