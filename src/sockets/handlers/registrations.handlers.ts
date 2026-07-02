import { Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAlertStore } from "@/src/store/alerts.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import logger from "@/src/utils/logger.utils";

export function registerRegistrationHandlers(
  socket: Socket,
  queryClient: QueryClient,
) {
  // ── STATUT INSCRIPTION MIS À JOUR ─────────────────────────
  socket.on(
    "registration:status-updated",
    (data: { dayId: string; status: string }) => {
      logger.info("✅ Statut inscription mis à jour via Socket :", data.status);

      if (data.status === "ATTENDED") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        useAlertStore.getState().setInAppAlert({
          id: `reg-${data.dayId}`,
          title: "✅ Présence confirmée",
          body: "Votre présence à la collecte a été validée par l'équipe médicale.",
          data: { dayId: data.dayId, type: "registration_updated" },
          receivedAt: new Date(),
        });
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myRegistrationsAll,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(data.dayId),
      });
    },
  );
}
