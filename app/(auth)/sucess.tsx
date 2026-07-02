import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Le bouton "empreinte digitale" est centré au milieu de l'écran.
// L'iris part exactement de ce point.
const BTN_SIZE = 84;
const IRIS_ORIGIN_X = SCREEN_W / 2;
const IRIS_ORIGIN_Y = SCREEN_H / 2;

// Rayon nécessaire pour que le cercle couvre l'intégralité de l'écran,
// quel que soit le point de départ (distance au coin le plus éloigné).
const MAX_RADIUS = Math.sqrt(
  Math.max(IRIS_ORIGIN_X, SCREEN_W - IRIS_ORIGIN_X) ** 2 +
    Math.max(IRIS_ORIGIN_Y, SCREEN_H - IRIS_ORIGIN_Y) ** 2,
);

const FILL_DURATION = 2400; // remplissage lent et délibéré
const FADE_DELAY = 250; // attente après l'arrivée du message avant le fondu
const FADE_DURATION = 900; // fondu doux du rouge vers le noir

export default function SuccessScreen() {
  const router = useRouter();
  const colors = useColors();

  const [phase, setPhase] = useState<"idle" | "scanning" | "filling" | "done">(
    "idle",
  );

  const irisDiameter = useRef(new Animated.Value(0)).current;
  const irisOpacity = useRef(new Animated.Value(1)).current;
  const idleFade = useRef(new Animated.Value(1)).current;
  const successFade = useRef(new Animated.Value(0)).current;
  const successLineHeight = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
    safeArea: { flex: 1 },
    content: {
      paddingHorizontal: 30,
      paddingTop: 40,
      alignItems: "center",
    },
    eyebrow: {
      color: "#5a5a5a",
      fontSize: 11,
      fontWeight: "400",
      letterSpacing: 2,
      marginBottom: 18,
    },
    title: {
      color: "#fafafa",
      fontSize: 30,
      fontWeight: "500",
      lineHeight: 38,
      textAlign: "center",
      letterSpacing: -0.5,
      marginBottom: 14,
    },
    subtitle: {
      color: "#7a7a7a",
      fontSize: 13,
      lineHeight: 21,
      textAlign: "center",
      maxWidth: 230,
    },
    successLine: {
      width: 1,
      backgroundColor: c.red,
      marginBottom: 20,
    },
    successTitle: {
      color: "#fafafa",
      fontSize: 28,
      fontWeight: "500",
      lineHeight: 36,
      textAlign: "center",
      letterSpacing: -0.5,
      marginBottom: 14,
    },
    successSubtitle: {
      color: "#9a8a8a",
      fontSize: 13,
      lineHeight: 21,
      textAlign: "center",
      maxWidth: 230,
    },
    iris: {
      position: "absolute",
      backgroundColor: c.red,
    },
    centerBtnWrapper: {
      position: "absolute",
      left: IRIS_ORIGIN_X - BTN_SIZE / 2,
      top: IRIS_ORIGIN_Y - BTN_SIZE / 2,
      width: BTN_SIZE,
      height: BTN_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: 26,
      paddingHorizontal: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    pulseRing: {
      position: "absolute",
      width: BTN_SIZE,
      height: BTN_SIZE,
      borderRadius: BTN_SIZE / 2,
      borderWidth: 1,
      borderColor: c.red,
    },
    fingerprintBtn: {
      width: BTN_SIZE,
      height: BTN_SIZE,
      borderRadius: BTN_SIZE / 2,
      borderWidth: 1,
      borderColor: c.red,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmLabel: {
      position: "absolute",
      left: 0,
      right: 0,
      top: IRIS_ORIGIN_Y + BTN_SIZE / 2 + 14,
      textAlign: "center",
      color: "#6a6a6a",
      fontSize: 11,
      fontWeight: "400",
      letterSpacing: 1,
    },
    continueBtn: {
      width: "100%",
      paddingHorizontal: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#fafafa",
      borderRadius: 2,
      paddingVertical: 15,
    },
    continueBtnText: {
      color: "#0a0a0a",
      fontSize: 13,
      fontWeight: "500",
      letterSpacing: 0.5,
    },
  }));

  React.useEffect(() => {
    if (phase !== "idle") return;

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.35,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [phase, pulseScale, pulseOpacity]);

  const handleConfirm = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("filling");

    Animated.parallel([
      Animated.sequence([
        Animated.timing(btnScale, {
          toValue: 0.88,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(btnScale, {
          toValue: 1.05,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(idleFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(irisDiameter, {
        toValue: MAX_RADIUS * 2,
        duration: FILL_DURATION,
        easing: Easing.bezier(0.45, 0, 0.4, 1),
        useNativeDriver: false, // width/height/borderRadius non transformables nativement
      }),
    ]).start(() => {
      setPhase("done");

      Animated.timing(successFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(successLineHeight, {
        toValue: 32,
        duration: 500,
        delay: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      // Une fois le message affiché, le rouge s'efface en douceur vers le noir
      Animated.timing(irisOpacity, {
        toValue: 0,
        duration: FADE_DURATION,
        delay: FADE_DELAY,
        useNativeDriver: true,
      }).start();
    });
  }, [
    phase,
    btnScale,
    idleFade,
    irisDiameter,
    successFade,
    successLineHeight,
    irisOpacity,
  ]);

  const handleContinue = useCallback(() => {
    router.replace("/(donor)");
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Contenu initial (en haut) ── */}
        <Animated.View style={{ opacity: idleFade }}>
          <View style={styles.content}>
            <Text style={styles.eyebrow}>ÉTAPE FINALE</Text>
            <Text style={styles.title}>Confirmez{"\n"}votre engagement</Text>
            <Text style={styles.subtitle}>
              Touchez l'empreinte pour valider votre inscription et rejoindre la
              communauté des donneurs.
            </Text>
          </View>
        </Animated.View>

        {/* ── Message de succès (même zone, en haut) ── */}
        {phase === "done" && (
          <Animated.View
            style={[
              styles.content,
              { position: "absolute", width: "100%", opacity: successFade },
            ]}
          >
            <Animated.View
              style={[styles.successLine, { height: successLineHeight }]}
            />
            <Text style={styles.eyebrow}>INSCRIPTION CONFIRMÉE</Text>
            <Text style={styles.successTitle}>Bienvenue{"\n"}parmi nous</Text>
            <Text style={styles.successSubtitle}>
              Votre profil donneur est actif. Chaque don compte.
            </Text>
          </Animated.View>
        )}
      </SafeAreaView>

      {/* ── Iris rouge : s'ouvre depuis l'empreinte (centre écran) puis s'efface vers le noir ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.iris,
          {
            left: IRIS_ORIGIN_X,
            top: IRIS_ORIGIN_Y,
            width: irisDiameter,
            height: irisDiameter,
            borderRadius: Animated.divide(irisDiameter, 2),
            marginLeft: Animated.multiply(irisDiameter, -0.5),
            marginTop: Animated.multiply(irisDiameter, -0.5),
            opacity: irisOpacity,
          },
        ]}
      />

      {/* ── Bouton empreinte digitale : centré au milieu de l'écran ── */}
      {phase !== "done" && (
        <View style={styles.centerBtnWrapper} pointerEvents="box-none">
          {/* Anneau de pulsation invitant au toucher */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={phase === "filling"}
              style={styles.fingerprintBtn}
            >
              <Ionicons name="finger-print" size={34} color={colors.red} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      {phase !== "done" && (
        <Animated.Text style={[styles.confirmLabel, { opacity: idleFade }]}>
          TOUCHEZ POUR CONFIRMER
        </Animated.Text>
      )}

      {/* ── Footer : bouton continuer, affiché seulement après succès ── */}
      {phase === "done" && (
        <View style={styles.footer}>
          <Animated.View style={{ width: "100%", opacity: successFade }}>
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.85}
              style={styles.continueBtn}
            >
              <Text style={styles.continueBtnText}>CONTINUER</Text>
              <Ionicons name="arrow-forward" size={15} color="#0a0a0a" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
