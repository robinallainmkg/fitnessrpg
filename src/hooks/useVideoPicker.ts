import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const IS_DEV = __DEV__;
const log = (...args: any[]) => IS_DEV && console.log('[useVideoPicker]', ...args);
const logError = (...args: any[]) => console.error('[useVideoPicker]', ...args);

const MAX_VIDEO_DURATION = 60; // 1 minute max

export const useVideoPicker = () => {
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  /**
   * Request camera permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      log('Requesting camera permissions...');
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        logError('Camera permission denied');
        return false;
      }

      log('✅ Camera permissions granted');
      return true;
    } catch (error) {
      logError('Failed to request permissions:', error);
      return false;
    }
  };

  /**
   * Launch native camera to record video
   */
  const recordVideo = async (): Promise<string | null> => {
    try {
      log('📹 Launching native camera...');
      setIsRecording(true);
      setRecordedVideoUri(null);

      // Check permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsRecording(false);
        return null;
      }

      // Launch camera with video mode
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8, // Good quality but not too heavy
        videoMaxDuration: MAX_VIDEO_DURATION,
      });

      setIsRecording(false);

      if (result.canceled) {
        log('❌ User cancelled video recording');
        return null;
      }

      if (result.assets && result.assets.length > 0) {
        const videoUri = result.assets[0].uri;
        log('✅ Video recorded:', videoUri);
        setRecordedVideoUri(videoUri);
        return videoUri;
      }

      return null;
    } catch (error) {
      logError('Failed to record video:', error);
      setIsRecording(false);
      throw error;
    }
  };

  /**
   * Pick existing video from gallery
   */
  const pickVideo = async (): Promise<string | null> => {
    try {
      log('📱 Launching video picker...');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        log('❌ User cancelled video picker');
        return null;
      }

      if (result.assets && result.assets.length > 0) {
        const videoUri = result.assets[0].uri;
        log('✅ Video picked:', videoUri);
        setRecordedVideoUri(videoUri);
        return videoUri;
      }

      return null;
    } catch (error) {
      logError('Failed to pick video:', error);
      throw error;
    }
  };

  /**
   * Reset recorded video
   */
  const resetVideo = () => {
    setRecordedVideoUri(null);
  };

  return {
    // State
    recordedVideoUri,
    isRecording,

    // Actions
    recordVideo,
    pickVideo,
    resetVideo,
    requestPermissions,
  };
};
