import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useCheckPendingRegistration } from "@/src/hooks/usePendingRegistration";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { AppColors } from "@/src/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Logo ─────────────────────────────────────────────────────
function JambaarLogo({ colors }: { colors: AppColors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          width: 30,
          height: 30,
          backgroundColor: colors.red,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={14} color="#FFFFFF" />
      </View>
      <Text
        style={{
          color: colors.white,
          fontSize: 18,
          fontWeight: "700",
          letterSpacing: -0.3,
        }}
      >
        Jambaar
      </Text>
    </View>
  );
}

// ─── Bouton principal ──────────────────────────────────────────
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
  colors: AppColors;
}

function PrimaryButton({
  icon,
  label,
  sublabel,
  onPress,
  colors,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        borderRadius: 16,
        padding: 16,
        backgroundColor: colors.red,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,0.15)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "600",
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 11,
            marginTop: 1,
          }}
        >
          {sublabel}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color="rgba(255,255,255,0.6)"
      />
    </TouchableOpacity>
  );
}

// ─── Orbe central avec pulsation ──────────────────────────────
function HeroOrb({
  colors,
  pulseAnim,
  ring2Anim,
}: {
  colors: AppColors;
  pulseAnim: Animated.Value;
  ring2Anim: Animated.Value;
}) {
  return (
    <View
      style={{
        width: 180,
        height: 180,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 28,
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: 90,
          borderWidth: 1,
          borderColor: "rgba(200,20,20,0.12)",
          transform: [{ scale: pulseAnim }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 137,
          height: 137,
          borderRadius: 68,
          borderWidth: 1,
          borderColor: "rgba(200,20,20,0.18)",
          transform: [{ scale: ring2Anim }],
        }}
      />
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 1,
          borderColor: "rgba(200,20,20,0.30)",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(200,20,20,0.08)",
        }}
      >
        <LinearGradient
          colors={["rgba(232,53,53,0.25)", "rgba(139,0,0,0.12)"]}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            borderRadius: 50,
          }}
        />
        <Ionicons name="heart" size={44} color={colors.red} />
      </View>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  useCheckPendingRegistration();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0a0808" : "#fff5f5",
    },
    haloTop: {
      position: "absolute",
      top: -100,
      left: -80,
      width: 320,
      height: 280,
      borderRadius: 160,
      backgroundColor: isDark ? "rgba(200,20,20,0.14)" : "rgba(200,20,20,0.06)",
    },
    haloBottom: {
      position: "absolute",
      bottom: 80,
      right: -70,
      width: 240,
      height: 200,
      borderRadius: 120,
      backgroundColor: isDark ? "rgba(180,10,10,0.08)" : "rgba(200,20,20,0.04)",
    },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(34,197,94,0.10)",
      borderWidth: 0.5,
      borderColor: "rgba(34,197,94,0.28)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#22c55e",
    },
    statusText: {
      color: "#22c55e",
      fontSize: 10,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    heroBlock: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 8,
    },
    eyebrow: {
      color: isDark ? "#a06060" : "#9b5c5c",
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 10,
      textAlign: "center",
    },
    heroTitle: {
      fontSize: 38,
      fontWeight: "800",
      lineHeight: 42,
      textAlign: "center",
      letterSpacing: -1.5,
      marginBottom: 14,
    },
    heroTitleWhite: {
      color: isDark ? "#f0e4e4" : "#1a0a0a",
    },
    heroTitleRed: {
      color: c.red,
    },
    heroSubtitle: {
      color: isDark ? "#c49090" : "#7a4444",
      fontSize: 13,
      textAlign: "center",
      lineHeight: 21,
      maxWidth: 240,
    },
    heroSubtitleAccent: {
      color: isDark ? "#e08080" : "#9b5050",
    },
    actionsBlock: {
      gap: 10,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 8,
    },
    footerText: {
      color: isDark ? "#a07070" : "#9b7070",
      fontSize: 13,
    },
    footerLink: {
      color: c.red,
      fontSize: 13,
      fontWeight: "500",
    },
    slogan: {
      alignItems: "center",
      paddingBottom: 16,
    },
    sloganText: {
      color: isDark ? "#7a5050" : "#c4a0a0",
      fontSize: 10,
      letterSpacing: 1,
      fontStyle: "italic",
    },
  }));

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2Anim, {
          toValue: 1.1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    pulse2.start();

    return () => {
      pulse.stop();
      pulse2.stop();
    };
  }, []);

  const fadeSlide = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, fadeSlide]}>
          <JambaarLogo colors={colors} />
          <View style={styles.headerRight}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Opérationnel</Text>
            </View>
            <ThemeToggle size={34} />
          </View>
        </Animated.View>

        {/* ── Hero ── */}
        <Animated.View style={[styles.heroBlock, fadeSlide]}>
          <HeroOrb
            colors={colors}
            pulseAnim={pulseAnim}
            ring2Anim={ring2Anim}
          />

          <Text style={styles.eyebrow}>Communauté de donneurs de sang</Text>

          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleWhite}>Chaque goutte{"\n"}</Text>
            <Text style={styles.heroTitleRed}>compte.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Rejoignez Jambaar. Sauvez des vies,{"\n"}
            <Text style={styles.heroSubtitleAccent}>gagnez des points</Text> et
            débloquez{"\n"}des récompenses exclusives.
          </Text>
        </Animated.View>

        {/* ── Actions ── */}
        <Animated.View style={[styles.actionsBlock, { opacity: btnAnim }]}>
          <PrimaryButton
            icon="person"
            label="Je suis donneur"
            sublabel="Inscription gratuite • 2 minutes"
            onPress={() => router.push("/(auth)/register-donor")}
            colors={colors}
          />
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
          <Text style={styles.footerText}>Déjà membre ?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/reconnect-donor")}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={styles.footerLink}>Se reconnecter</Text>
            <Ionicons
              name="arrow-forward-circle"
              size={16}
              color={colors.red}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Slogan ── */}
        <Animated.View style={[styles.slogan, { opacity: btnAnim }]}>
          <Text style={styles.sloganText}>
            L&apos;honneur qui engage, le lien qui sauve.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
