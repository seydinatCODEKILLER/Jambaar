import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/src/api/users.api";
import { useAuthStore } from "@/src/store/auth.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import Toast from "react-native-toast-message";

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      usersApi.updateAvailability(isAvailable),

    // ── 1. AVANT la requête (Optimisme) ──────────────────
    onMutate: async (newAvailability) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.me });
      const previousUser = user;

      if (user) {
        await updateUser({ isAvailable: newAvailability });
      }

      return { previousUser };
    },

    // ── 2. SI ÇA RÉUSSIT ──────────────────────────────────
    onSuccess: (data) => {
      if (data?.isAvailable !== undefined) {
        updateUser({ isAvailable: data.isAvailable });
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    },

    // ── 3. SI ÇA ÉCHOUE (Rollback) ───────────────────────
    onError: (error, newAvailability, context) => {
      if (context?.previousUser) {
        updateUser(context.previousUser);
      }

      Toast.show({
        type: "error",
        text1: "Mise à jour impossible",
        text2: "Vérifiez votre connexion et réessayez.",
      });
    },

    // ── 4. TOUJOURS À LA FIN ──────────────────────────────
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
};
