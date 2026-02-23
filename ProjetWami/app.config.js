export default {
  expo: {
    name: "Wami Pisciculture",
    slug: "wami-pisciculture",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0891b2"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.wami.pisciculture"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0891b2"
      },
      package: "com.wami.pisciculture",
      versionCode: 1,
      permissions: [
        "RECORD_AUDIO",
        "INTERNET"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "6f9553c6-f3db-4f77-b7d7-fc7d134674e1"
      },
      // Configuration des clés API pour l'assistant IA
      EXPO_PUBLIC_GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY,
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    plugins: []
  }
};
