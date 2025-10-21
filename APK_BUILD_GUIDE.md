# 📱 Guide de Construction et Installation de l'APK

## ✅ Build en cours via EAS Build

Votre APK est en construction sur le cloud EAS Build. Le temps de compilation varie entre 10-20 minutes.

### 🔍 Suivre le build

```bash
# Vérifier le statut du build
eas build:list

# Attendre et télécharger automatiquement
eas build --platform android --profile preview
```

### 📥 Télécharger l'APK

Une fois le build terminé, vous recevrez:
- ✅ Un lien de téléchargement direct
- ✅ Un QR code pour télécharger rapidement
- ✅ L'APK sera stocké dans votre projet EAS

**Commande pour télécharger:**
```bash
eas build:download --platform android
```

---

## 📦 Installation sur Android

### Option 1: Depuis Android Studio (Émulateur)
```bash
# Build local avec Android CLI
cd android
gradlew installDebug
```

### Option 2: Depuis adb (Appareil USB connecté)
```bash
adb install /chemin/vers/apk/fitness-rpg.apk
```

### Option 3: Transfert manuel (Fichier)
1. Transférez le fichier APK sur votre téléphone
2. Ouvrez le fichier avec l'explorateur de fichiers
3. Appuyez sur "Installer"
4. Autorisez l'installation depuis sources inconnues (Paramètres > Sécurité)

---

## 🔧 Configuration d'Installation

**Package ID:** `com.fitnessrpg.app`
**Version:** 1.0.0
**Version Code:** 12
**Min SDK:** Android 7.0 (API 24)
**Target SDK:** Android 15 (API 36)

---

## 📊 Profils de Build Disponibles

### `preview` (Recommandé pour test)
- ✅ Build optimisé pour test
- ✅ APK fichier unique
- ✅ Taille: ~80-120 MB
- 📋 Type: `assembleRelease`

### `production`
- ✅ Build optimisé pour Play Store
- ✅ App Bundle (.aab)
- ✅ Peut être soumis au Play Store
- 📋 Type: `bundleRelease`

### `development`
- ✅ Build pour développement avec client Expo
- ✅ Rechargement en direct
- ✅ Débogage facile
- 📋 Type: `assembleDebug`

---

## 🚀 Prochaines Étapes

1. ✅ **Attendre la fin du build** (10-20 min)
2. ✅ **Télécharger l'APK**
3. ✅ **Installer sur votre appareil**
4. ✅ **Tester l'application**
5. ✅ **Reporter les bugs** (si nécessaire)

---

## 📝 Notes

- Les credentials Firebase sont inclus via `google-services.json`
- L'app utilise le backend Firebase en production
- Les données sont synchronisées avec Firestore
- Authentification par email/password active

---

## ❓ Troubleshooting

### "Build failed" Error
```bash
# Nettoyer le cache et réessayer
eas build --platform android --profile preview --non-interactive --clear-cache
```

### APK trop volumineux
- Proguard est activé (compression du code)
- Shrink resources est activé
- Les dépendances inutilisées sont supprimées

### Installation refused (quarantine)
- Allez à Paramètres > Sécurité > Sources inconnues
- Activer "Autoriser l'installation depuis sources inconnues"

---

## 📞 Support EAS

Consultez la documentation officielle:
- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/build/android-builds/

