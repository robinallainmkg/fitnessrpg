import { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

const IS_DEV = __DEV__;
const log = (...args: any[]) => IS_DEV && console.log('[useCamera]', ...args);
const logError = (...args: any[]) => console.error('[useCamera]', ...args);

const MAX_RECORDING_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const useCamera = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState(null as string | null);
  const [facing, setFacing] = useState('front' as CameraType);
  
  const cameraRef = useRef(null as any);
  const recordingTimeoutRef = useRef(null as any);

  /**
   * Request all necessary permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      log('Requesting permissions...');

      // Request camera permission
      if (!cameraPermission?.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          logError('Camera permission denied');
          return false;
        }
      }

      // Request media library permission
      if (!mediaLibraryPermission?.granted) {
        const result = await requestMediaLibraryPermission();
        if (!result.granted) {
          logError('Media library permission denied');
          return false;
        }
      }

      log('✅ All permissions granted');
      return true;
    } catch (error) {
      logError('Failed to request permissions:', error);
      return false;
    }
  };

  /**
   * Start recording video
   */
  const startRecording = async (): Promise<void> => {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera ref not ready');
      }

      if (isRecording) {
        log('Already recording');
        return;
      }

      log('Starting recording...');
      setIsRecording(true);
      setRecordedVideoUri(null);

      // Start recording
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_RECORDING_DURATION_MS / 1000, // Convert to seconds
      });

      // Save to media library
      if (video && video.uri) {
        log('Recording complete, saving to library...');
        
        const asset = await MediaLibrary.createAssetAsync(video.uri);
        setRecordedVideoUri(asset.uri);
        
        log('✅ Video saved:', asset.uri);
      }

      setIsRecording(false);
    } catch (error: any) {
      logError('Failed to start recording:', error);
      setIsRecording(false);
      throw error;
    }
  };

  /**
   * Stop recording video
   */
  const stopRecording = async (): Promise<void> => {
    try {
      if (!cameraRef.current || !isRecording) {
        log('Not recording');
        return;
      }

      log('Stopping recording...');
      
      await cameraRef.current.stopRecording();
      setIsRecording(false);

      // Clear timeout if exists
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      log('✅ Recording stopped');
    } catch (error) {
      logError('Failed to stop recording:', error);
      setIsRecording(false);
      throw error;
    }
  };

  /**
   * Toggle camera facing (front/back)
   */
  const toggleCameraFacing = () => {
    setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
  };

  /**
   * Reset recorded video
   */
  const resetVideo = () => {
    setRecordedVideoUri(null);
  };

  /**
   * Check if permissions are granted
   */
  const hasPermissions = (): boolean => {
    return !!(cameraPermission?.granted && mediaLibraryPermission?.granted);
  };

  return {
    // Permissions
    cameraPermission,
    mediaLibraryPermission,
    hasPermissions: hasPermissions(),
    requestPermissions,

    // Camera ref
    cameraRef,

    // Recording state
    isRecording,
    recordedVideoUri,
    facing,

    // Actions
    startRecording,
    stopRecording,
    toggleCameraFacing,
    resetVideo,
  };
};
