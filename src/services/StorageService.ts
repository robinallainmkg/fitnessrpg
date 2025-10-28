import storage from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';

const IS_DEV = __DEV__;
const log = (...args: any[]) => IS_DEV && console.log('[StorageService]', ...args);
const logError = (...args: any[]) => console.error('[StorageService]', ...args);

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export class StorageService {
  /**
   * Upload une vidéo de challenge vers Firebase Storage
   * @returns {url, fileName} - URL de téléchargement et nom du fichier
   */
  async uploadChallengeVideo(
    videoUri: string,
    userId: string,
    challengeType: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; fileName: string }> {
    try {
      log('Starting video upload:', { userId, challengeType });

      // 1. Vérifier la taille du fichier
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error('Le fichier vidéo n\'existe pas');
      }

      if (fileInfo.size && fileInfo.size > MAX_VIDEO_SIZE_BYTES) {
        throw new Error(
          `La vidéo est trop volumineuse (${Math.round(fileInfo.size / 1024 / 1024)}MB). Maximum: ${MAX_VIDEO_SIZE_MB}MB`
        );
      }

      // 2. Créer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}_${challengeType}.mp4`;
      const storagePath = `submissions/${fileName}`;

      log('Upload path:', storagePath);

      // 3. Créer la référence Storage
      const reference = storage().ref(storagePath);

      // 4. Upload le fichier
      const task = reference.putFile(videoUri);

      // 5. Écouter la progression
      if (onProgress) {
        task.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
          log(`Upload progress: ${Math.round(progress)}%`);
        });
      }

      // 6. Attendre la fin de l'upload
      await task;

      // 7. Récupérer l'URL de téléchargement
      const url = await reference.getDownloadURL();

      log('✅ Video uploaded successfully:', url);

      return { url, fileName };
    } catch (error: any) {
      logError('Failed to upload video:', error);

      // Messages d'erreur personnalisés
      if (error.code === 'storage/unauthorized') {
        throw new Error('Vous n\'êtes pas autorisé à uploader des vidéos');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload annulé');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Erreur réseau. Vérifiez votre connexion.');
      }

      throw error;
    }
  }

  /**
   * Supprimer une vidéo de submission
   */
  async deleteSubmissionVideo(fileName: string): Promise<void> {
    try {
      log('Deleting video:', fileName);

      const storagePath = `submissions/${fileName}`;
      const reference = storage().ref(storagePath);

      await reference.delete();

      log('✅ Video deleted successfully');
    } catch (error: any) {
      logError('Failed to delete video:', error);

      // Si le fichier n'existe pas, on ignore l'erreur
      if (error.code === 'storage/object-not-found') {
        log('Video already deleted or does not exist');
        return;
      }

      throw error;
    }
  }

  /**
   * Obtenir l'URL de téléchargement d'une vidéo
   */
  async getVideoDownloadURL(fileName: string): Promise<string> {
    try {
      const storagePath = `submissions/${fileName}`;
      const reference = storage().ref(storagePath);
      return await reference.getDownloadURL();
    } catch (error) {
      logError('Failed to get download URL:', error);
      throw error;
    }
  }

  /**
   * Vérifier si une vidéo existe
   */
  async videoExists(fileName: string): Promise<boolean> {
    try {
      const storagePath = `submissions/${fileName}`;
      const reference = storage().ref(storagePath);
      await reference.getMetadata();
      return true;
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        return false;
      }
      throw error;
    }
  }
}

export const storageService = new StorageService();
