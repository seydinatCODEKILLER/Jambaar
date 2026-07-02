import { Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAlertStore } from "@/src/store/alerts.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import logger from "@/src/utils/logger.utils";

const BADGE_UNLOCK_DELAY_MS = 2500;

export function registerBadgeHandlers(
  socket: Socket,
  queryClient: QueryClient,
) {
  // ── BADGE(S) DÉBLOQUÉ(S) (Pour les DONNEURS) ─────────────
  socket.on(
    "badges:earned",
    (data: {
      badges: {
        id: string;
        name: string;
        description: string;
        iconUrl?: string;
      }[];
    }) => {
      logger.info(
        "🏅 Badges débloqués :",
        data.badges.map((b) => b.name),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const { setBadgeUnlock } = useAlertStore.getState();

      // Affiche chaque badge avec un délai pour ne pas les superposer
      data.badges.forEach((badge, index) => {
        setTimeout(() => {
          setBadgeUnlock({
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl,
          });
        }, index * BADGE_UNLOCK_DELAY_MS);
      });

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarssBadges });
    },
  );

  // ── NOUVEAU BADGE CRÉÉ PAR L'ADMIN ────────────────────────
  socket.on("badges:new", () => {
    logger.info("🏅 Nouveau badge disponible");
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarssBadges });
  });
}
