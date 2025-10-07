import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Linking, StatusBar } from 'react-native';
import { X } from 'lucide-react-native';

// Conditionally import WebView only for native platforms
let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('WebView not available:', e);
  }
}

const CompanionCreator = ({ visible, onComplete, onClose }) => {
  const SUBDOMAIN = 'hybridrpg';
  // Configuration simplifiée : pas de sign-in, juste la création d'avatar
  // Mode "quickStart" pour éviter le login
  const avatarCreatorUrl = `https://${SUBDOMAIN}.readyplayer.me/avatar?frameApi&quickStart=true&bodyType=fullbody`;

  const handleMessage = (event) => {
    try {
      const json = JSON.parse(event.nativeEvent.data);

      if (json?.eventName === 'v1.avatar.exported') {
        const avatarUrl = json.data.url;
        console.log('Avatar créé:', avatarUrl);
        onComplete(avatarUrl);
      }

      if (json?.eventName === 'v1.frame.ready') {
        console.log('Ready Player Me frame ready');
      }
    } catch (error) {
      console.error('Error parsing RPM message:', error);
    }
  };

  const handleWebOpen = () => {
    Linking.openURL(avatarCreatorUrl);
  };

  const handleWebComplete = () => {
    // Pour le web, on utilise un avatar par défaut
    const defaultAvatarUrl = 'https://models.readyplayer.me/64bfa1f8f4f1b5f7e1234567.glb';
    onComplete(defaultAvatarUrl);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Crée ton Companion</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {Platform.OS === 'web' ? (
          <View style={styles.webPlaceholder}>
            <Text style={styles.webTitle}>Création d'avatar</Text>
            <Text style={styles.webDescription}>
              La création d'avatar 3D est disponible sur mobile.
            </Text>
            <Text style={styles.webDescription}>
              Sur le web, vous pouvez créer un companion avec un avatar par défaut.
            </Text>
            <TouchableOpacity
              style={styles.webButton}
              onPress={handleWebComplete}
            >
              <Text style={styles.webButtonText}>Utiliser un avatar par défaut</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.webButton, styles.webButtonSecondary]}
              onPress={handleWebOpen}
            >
              <Text style={styles.webButtonTextSecondary}>
                Ouvrir Ready Player Me dans un nouvel onglet
              </Text>
            </TouchableOpacity>
          </View>
        ) : WebView ? (
          <WebView
            source={{ uri: avatarCreatorUrl }}
            onMessage={handleMessage}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        ) : (
          <View style={styles.webPlaceholder}>
            <Text style={styles.webTitle}>WebView non disponible</Text>
            <Text style={styles.webDescription}>
              L'éditeur d'avatar n'est pas disponible sur cette plateforme.
            </Text>
            <TouchableOpacity
              style={styles.webButton}
              onPress={handleWebComplete}
            >
              <Text style={styles.webButtonText}>Utiliser un avatar par défaut</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  webDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  webButton: {
    backgroundColor: '#4D9EFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    minWidth: 250,
  },
  webButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  webButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4D9EFF',
  },
  webButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4D9EFF',
    textAlign: 'center',
  },
});

export default CompanionCreator;
