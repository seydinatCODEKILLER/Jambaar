import { Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAlertStore } from "@/src/store/alerts.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { Alert } from "@/src/types/alert.types";
import logger from "@/src/utils/logger.utils";

export function registerAlertHandlers(
  socket: Socket,
  queryClient: QueryClient,
) {
  // ── NOUVELLE ALERTE (Pour les DONNEURS) ──────────────────
  socket.on("alert:new", (data: Alert) => {
    logger.info("🚨 Nouvelle alerte reçue via Socket :", data.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const { setInAppAlert, addAlert } = useAlertStore.getState();

    setInAppAlert({
      id: data.id,
      title:
        data.urgencyLevel === "VITAL"
          ? "🚨 URGENCE VITALE"
          : "🩸 Alerte donneur",
      body: `Groupe ${data.bloodType} requis — ${data.healthStructure?.name}`,
      data: { alertId: data.id, urgencyLevel: data.urgencyLevel },
      receivedAt: new Date(),
    });

    addAlert(data);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
  });

  // ── QUOTA ATTEINT ─────────────────────────────────────────
  socket.on("alert:quota_reached", (data: { alertId: string }) => {
    logger.info("🎯 Quota atteint pour l'alerte :", data.alertId);

    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alert(data.alertId) });
  });

  // ── ALERTE FERMÉE ─────────────────────────────────────────
  socket.on("alert:closed", (data: { alertId: string; status: string }) => {
    logger.info("🔒 Alerte fermée :", data.alertId);

    useAlertStore.getState().removeAlert(data.alertId);

    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alert(data.alertId) });
  });
}
