# Installation du Development Build

## Pourquoi un Development Build ?

Le **development build** est une version compilée de ton app qui :
- ✅ Inclut toutes les dépendances natives (Firebase, etc.)
- ✅ Permet le Hot Reload
- ✅ Donne accès aux outils de debug
- ✅ Fonctionne comme la version production

**Expo Go** est plus rapide mais ne supporte pas toutes les librairies natives.

---

## Option 1 : Build via EAS (Cloud) - GRATUIT limité

### Prérequis
Tu as atteint la limite gratuite (16 jours avant reset).

**Solutions :**
1. Attendre 16 jours
2. Utiliser GitHub Actions (gratuit illimité)
3. Build local (si tu as un Mac)

---

## Option 2 : Installer un APK déjà compilé

Si tu as déjà un APK de build :

1. Connecte ton téléphone en USB
2. Active "Sources inconnues" dans les paramètres
3. Installe l'APK :
   ```bash
   adb install chemin/vers/ton-app.apk
   ```

---

## Option 3 : Utiliser Expo Go pour l'instant

**C'est la solution la plus simple pour développer maintenant !**

### Ce qui marche dans Expo Go :
- ✅ React Navigation
- ✅ State management
- ✅ API calls
- ✅ AsyncStorage
- ✅ La plupart des composants UI

### Ce qui ne marche PAS :
- ❌ Firebase natif (utilise le SDK web à la place)
- ❌ Certaines librairies natives customs

---

## Recommandation pour maintenant

**Utilise Expo Go** pour :
1. Développer les features UI
2. Tester la navigation
3. Débugger la logique métier
4. Itérer rapidement avec Hot Reload

**Utilise le Development Build** pour :
1. Tester Firebase
2. Valider les features natives
3. Tester avant release production

---

## Pour créer un nouveau Development Build (quand limite reset)

### Via EAS (dans 16 jours) :
```bash
npx eas build --platform android --profile development
```

### Via GitHub Actions (gratuit maintenant) :
1. Configure le workflow dans `.github/workflows/`
2. Push sur GitHub
3. Télécharge l'APK généré
4. Installe sur ton téléphone

---

## Alternative : Android Studio (Build Local)

⚠️ Ça prend ~30-45 min la première fois

```bash
# 1. Générer le projet Android natif
npx expo prebuild

# 2. Build avec Gradle
cd android
./gradlew assembleDebug

# 3. Installer l'APK
cd ..
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Résumé

**Pour développer MAINTENANT** :
→ **Utilise Expo Go** (scanne le QR code)

**Pour tester Firebase** :
→ Attends 16 jours OU utilise GitHub Actions

**Pour publier** :
→ Utilise le AAB déjà généré (si tu l'as)

---

**Scanne le QR code avec Expo Go et commence à coder ! 🚀**
