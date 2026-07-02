import { Socket } from "socket.io-client";
import * as Haptics from "expo-haptics";
import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth.store";
import { useAlertStore } from "@/src/store/alerts.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { clearPendingQr } from "@/src/utils/qr.utils";
import logger from "@/src/utils/logger.utils";

export function registerDonationHandlers(
  socket: Socket,
  queryClient: QueryClient,
) {
  socket.on("donation:validated", (data: any) => {
    logger.info("🎉 Don validé, points crédités :", data.pointsAwarded);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    clearPendingQr().catch((err) =>
      logger.warn("Erreur nettoyage QR local", err),
    );

    const { user, updateUser } = useAuthStore.getState();
    if (user?.jambaarsProfile) {
      updateUser({
        jambaarsProfile: {
          ...user.jambaarsProfile,
          totalPoints:
            data.totalPoints ??
            user.jambaarsProfile.totalPoints + data.pointsAwarded,
          donationCount: user.jambaarsProfile.donationCount + 1,
          currentGrade: data.newGrade ?? user.jambaarsProfile.currentGrade,
          nextEligibilityAt:
            data.nextEligibilityAt ?? user.jambaarsProfile.nextEligibilityAt,
          lastDonationAt: new Date().toISOString(),
          livesSavedEstimate: user.jambaarsProfile.livesSavedEstimate + 3,
        },
      });
    }

    [
      QUERY_KEYS.me,
      QUERY_KEYS.activeEngagement,
      QUERY_KEYS.hasActiveConfirmation,
      QUERY_KEYS.nearbyAlerts,
      QUERY_KEYS.myDonations,
      QUERY_KEYS.jambaarsProfile,
      QUERY_KEYS.leaderboard,
      QUERY_KEYS.jambaarssBadges,
    ].forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

    useAlertStore.getState().setJambaarCelebration({
      pointsEarned: data.pointsAwarded,
      message: data.gradeChanged
        ? `Nouveau grade : ${data.newGrade} !`
        : "Votre don a été validé !",
    });
  });
}
