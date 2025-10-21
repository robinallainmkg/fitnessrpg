# 🛠️ ALTERNATIVE: Compilation APK Locale

Si les builds EAS ont des problèmes de config, voici comment compiler un APK **localement** :

## Prérequis

```bash
# 1. Java Development Kit (JDK 17+)
java -version

# 2. Android SDK (via Android Studio)
# C:\Users\robin\AppData\Local\Android\Sdk

# 3. Gradle (inclus dans Android SDK)
```

## Méthode 1: Avec Expo

```bash
# Exporter le bundle Expo
expo export --bundle --platform android

# Cela génère un dossier dist/ avec tous les assets
```

## Méthode 2: Avec eas-cli (Localement)

```bash
# Compiler localement sans cloud
eas build --platform android --local

# Cela va utiliser votre Android SDK local
# Temps estimé: 20-45 minutes
```

## Méthode 3: Avec Android CLI directement

```bash
# Accéder au dossier Android
cd android

# Compiler l'APK
./gradlew assembleRelease

# Le fichier APK sera dans:
# android/app/build/outputs/apk/release/app-release.apk
```

## Commandes Rapides

```bash
# Build de débogage rapide
expo prebuild --clean

cd android
./gradlew assembleDebug

# APK de débogage: android/app/build/outputs/apk/debug/app-debug.apk
```

## Variables d'Environnement Requises

```bash
# Pour Android SDK
$env:ANDROID_HOME = "C:\Users\robin\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\robin\AppData\Local\Android\Sdk"

# Pour Gradle
$env:GRADLE_HOME = "$env:ANDROID_HOME\gradle"
```

## Dépannage

### "ANDROID_SDK_ROOT not found"
```bash
# Définir la variable
$env:ANDROID_SDK_ROOT = "C:\Users\robin\AppData\Local\Android\Sdk"

# Vérifier
echo $env:ANDROID_SDK_ROOT
```

### "Gradle build failed"
```bash
# Nettoyer et refaire
cd android
./gradlew clean
./gradlew assembleRelease
```

### Fichier .apk non trouvé
```bash
# Après build réussi, check dans:
ls android/app/build/outputs/apk/release/
```

## Taille Attendue

- **APK Debug:** ~90-120 MB
- **APK Release:** ~80-100 MB (avec ProGuard)

