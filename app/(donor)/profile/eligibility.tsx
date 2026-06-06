import { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useBottomTabBarHeight } from "@/src/hooks/useTabBarHeight";

// ─── Données ───────────────────────────────────────────────────

const HERO = {
  emoji: "🩸",
  title: "Puis-je donner\ndu sang ?",
  subtitle:
    "Découvrez les critères médicaux et conditions à remplir avant de vous rendre en centre de don.",
};

const REQUIRED: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  detail: string;
}[] = [
  {
    icon: "person-outline",
    color: "#1D9E75",
    title: "Âge entre 18 et 70 ans",
    detail:
      "Le don est ouvert aux majeurs jusqu'à 70 ans selon les structures.",
  },
  {
    icon: "scale-outline",
    color: "#1D9E75",
    title: "Poids minimum 50 kg",
    detail:
      "Un poids insuffisant peut causer des malaises lors du prélèvement.",
  },
  {
    icon: "pulse-outline",
    color: "#1D9E75",
    title: "Être en bonne santé",
    detail:
      "Pas de maladie aiguë, pas de fièvre, pas de traitement incompatible.",
  },
  {
    icon: "time-outline",
    color: "#1D9E75",
    title: "Respecter le délai de 56 jours",
    detail:
      "Au moins 8 semaines doivent s'écouler entre deux dons de sang total.",
  },
  {
    icon: "water-outline",
    color: "#1D9E75",
    title: "Être bien hydraté",
    detail: "Buvez au moins 1,5 litre d'eau dans les heures précédant le don.",
  },
  {
    icon: "restaurant-outline",
    color: "#1D9E75",
    title: "Avoir mangé légèrement",
    detail:
      "Évitez les repas gras. Un repas léger 2-3h avant le don est recommandé.",
  },
];

const CONTRAINDICATIONS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  temporary: boolean;
}[] = [
  {
    icon: "medical-outline",
    title: "Prise d'antibiotiques",
    detail: "Attendre 14 jours après la fin du traitement.",
    temporary: true,
  },
  {
    icon: "bandage-outline",
    title: "Chirurgie ou endoscopie récente",
    detail: "Délai de 4 mois minimum après l'intervention.",
    temporary: true,
  },
  {
    icon: "airplane-outline",
    title: "Voyage en zone à risque",
    detail: "Certaines destinations imposent un délai de 6 à 12 mois.",
    temporary: true,
  },
  {
    icon: "sad-outline",
    title: "Tatouage ou piercing récent",
    detail: "Attendre 4 mois après la réalisation.",
    temporary: true,
  },
  {
    icon: "alert-circle-outline",
    title: "Certaines maladies chroniques",
    detail: "Diabète insulino-dépendant, épilepsie active, certains cancers.",
    temporary: false,
  },
  {
    icon: "heart-dislike-outline",
    title: "Maladies cardiovasculaires graves",
    detail: "Contre-indication permanente selon avis médical.",
    temporary: false,
  },
];

const TIPS: { emoji: string; text: string }[] = [
  { emoji: "💧", text: "Hydratez-vous bien la veille et le jour du don." },
  { emoji: "🥗", text: "Mangez léger, évitez les graisses et l'alcool." },
  { emoji: "😴", text: "Dormez suffisamment la nuit précédente." },
  { emoji: "👕", text: "Portez un vêtement à manches larges." },
  { emoji: "🧘", text: "Restez calme et signalez tout malaise au personnel." },
];

// ─── Composants ────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text
      style={{
        color: colors.textSubtle,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      {label}
    </Text>
  );
}

function RequiredCard({
  item,
  delay,
}: {
  item: (typeof REQUIRED)[0];
  delay: number;
}) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 13,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: item.color + "18",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name={item.icon} size={17} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.white,
            fontSize: 13,
            fontWeight: "700",
            marginBottom: 3,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          {item.detail}
        </Text>
      </View>
    </Animated.View>
  );
}

