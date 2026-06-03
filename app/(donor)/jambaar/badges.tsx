import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { useMyBadges } from "@/src/hooks/useJambaar";
import { Badge } from "@/src/types/domain.types";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { useFocusEffect } from "expo-router";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { useQueryClient } from "@tanstack/react-query";

function getDefaultEmoji(badge: Badge): string {
  const name = badge.name.toLowerCase();
  if (
    name.includes("premier") ||
    name.includes("début") ||
    name.includes("bienvenue")
  )
    return "🌟";
  if (
    name.includes("sang") ||
    name.includes("rare") ||
    name.includes("universel")
  )
    return "💎";
  if (
    name.includes("vie") ||
    name.includes("sauve") ||
    name.includes("sauveur")
  )
    return "❤️";
  if (
    name.includes("fidèle") ||
    name.includes("régulier") ||
    name.includes("loyal")
  )
    return "⭐";
  if (
    name.includes("nuit") ||
    name.includes("urgence") ||
    name.includes("veilleur")
  )
    return "🌙";
  if (
    name.includes("ville") ||
    name.includes("local") ||
    name.includes("quartier")
  )
    return "🏙️";
  if (
    name.includes("rapide") ||
    name.includes("éclair") ||
    name.includes("flash")
  )
    return "⚡";
  if (
    name.includes("généreux") ||
    name.includes("don") ||
    name.includes("altruiste")
  )
    return "🎁";
  if (
    name.includes("marathon") ||
    name.includes("cent") ||
    name.includes("dizaine")
  )
    return "🎯";
  if (badge.isSeasonal) return "🎄";
  return "🏅";
}

function parseCriteria(criteriaJson: string): string {
  try {
    const c = JSON.parse(criteriaJson);
    if (c.minDonations)
      return `${c.minDonations} don${c.minDonations > 1 ? "s" : ""} requis`;
    if (c.exactDonations)
      return `${c.exactDonations} don${c.exactDonations > 1 ? "s" : ""} exact${c.exactDonations > 1 ? "s" : ""}`;
    if (c.minPoints) return `${c.minPoints} pts requis`;
    if (c.bloodType) return `Groupe ${c.bloodType.replace("_", "")} uniquement`;
    return "Critère spécial";
  } catch {
    return "Critère inconnu";
  }
}

function isNewBadge(badge: Badge): boolean {
  if (!badge.isUnlocked || !badge.earnedAt) return false;
  return dayjs().diff(dayjs(badge.earnedAt), "hour") < 24;
}

