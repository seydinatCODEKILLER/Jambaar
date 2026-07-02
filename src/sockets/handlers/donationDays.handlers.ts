import { Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAlertStore } from "@/src/store/alerts.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import logger from "@/src/utils/logger.utils";

export function registerDonationDayHandlers(
  socket: Socket,
  queryClient: QueryClient,
) {
  // ── JOURNÉE DE DON ANNULÉE (Pour le Donneur) ─────────────
  socket.on(
    "donation-day:cancelled",
    (data: { dayId: string; title: string; cancelReason: string }) => {
      logger.info("📅 Journée de don annulée via Socket :", data.dayId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      useAlertStore.getState().setInAppAlert({
        id: data.dayId,
        title: "📅 Collecte annulée",
        body: `"${data.title}" a été annulée. Raison : ${data.cancelReason}`,
        data: { dayId: data.dayId, type: "day_cancelled" },
        receivedAt: new Date(),
      });

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishedDaysAll });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myRegistrationsAll,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(data.dayId),
      });
    },
  );

  // ── JOURNÉE DE DON MODIFIÉE (Pour le Donneur) ────────────
  socket.on("donation-day:updated", (data: { dayId: string }) => {
    logger.info("✏️ Journée de don modifiée via Socket :", data.dayId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    useAlertStore.getState().setInAppAlert({
      id: `update-${data.dayId}`,
      title: "📅 Modification de collecte",
      body: "Les détails d'une journée à laquelle vous êtes inscrit ont changé.",
      data: { dayId: data.dayId, type: "day_updated" },
      receivedAt: new Date(),
    });

    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishedDaysAll });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myRegistrationsAll });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.donationDay(data.dayId),
    });
  });
}
