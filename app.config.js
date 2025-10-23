module.exports = {
  expo: {
    name: "Hybrid RPG",
    slug: "fitness-rpg",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    plugins: [
      "expo-font",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: "36.0.0",
            minSdkVersion: 24,
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false
          }
        }
      ]
    ],
    owner: "robinouchallain",
    extra: {
      eas: {
        projectId: "24efebe9-b486-47f2-8062-3a51d825175a"
      }
    },
    android: {
      package: "com.hybridrpg.app",
      versionCode: 16
    }
  }
};
