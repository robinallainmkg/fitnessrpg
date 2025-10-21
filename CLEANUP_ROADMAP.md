# 📋 CLEANUP PLAN - Fichiers à Supprimer

## ✅ GARDER (3 fichiers essentiels)

1. **README.md** - Guide maître complet (1 seul!)
2. **INSTALLATION_GUIDE.md** - Pour les utilisateurs finaux
3. **.github/copilot-instructions.md** - Instructions Copilot custom

---

## ❌ SUPPRIMER (40 fichiers inutiles)

### APK Build Guides (5 fichiers)
```
- APK_BUILD_GUIDE.md
- APK_BUILD_LOCAL.md
- APK_BUILD_START.md
- APK_QUICK_START.md
- APK_READY.md
```
**Raison:** Tous remplacés par README.md

### Build & Status (4 fichiers)
```
- BUILD_APK_GUIDE.md
- BUILD_APK_INSTRUCTIONS.md
- BUILD_OPTIONS.md
- BUILD_STATUS.md
```
**Raison:** Obsolète, consolidé dans README.md

### Setup & Configuration (3 fichiers)
```
- ANDROID_SETUP_GUIDE.md
- DEV_SETUP_COMPLETE.md
- DEVELOPMENT_GUIDE.md
```
**Raison:** Documentation remplacée

### Architecture & Structure (6 fichiers)
```
- ARCHITECTURE_MULTI_PROGRAMMES_COMPLETE.md
- PROGRAM_LOADING_OPTIMIZATION.md
- PROGRAM_SELECTION_STYLE_GUIDE.md
- PROGRAMS_MIGRATION_COMPLETE.md
- RUNNING_PROGRAM_STATUS.md
- PROJECT_STATUS.md
```
**Raison:** Historique de refactoring, obsolète

### Design & UI (6 fichiers)
```
- BACKGROUND_IMAGES_INTEGRATION.md
- DESIGN_MIGRATION_SUMMARY.md
- SKILL_TREE_LUCIDE_REFONTE.md
- SKILL_TREE_MODERNIZATION.md
- SKILL_TREE_UX_IMPROVEMENTS.md
- WORKOUT_SCREEN_MODERNIZATION.md
```
**Raison:** Design history, déjà implémenté

### Workout & Features (7 fichiers)
```
- WORKOUT_REFACTORING_COMPLETE.md
- WORKOUT_REFACTORING_SUMMARY.md
- WORKOUT_SCREEN_SIMPLIFIED.md
- WORKOUT_START_FIX.md
- WORKOUT_COMPLETION_GUIDE.md
- WORKOUT_GAINS_GUIDE.md
- WORKOUT_SUMMARY_GUIDE.md (vide!)
- WORKOUT_SUMMARY_EXAMPLE.md
```
**Raison:** Refactoring history, features now live

### Testing & Optimization (6 fichiers)
```
- SYSTEM_TEST_GUIDE.md
- SYSTEM_TEST_INTEGRATION.md
- TEST_GUIDE.md
- PERFORMANCE_OPTIMIZATION.md
- FIREBASE_CLEANUP_PLAN.md
- FIREBASE_TIMEOUT_DIAGNOSTIC.md
```
**Raison:** Debug & test files, no longer needed

### Migration & Legacy (3 fichiers)
```
- MIGRATION_COMPLETE.md
- CLEANUP_COMPLETE.md
- COMPILATION.md
```
**Raison:** Ancient history, project done

### Misc (1 fichier)
```
- Project_context.md
```
**Raison:** Obsolète

---

## 🗂️ AUTRES FICHIERS À NETTOYER

### JavaScript/Node (3 fichiers)
```
DELETE:
- App.debug.js
- App.js.backup
- App.minimal.js
```
**Raison:** Backups inutiles

### Autres backups
```
DELETE (find all):
- *-old.*
- *.backup
- *-backup.*
```

### Cache directories (NE PAS COMMITTER - déjà dans .gitignore)
```
- node_modules/.cache/
- android/build/
- android/.gradle/
- .android/
- *.class
- *.jar
```

---

## 🎯 SCRIPT DE NETTOYAGE

