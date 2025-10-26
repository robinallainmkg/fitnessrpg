/**
 * MockStorageService - Simulation upload vidéo sans Firebase Storage
 * 
 * Simule l'upload avec progression et délai pour tester l'UI localement
 */

/**
 * Simuler upload vidéo avec progression
 * 
 * @param uri - URI local du fichier vidéo
 * @param userId - ID utilisateur
 * @param challengeType - Type de défi
 * @param onProgress - Callback progression (0-100)
 * @returns URL simulée (URI local)
 */
export const uploadChallengeVideo = async (
  uri: string,
  userId: string,
  challengeType: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  console.log('🎭 [MOCK] Starting video upload simulation');
  console.log('  URI:', uri);
  console.log('  User:', userId);
  console.log('  Challenge:', challengeType);

  // Simuler upload progressif
  const totalSteps = 10;
  for (let i = 0; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms par step = 2s total
    
    const progress = (i / totalSteps) * 100;
    if (onProgress) {
      onProgress(progress);
    }
    
    console.log(`  📊 Upload progress: ${Math.round(progress)}%`);
  }

  // Retourner l'URI local comme "uploaded URL" (pour preview)
  const mockURL = uri; // En mode mock, on garde l'URI local
  
  console.log('✅ [MOCK] Upload complete (simulated), URL:', mockURL);
  return mockURL;
};

/**
 * Simuler suppression vidéo
 */
export const deleteSubmissionVideo = async (videoURL: string): Promise<void> => {
  console.log('🎭 [MOCK] Deleting video (simulated):', videoURL);
  
  // Simuler délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('✅ [MOCK] Video deleted (simulated)');
  // En mode mock, on ne supprime rien vraiment (le fichier local reste)
};
