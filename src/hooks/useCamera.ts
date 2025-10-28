import { useState, useRef } from 'react';
import { CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { PermissionsAndroid, Platform } from 'react-native';

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
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const cameraRef = useRef(null as any);
  const recordingTimeoutRef = useRef(null as any);
  const recordingStartTimeRef = useRef(null as number | null);

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

      // Request RECORD_AUDIO permission on Android (required même si mute: true)
      if (Platform.OS === 'android') {
        const audioPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permission Microphone',
            message: 'L\'app a besoin d\'accéder au microphone pour enregistrer des vidéos',
            buttonPositive: 'OK',
          }
        );
        
        if (audioPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          logError('Audio permission denied');
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

      if (!isCameraReady) {
        throw new Error('Camera not ready yet, please wait a moment');
      }

      if (isRecording) {
        log('Already recording');
        return;
      }

      log('Starting recording...');
      setIsRecording(true);
      setRecordedVideoUri(null);
      recordingStartTimeRef.current = Date.now();

      // Start recording (video only, no audio)
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_RECORDING_DURATION_MS / 1000, // Convert to seconds
        mute: true, // 🔇 Pas d'audio
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

      // Vérifier durée minimale (500ms minimum)
      const MIN_RECORDING_DURATION_MS = 500;
      const recordingDuration = recordingStartTimeRef.current 
        ? Date.now() - recordingStartTimeRef.current 
        : 0;
      
      if (recordingDuration < MIN_RECORDING_DURATION_MS) {
        const waitTime = MIN_RECORDING_DURATION_MS - recordingDuration;
        log(`⏳ Waiting ${waitTime}ms before stopping (min duration required)...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      log('Stopping recording...');
      
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      recordingStartTimeRef.current = null;

      // Clear timeout if exists
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      log('✅ Recording stopped');
    } catch (error) {
      logError('Failed to stop recording:', error);
      setIsRecording(false);
      recordingStartTimeRef.current = null;
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

  /**
   * Callback when camera is ready
   */
  const onCameraReady = () => {
    log('📸 Camera is ready!');
    setIsCameraReady(true);
  };

  return {
    // Permissions
    cameraPermission,
    mediaLibraryPermission,
    hasPermissions: hasPermissions(),
    requestPermissions,

    // Camera ref
    cameraRef,
    onCameraReady,

    // Recording state
    isRecording,
    recordedVideoUri,
    facing,
    isCameraReady,

    // Actions
    startRecording,
    stopRecording,
    toggleCameraFacing,
    resetVideo,
  };
};