```powershell
# Supprimer les 40 fichiers MD
$filesToDelete = @(
  "APK_BUILD_GUIDE.md", "APK_BUILD_LOCAL.md", "APK_BUILD_START.md",
  "APK_QUICK_START.md", "APK_READY.md", "BUILD_APK_GUIDE.md",
  "BUILD_APK_INSTRUCTIONS.md", "BUILD_OPTIONS.md", "BUILD_STATUS.md",
  "ANDROID_SETUP_GUIDE.md", "DEV_SETUP_COMPLETE.md", "DEVELOPMENT_GUIDE.md",
  "ARCHITECTURE_MULTI_PROGRAMMES_COMPLETE.md", "PROGRAM_LOADING_OPTIMIZATION.md",
  "PROGRAM_SELECTION_STYLE_GUIDE.md", "PROGRAMS_MIGRATION_COMPLETE.md",
  "RUNNING_PROGRAM_STATUS.md", "PROJECT_STATUS.md",
  "BACKGROUND_IMAGES_INTEGRATION.md", "DESIGN_MIGRATION_SUMMARY.md",
  "SKILL_TREE_LUCIDE_REFONTE.md", "SKILL_TREE_MODERNIZATION.md",
  "SKILL_TREE_UX_IMPROVEMENTS.md", "WORKOUT_SCREEN_MODERNIZATION.md",
  "WORKOUT_REFACTORING_COMPLETE.md", "WORKOUT_REFACTORING_SUMMARY.md",
  "WORKOUT_SCREEN_SIMPLIFIED.md", "WORKOUT_START_FIX.md",
  "WORKOUT_COMPLETION_GUIDE.md", "WORKOUT_GAINS_GUIDE.md",
  "WORKOUT_SUMMARY_GUIDE.md", "WORKOUT_SUMMARY_EXAMPLE.md",
  "SYSTEM_TEST_GUIDE.md", "SYSTEM_TEST_INTEGRATION.md", "TEST_GUIDE.md",
  "PERFORMANCE_OPTIMIZATION.md", "FIREBASE_CLEANUP_PLAN.md",
  "FIREBASE_TIMEOUT_DIAGNOSTIC.md", "MIGRATION_COMPLETE.md",
  "CLEANUP_COMPLETE.md", "COMPILATION.md", "Project_context.md"
)

# Supprimer JS backups
Remove-Item App.debug.js -ErrorAction SilentlyContinue
Remove-Item App.js.backup -ErrorAction SilentlyContinue
Remove-Item App.minimal.js -ErrorAction SilentlyContinue

# Supprimer les MD (une par une pour voir la progression)
foreach ($file in $filesToDelete) {
  if (Test-Path $file) {
    Remove-Item $file
    git add $file
    Write-Host "✓ Supprimé: $file"
  }
}

# Commit
git commit -m "chore: cleanup - remove 40+ obsolete documentation files

- Consolidate all docs into single comprehensive README.md
- Remove build guide duplicates
- Remove design/refactoring history files
- Remove test/debug documentation
- Remove backup JS files
- Keep only: README.md, INSTALLATION_GUIDE.md, copilot-instructions.md"

# Push
git push origin main
```

---

## 📊 AVANT/APRÈS

| | Avant | Après |
|---|-------|-------|
| **MD files** | 43 | 3 |
| **Main README** | 180 lines (outdated) | 400 lines (current) |
| **Documentation** | Scattered | Centralized |
| **Maintainability** | ❌ Hard | ✅ Easy |
| **New dev onboarding** | ❌ Confusing | ✅ Simple |

---

## ✅ PROCESS

1. ✅ **GitHub Backup** - All code saved
2. ✅ **README Master** - Comprehensive guide created
3. 🔄 **Run Cleanup Script** - Delete obsolete files
4. 🔄 **Final Commit** - "Project cleanup complete"
5. 🔄 **Create Keystore** - For signing
6. 🔄 **Build for Play Store** - Production APK
7. 🔄 **Internal Testing** - Test via Play Store
8. 🔄 **Submit for Review** - Go live!

---

**Status:** Ready for cleanup 🧹  
**Next:** Run the cleanup script when you're ready!

