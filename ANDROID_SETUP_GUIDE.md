# Guide Installation Émulateur Android

## Option 1: Android Studio (Complet)

1. **Télécharger Android Studio** : https://developer.android.com/studio
2. **Installer Android Studio** avec les composants par défaut
3. **Configurer un AVD (Android Virtual Device)** :
   - Ouvrir Android Studio
   - Tools → AVD Manager
   - Create Virtual Device
   - Choisir un appareil (ex: Pixel 4)
   - Sélectionner une API Level (ex: API 30)
   - Finish

4. **Variables d'environnement** :
   ```powershell
   # Ajouter au PATH
   $env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools"
   ```

5. **Lancer l'émulateur** :
   ```powershell
   emulator -avd nom_de_votre_avd
   ```

## Option 2: Scrcpy (Pour appareil physique)

Si vous avez un téléphone Android :

1. **Activer le débogage USB** sur votre téléphone :
   - Paramètres → À propos du téléphone
   - Appuyer 7 fois sur "Numéro de build"
   - Retour → Options de développement
   - Activer "Débogage USB"

2. **Connecter via USB** et autoriser l'ordinateur

3. **Installer ADB** (si pas déjà fait) :
   ```powershell
   winget install Google.PlatformTools
   ```

4. **Vérifier la connexion** :
   ```powershell
   adb devices
   ```

## Option 3: Web (Plus Simple)

L'application React Native fonctionne aussi sur navigateur web :

```powershell
npx expo start --web
```

Puis ouvrir http://localhost:19006

## Recommandation

Pour développement et test rapide : **Expo Go sur téléphone** ou **Web**
Pour tests approfondis : **Émulateur Android Studio**
