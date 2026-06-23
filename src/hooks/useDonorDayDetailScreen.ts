import { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useDayDetail,
  useRegisterDonor,
  useCancelDonorRegistration,
  useMyRegistrations,
} from "@/src/hooks/useDonationDays";
import { useIsEligible } from "@/src/hooks/useAuthStore";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { isNetworkError } from "@/src/utils/error.utils";

export function useDonorDayDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: myRegistrationsData } = useMyRegistrations();

  const hasActiveRegistration = (myRegistrationsData?.data ?? []).some(
    (reg: any) => reg.donationDay?.id !== id,
  );

  const { data: day, isLoading, isError, error, refetch } = useDayDetail(id);
  const { mutateAsync: register, isPending: isRegistering } =
    useRegisterDonor();
  const { mutateAsync: cancelReg, isPending: isCancelling } =
    useCancelDonorRegistration();

  const { isEligible, daysLeft } = useIsEligible();
  const [isRegistered, setIsRegistered] = useState(false);

  const goBack = useSmartBack({
    defaultRoute: "/(donor)/donation-days",
    routeMap: {
      home: "/(donor)",
      jambaar: "/(donor)/jambaar",
      registrations: "/(donor)/donation-days/my-registrations",
      donationDays: "/(donor)/donation-days",
    },
  });

  // ── Actions ──
  const handleRegister = async () => {
    try {
      await register(id);
      setIsRegistered(true);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Impossible de s'inscrire pour le moment.";
      Alert.alert("Inscription impossible", msg);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Annuler mon inscription",
      "Êtes-vous sûr ? Cette action est irréversible si l'événement a lieu dans moins de 24h.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReg(id);
              setIsRegistered(false);
            } catch (error: any) {
              const msg =
                error?.response?.data?.message || "Annulation impossible.";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ],
    );
  };

  // ── Dérivés ──
  const hasNetworkError = isError && !day && isNetworkError(error);
  const registrationsCount = day?._count?.registrations ?? 0;
  const remainingSpots = day
    ? Math.max(0, day.targetDonors - registrationsCount)
    : 0;
  const isFull = remainingSpots === 0;

  return {
    id,
    day,
    isLoading,
    isError,
    hasNetworkError,
    error,
    refetch,
    goBack,
    isEligible,
    daysLeft,
    hasActiveRegistration,
    isRegistered,
    isRegistering,
    isCancelling,
    isFull,
    registrationsCount,
    remainingSpots,
    handleRegister,
    handleCancel,
  };
}
