# 📱 Guide de Build APK - Fitness RPG

## ✅ Procédure qui FONCTIONNE (Testée et Validée)

### 🎯 Build APK Release Standalone

Cette procédure génère un APK **standalone** qui fonctionne sans câble USB ni Metro Bundler.

#### Prérequis
- Node.js installé
- Android Studio ou Android SDK installé
- Projet configuré avec `expo prebuild`

#### Étapes

**1. Régénérer le dossier Android (si nécessaire)**
```powershell
npx expo prebuild --platform android --clean
```

**2. Copier google-services.json**
```powershell
Copy-Item ./google-services.json android/app/google-services.json -Force
```

**3. Builder l'APK Release**
```powershell
cd android
.\gradlew assembleRelease
cd ..
```

**4. Récupérer l'APK**
L'APK se trouve dans :
```
android/app/build/outputs/apk/release/app-release.apk
```

Taille : ~84 MB (optimisé et minifié)

---

### 📲 Installation sur Téléphone

#### Option A : Transfert USB (Rapide)
```powershell
# Vérifier connexion
.\platform-tools\adb.exe devices

# Transférer l'APK
.\platform-tools\adb.exe -s DEVICE_ID push ".\android\app\build\outputs\apk\release\app-release.apk" /sdcard/FitnessRPG.apk
```

Puis sur le téléphone :
1. Ouvrir "Mes fichiers"
2. Aller dans "Stockage interne"
3. Trouver "FitnessRPG.apk"
4. Installer

#### Option B : Email/Cloud
1. Envoyer l'APK par email ou cloud
2. Télécharger sur le téléphone
3. Installer depuis le fichier téléchargé

---

## 🔧 Configuration Importante

### app.json
```json
{
  "expo": {
    "android": {
      "package": "com.fitnessrpg.app",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "expo-font",
      ["expo-build-properties", {
        "android": {
          "compileSdkVersion": 36,
          "targetSdkVersion": 36,
          "buildToolsVersion": "36.0.0"
        }
      }]
    ]
  }
}
```

**Important** : Ne PAS inclure les plugins `@react-native-firebase/*` dans la liste des plugins.

---

## 🚫 Ce qui NE FONCTIONNE PAS

### ❌ APK Debug
```powershell
# NE PAS UTILISER pour distribution
npx expo run:android  # Génère un APK debug qui nécessite Metro
```

L'APK debug (`app-debug.apk`) a besoin de Metro Bundler et affiche l'erreur "Unable to load script".

### ❌ EAS Build Cloud (avec React Native Firebase)
```powershell
# NE FONCTIONNE PAS car android/ n'est pas dans Git
eas build --platform android --profile preview
```

Erreur : `ENOENT: no such file or directory, open '/home/expo/workingdir/build/android/gradlew'`

---

## 📊 Comparaison APK Debug vs Release

| Type | Taille | Metro requis ? | Performance | Usage |
|------|--------|----------------|-------------|-------|
| **Debug** | 94 MB | ✅ OUI (USB) | Lente | Développement avec hotreload |
| **Release** | 84 MB | ❌ NON | Rapide | **Tests & Production** |

---

## 🔐 Pour Publication sur Google Play Store

Voir `BUILD_PRODUCTION.md` pour la procédure de signature et génération AAB.

---

## ✅ Statut du Projet

- [x] Build APK Release Standalone fonctionnel
- [x] Installation et tests sur appareil physique
- [x] Firebase Auth + Firestore fonctionnels
- [ ] Signature APK pour production
- [ ] Publication Google Play Store

---

**Dernière mise à jour** : 7 octobre 2025
**Testé sur** : Samsung Galaxy A024 (Android)
**Build réussi** : ✅ OUI (38 secondes)
