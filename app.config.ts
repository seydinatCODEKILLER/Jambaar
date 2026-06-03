import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Jambaar",
  slug: "jambaar",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "jambaar",
  userInterfaceStyle: "automatic",
  updates: {
    url: "https://u.expo.dev/bb5978b7-463f-460e-bc57-d6b1f17959cf",
  },
  runtimeVersion: {
    policy: "appVersion",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "sn.vitalink.donor",
  },
  android: {
    package: "sn.vitalink.donor",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-brightness",
    "react-native-edge-to-edge",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-secure-store",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Jambaar a besoin de votre position pour vous alerter des besoins en sang près de chez vous.",
        locationWhenInUsePermission:
          "Jambaar a besoin de votre position pour vous alerter des besoins en sang près de chez vous.",
      },
    ],
    [
      "expo-notifications",
      {
        color: "#DC1E1E",
        defaultChannel: "default",
        sounds: [],
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Jambaar a besoin d'accéder à votre galerie pour mettre à jour votre photo de profil.",
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission:
          "Jambaar utilise Face ID pour sécuriser votre connexion.",
      },
    ],
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000",
    eas: {
      projectId: "bb5978b7-463f-460e-bc57-d6b1f17959cf",
    },
  },
});
