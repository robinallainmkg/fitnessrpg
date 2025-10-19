#!/bin/bash
# EAS Build pre-build hook

echo "🧹 Cleaning Android build cache..."
cd android
./gradlew clean
cd ..

echo "✅ Pre-build cleanup complete"
