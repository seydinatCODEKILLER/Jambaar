import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import Constants from "expo-constants";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth.store";
import { useSocketStore } from "@/src/store/socket.store";
import { tokenManager } from "@/src/utils/token.utils";
import { refreshAccessToken } from "@/src/utils/refreshToken.util";
import { registerAllHandlers } from "@/src/sockets/registerHandlers";
import logger from "@/src/utils/logger.utils";

export const useSocket = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setSocket = useSocketStore((s) => s.setSocket);
  const setConnected = useSocketStore((s) => s.setConnected);

  const isConnecting = useRef(false);
  const hasRetriedAuth = useRef(false);

  const connect = useCallback(async () => {
    if (!user) return;

    const existing = useSocketStore.getState().socket;
    if (existing?.connected || isConnecting.current) return;

    const socketUrl = Constants.expoConfig?.extra?.socketUrl;
    if (!socketUrl) {
      logger.warn("SOCKET_URL non définie dans app.config.ts");
      return;
    }

    isConnecting.current = true;
    hasRetriedAuth.current = false;

    const socket = io(socketUrl, {
      auth: (cb) => {
        tokenManager.getAccessToken().then((token) => cb({ token }));
      },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    // ── Événements de connexion ──────────────────────────────

    socket.on("connect", () => {
      isConnecting.current = false;
      hasRetriedAuth.current = false;
      setConnected(true);
      logger.info("✅ Socket.io connecté");
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      logger.warn("🔌 Socket.io déconnecté :", reason);
    });

    socket.on("connect_error", async (err) => {
      isConnecting.current = false;
      logger.error("❌ Socket.io erreur de connexion :", err.message);

      // Codes renvoyés par le middleware d'auth socket.io du backend
      const isTokenError =
        err.message === "TOKEN_MISSING" || err.message === "TOKEN_INVALID";
      const isFatalAuthError =
        err.message === "USER_NOT_FOUND" || err.message === "ACCOUNT_SUSPENDED";

      // Session définitivement morte : inutile de retenter, on déconnecte l'utilisateur
      if (isFatalAuthError) {
        tokenManager.logout(
          "Votre session n'est plus valide. Veuillez vous reconnecter.",
        );
        return;
      }

      if (isTokenError && !hasRetriedAuth.current) {
        hasRetriedAuth.current = true;
        try {
          await refreshAccessToken();
          socket.disconnect();
          connect();
        } catch {
          // refreshAccessToken() a déjà appelé tokenManager.logout()
        }
      }
    });

    // ── Handlers métier (alertes, dons, badges, etc.) ────────
    registerAllHandlers(socket, queryClient);

    setSocket(socket);
  }, [user?.id, queryClient, setSocket, setConnected]);

  const disconnect = useCallback(() => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      isConnecting.current = false;
      logger.info("🔌 Socket.io déconnecté manuellement");
    }
  }, [setSocket, setConnected]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { disconnect };
};