// ─── Skeleton ─────────────────────────────────────────────────
function BadgesSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    line: { height: 10, borderRadius: 5, backgroundColor: c.cardBorder },
    gridItem: {
      width: "31%",
      aspectRatio: 0.78,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
  }));

  return (
    <View style={{ opacity: 0.6, gap: 28 }}>
      <View style={[styles.cardBg, { padding: 18, gap: 12 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={[styles.line, { width: "40%" }]} />
          <View style={[styles.line, { width: "15%" }]} />
        </View>
        <View
          style={{
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.cardBorder,
          }}
        />
        <View style={[styles.line, { width: "60%", height: 8 }]} />
      </View>
      <View style={{ gap: 14 }}>
        <View style={[styles.line, { width: "30%", height: 8 }]} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.gridItem} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Badge Card — animation simplifiée ────────────────────────
function BadgeCard({
  badge,
  index,
  colors,
  styles,
}: {
  badge: Badge;
  index: number;
  colors: AppColors;
  styles: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const isUnlocked = badge.isUnlocked;
  const isNew = isNewBadge(badge);
  const badgeEmoji = badge.iconUrl ? null : getDefaultEmoji(badge);

  useEffect(() => {
    // Animation simple : fade + scale au montage, décalée par index
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeCard,
        isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
        isNew && { borderColor: colors.amber + "70" },
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Barre accent top pour les badges débloqués */}
      {isUnlocked && (
        <View
          style={[
            styles.unlockedAccentBar,
            isNew && { backgroundColor: colors.amber },
          ]}
        />
      )}

      {/* Badge "NEW" simple pour les nouveaux */}
      {isNew && (
        <View style={styles.newPill}>
          <Text style={styles.newPillText}>NOUVEAU</Text>
        </View>
      )}

      <View
        style={[
          styles.badgeIconWrap,
          isUnlocked ? styles.iconUnlocked : styles.iconLocked,
          isNew && styles.iconNewUnlocked,
        ]}
      >
        {isUnlocked ? (
          badge.iconUrl ? (
            <Image
              source={{ uri: badge.iconUrl }}
              style={styles.badgeImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={[styles.badgeEmoji, isNew && { fontSize: 28 }]}>
              {badgeEmoji}
            </Text>
          )
        ) : badge.iconUrl ? (
          <View style={styles.lockedImageContainer}>
            <Image
              source={{ uri: badge.iconUrl }}
              style={[styles.badgeImage, styles.badgeImageLocked]}
              resizeMode="contain"
            />
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color={colors.white} />
            </View>
          </View>
        ) : (
          <Ionicons name="lock-closed" size={20} color={colors.textSubtle} />
        )}
      </View>

      <Text
        style={[
          styles.badgeName,
          !isUnlocked && styles.badgeNameLocked,
          isNew && { color: colors.amber },
        ]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>

      {isUnlocked ? (
        <View style={[styles.earnedPill, isNew && styles.earnedPillNew]}>
          <Text style={styles.earnedPillText}>
            {dayjs(badge.earnedAt).format("MMM YYYY")}
          </Text>
        </View>
      ) : (
        <Text style={styles.badgeCriteria} numberOfLines={2}>
          {parseCriteria(badge.criteria)}
        </Text>
      )}
    </Animated.View>
  );
}

// ─── Section Header ────────────────────────────────────────────
function SectionHeader({
  title,
  count,
  color,
  hasNew,
  colors,
  styles,
}: {
  title: string;
  count: number;
  color: string;
  hasNew?: boolean;
  colors: AppColors;
  styles: any;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionDot,
          { backgroundColor: hasNew ? colors.amber : color },
        ]}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
      {hasNew && <Text style={{ fontSize: 14 }}>🎉</Text>}
      <View
        style={[
          styles.sectionCount,
          {
            borderColor: (hasNew ? colors.amber : color) + "40",
            backgroundColor: (hasNew ? colors.amber : color) + "15",
          },
        ]}
      >
        <Text
          style={[
            styles.sectionCountText,
            { color: hasNew ? colors.amber : color },
          ]}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function BadgesScreen() {
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useMyBadges();
  const hasNetworkError = isError && isNetworkError(error);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarssBadges });
    }, []),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 20 },
    topHalo: {
      position: "absolute",
      top: -60,
      left: "50%",
      marginLeft: -100,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.redGlow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: {
      color: c.white,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    headerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: c.amber + "12",
      borderWidth: 1,
      borderColor: c.amber + "28",
    },
    headerBadgeText: { color: c.amber, fontSize: 13, fontWeight: "800" },
    progressCard: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 18,
      marginBottom: 28,
      gap: 12,
    },
    progressTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    progressLabel: { color: c.white, fontSize: 13, fontWeight: "700" },
    progressPercent: { color: c.amber, fontSize: 14, fontWeight: "800" },
    progressBarBg: {
      height: 7,
      borderRadius: 4,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },
    progressBarFill: { height: "100%", borderRadius: 4 },
    progressHint: { color: c.textMuted, fontSize: 12 },
    section: { marginBottom: 28 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    sectionDot: { width: 6, height: 6, borderRadius: 3 },
    sectionTitle: {
      color: c.white,
      fontSize: 13,
      fontWeight: "700",
      flex: 1,
      letterSpacing: 0.2,
    },
    sectionCount: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
    },
    sectionCountText: { fontSize: 12, fontWeight: "800" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    badgeCard: {
      width: "31%",
      aspectRatio: 0.78,
      borderRadius: 18,
      borderWidth: 1.5,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      position: "relative",
      overflow: "hidden",
    },
    badgeUnlocked: {
      backgroundColor: c.amber + "06",
      borderColor: c.amber + "28",
    },
    badgeLocked: { backgroundColor: c.cardBg, borderColor: c.cardBorder },
    unlockedAccentBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2.5,
      borderRadius: 2,
      backgroundColor: c.amber,
      opacity: 0.7,
    },
    newPill: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: c.amber,
      borderRadius: 5,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    newPillText: {
      color: "#1A1A1A",
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    badgeIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    iconUnlocked: {
      backgroundColor: c.amber + "14",
      borderWidth: 1,
      borderColor: c.amber + "28",
    },
    iconNewUnlocked: {
      backgroundColor: c.amber + "22",
      borderColor: c.amber + "50",
      borderWidth: 2,
    },
    iconLocked: {
      backgroundColor: c.cardBorder,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    badgeImage: { width: 36, height: 36 },
    badgeImageLocked: { opacity: 0.25 },
    lockedImageContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    lockOverlay: {
      position: "absolute",
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "rgba(0,0,0,0.65)",
      alignItems: "center",
      justifyContent: "center",
    },
    badgeEmoji: { fontSize: 24 },
    badgeName: {
      color: c.white,
      fontSize: 11,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.2,
      lineHeight: 15,
    },
    badgeNameLocked: { color: c.textSubtle, fontWeight: "600" },
    earnedPill: {
      backgroundColor: c.amber + "15",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: c.amber + "28",
    },
    earnedPillNew: {
      backgroundColor: c.amber + "25",
      borderColor: c.amber + "50",
    },
    earnedPillText: {
      color: c.amber,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    badgeCriteria: {
      color: c.textMuted,
      fontSize: 9,
      textAlign: "center",
      lineHeight: 13,
    },
  }));

  const goBack = useSmartBack({
    defaultRoute: "/(donor)/jambaar",
    routeMap: {
      jambaar: "/(donor)/jambaar",
      profile: "/(donor)/profile",
      settings: "/(donor)/profile/settings",
    },
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!data) return;
    const pct = data.total > 0 ? data.earned / data.total : 0;
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [data]);

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={goBack}
        style={styles.backBtn}
        activeOpacity={0.75}
      >
        <Ionicons name="arrow-back" size={19} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>
          Mes <Text style={{ color: colors.amber }}>Badges</Text>
        </Text>
      </View>
      {data ? (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {data.earned}/{data.total}
          </Text>
        </View>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </Animated.View>
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.topHalo} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader()}
          <BadgesSkeleton colors={colors} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (hasNetworkError && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.topHalo} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader()}
        </ScrollView>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const unlockedBadges = data.badges.filter((b) => b.isUnlocked);
  const lockedBadges = data.badges.filter((b) => !b.isUnlocked);
  const progressPct = data.total > 0 ? (data.earned / data.total) * 100 : 0;
  const isComplete = data.earned === data.total;
  const hasNewBadges = unlockedBadges.some((b) => isNewBadge(b));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topHalo} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "ios" ? 120 : 90 },
        ]}
      >
        {renderHeader()}

        {/* ── Carte progression ── */}
        <Animated.View style={[styles.progressCard, { opacity: fadeAnim }]}>
          <View style={styles.progressTop}>
            <View style={styles.progressLeft}>
              <Ionicons name="trophy" size={16} color={colors.amber} />
              <Text style={styles.progressLabel}>Collection complète</Text>
            </View>
            <Text style={styles.progressPercent}>
              {Math.round(progressPct)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: isComplete ? colors.success : colors.amber,
                },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>
            {isComplete
              ? "🏆 Tous les badges débloqués !"
              : `${data.total - data.earned} badge${data.total - data.earned > 1 ? "s" : ""} encore à obtenir`}
          </Text>
        </Animated.View>

        {/* ── Badges débloqués ── */}
        {unlockedBadges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Débloqués"
              count={unlockedBadges.length}
              color={colors.amber}
              hasNew={hasNewBadges}
              colors={colors}
              styles={styles}
            />
            <View style={styles.grid}>
              {unlockedBadges.map((badge, i) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  index={i}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Badges verrouillés ── */}
        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="À débloquer"
              count={lockedBadges.length}
              color={colors.textMuted}
              colors={colors}
              styles={styles}
            />
            <View style={styles.grid}>
              {lockedBadges.map((badge, i) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  index={unlockedBadges.length + i}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
