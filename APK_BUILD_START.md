# 📱 COMMENT CRÉER L'APK - GUIDE COMPLET

## ✅ Configuration Prête

Votre projet est maintenant prêt pour créer un APK! Vous avez **2 options**:

---

## **OPTION 1: EAS Build (Cloud) ☁️ - RECOMMANDÉ**

**Avantages:**
- ✅ Pas besoin d'Android SDK sur votre PC
- ✅ Compilation dans le cloud
- ✅ Automatisé et stable
- ✅ Cible Android 15 avec les dernières optimisations

**Commande:**
```bash
cd c:\Users\robin\Documents\RpgHybrid
eas build --platform android --profile preview
```

**Temps:** 10-20 minutes

**Résultat:** Lien de téléchargement direct de l'APK

### Étapes:
1. Lancez la commande ci-dessus
2. Attendez la notification "Build successful"
3. Téléchargez l'APK depuis le lien fourni
4. Installer sur votre appareil Android

### Installer l'APK
```bash
# Via ADB (appareil USB connecté)
adb install fitness-rpg.apk

# Ou transfert manuel sur le téléphone
```

---

## **OPTION 2: Gradle Local ⚙️ - ALTERNATIF**

**Avantages:**
- ✅ Compilation entièrement locale
- ✅ Plus rapide après la première build
- ✅ Débogage plus facile

**Prérequis:**
- Android SDK installé
- Java 17+
- Gradle

**Commandes:**
```bash
cd c:\Users\robin\Documents\RpgHybrid\android
.\gradlew assembleRelease
```

**Temps:** 20-40 minutes

**Résultat:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎯 Configuration Actuelle

✅ **Slug (ID Expo):** fitness-rpg  
✅ **Package ID:** com.fitnessrpg.app  
✅ **Version:** 1.0.0 (Code: 12)  
✅ **Min SDK:** 24 (Android 7.0)  
✅ **Target SDK:** 36 (Android 15)  
✅ **Proguard:** Activé (compression automatique)  
✅ **Build Type:** APK Release  

---

## 📋 Fichiers de Configuration

- `app.json` - Configuration Expo
- `eas.json` - Profils de build EAS
- `android/build.gradle` - Config Gradle
- `android/app/build.gradle` - Config APK

---

## ✨ Prochaines Étapes Recommandées

### Immédiat (Choisir UNE option):
- **Option 1:** `eas build --platform android --profile preview`
- **Option 2:** `cd android && .\gradlew assembleRelease`

### Après Création:
1. ✅ Télécharger l'APK
2. ✅ Transférer sur appareil Android
3. ✅ Installer et tester
4. ✅ Rapporter bugs/améliorations

### Pour Publication Play Store:
```bash
# Créer un AAB (Android App Bundle)
eas build --platform android --profile production

# Ensuite soumettre sur Google Play Console
```

---

## 🔗 Ressources

- **EAS Dashboard:** https://expo.dev/accounts/robinallainmkg/projects/fitness-rpg
- **Documentation Expo:** https://docs.expo.dev/build/
- **Guides détaillés:** Voir `APK_BUILD_GUIDE.md` et `APK_BUILD_LOCAL.md`

---

## ❓ Besoin d'Aide?

Si vous rencontrez un problème:

1. **Erreur EAS config:**
   ```bash
   # Vérifier app.json slug
   cat app.json | Select-String '"slug"'
   ```

2. **Gradle ne fonctionne pas:**
   ```bash
   cd android
   .\gradlew clean
   .\gradlew assembleRelease
   ```

3. **APK trop volumineux:**
   - ProGuard est activé (compression automatique)
   - Taille attendue: 80-120 MB

4. **Installer sur téléphone:**
   - Paramètres > Sécurité > Sources inconnues (activer)
   - Appui long sur APK > Installer