function ContraCard({
  item,
  delay,
}: {
  item: (typeof CONTRAINDICATIONS)[0];
  delay: number;
}) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const accent = item.temporary ? colors.amber : colors.red;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 13,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: accent + "14",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name={item.icon} size={17} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginBottom: 3,
          }}
        >
          <Text
            style={{ color: colors.white, fontSize: 13, fontWeight: "700" }}
          >
            {item.title}
          </Text>
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: accent + "18",
              borderWidth: 0.5,
              borderColor: accent + "38",
            }}
          >
            <Text
              style={{
                color: accent,
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 0.4,
              }}
            >
              {item.temporary ? "TEMPORAIRE" : "PERMANENT"}
            </Text>
          </View>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>
          {item.detail}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────

export default function EligibilityScreen() {
  const router = useRouter();
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 4,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: c.white,
      fontSize: 16,
      fontWeight: "700",
    },
    // ── Hero ──
    heroCard: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 6,
      backgroundColor: c.cardBg,
      borderRadius: 22,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 20,
      overflow: "hidden",
    },
    heroGlow: {
      position: "absolute",
      top: -50,
      right: -50,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "rgba(220,30,30,0.06)",
    },
    heroEmoji: { fontSize: 38, marginBottom: 12 },
    heroTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.6,
      lineHeight: 32,
      marginBottom: 10,
    },
    heroSubtitle: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    heroAccent: { color: c.red },
    // ── Info Banner ──
    infoBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 16,
      backgroundColor: "rgba(29,158,117,0.08)",
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: "rgba(29,158,117,0.22)",
      padding: 11,
    },
    infoBannerText: {
      flex: 1,
      color: "rgba(29,158,117,0.9)",
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500",
    },
    // ── Tips ──
    tipsCard: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 13,
    },
    tipEmoji: { fontSize: 20, width: 28, textAlign: "center" },
    tipText: { flex: 1, color: c.textMuted, fontSize: 13, lineHeight: 18 },
    tipSep: { height: 0.5, backgroundColor: c.cardBorder, marginLeft: 53 },
    // ── Disclaimer ──
    disclaimer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
      marginBottom: 8,
    },
    disclaimerText: {
      flex: 1,
      color: c.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Éligibilité au don</Text>
        <View style={{ width: 38 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 24,
          gap: 14,
        }}
      >
        {/* ── Hero ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <Text style={styles.heroEmoji}>{HERO.emoji}</Text>
            <Text style={styles.heroTitle}>
              Puis-je donner{"\n"}du{" "}
              <Text style={styles.heroAccent}>sang ?</Text>
            </Text>
            <Text style={styles.heroSubtitle}>{HERO.subtitle}</Text>

            <View style={styles.infoBanner}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#1D9E75"
              />
              <Text style={styles.infoBannerText}>
                Un médecin ou infirmier évalue votre éligibilité le jour du don.
                Ces critères sont indicatifs.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Conditions requises ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionTitle label="CONDITIONS REQUISES" />
          <View style={{ gap: 8 }}>
            {REQUIRED.map((item, i) => (
              <RequiredCard key={item.title} item={item} delay={i * 55} />
            ))}
          </View>
        </View>

        {/* ── Contre-indications ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionTitle label="CONTRE-INDICATIONS" />
          <View style={{ gap: 8 }}>
            {CONTRAINDICATIONS.map((item, i) => (
              <ContraCard key={item.title} item={item} delay={i * 55} />
            ))}
          </View>
        </View>

        {/* ── Conseils pratiques ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <SectionTitle label="CONSEILS PRATIQUES" />
          <View style={styles.tipsCard}>
            {TIPS.map((tip, i) => (
              <View key={tip.emoji}>
                <View style={styles.tipRow}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
                {i < TIPS.length - 1 && <View style={styles.tipSep} />}
              </View>
            ))}
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.disclaimer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.textMuted}
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <Text style={styles.disclaimerText}>
              Ces informations sont données à titre indicatif et ne remplacent
              pas l'entretien médical obligatoire réalisé avant chaque don. Seul
              un professionnel de santé peut valider votre éligibilité.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
