# 🎯 APK BUILD - COMMANDES RAPIDES

## 🚀 DÉMARRER LE BUILD (Choisir UNE option)

### ✅ Option 1: EAS Cloud (Recommandé - Facile)
```powershell
cd c:\Users\robin\Documents\RpgHybrid
eas build --platform android --profile preview
```
- Temps: 10-20 min
- Pas besoin d'Android SDK
- QR code + lien de téléchargement direct

### ⚙️ Option 2: Gradle Local (Avancé)
```powershell
cd c:\Users\robin\Documents\RpgHybrid\android
.\gradlew assembleRelease
```
- Temps: 20-40 min
- Nécessite Android SDK
- Fichier: `app/build/outputs/apk/release/app-release.apk`

---

## 📥 APRÈS LA BUILD

### Télécharger (EAS):
```powershell
eas build:download --platform android
```

### Installer sur Téléphone:
```powershell
adb install fitness-rpg.apk
```

Ou: Transfert fichier + Paramètres > Sécurité > Sources inconnues ✅

---

## 📊 CONFIG

- **Package:** com.fitnessrpg.app
- **Version:** 1.0.0
- **Target Android:** 15 (API 36)
- **Taille:** ~90 MB

---

## 📂 Fichiers de Référence

- `APK_BUILD_START.md` - Guide complet
- `APK_BUILD_GUIDE.md` - Instructions détaillées
- `APK_BUILD_LOCAL.md` - Options locales
- `BUILD_STATUS.md` - Suivi du build

---

**Status:** ✅ Prêt pour la compilation

