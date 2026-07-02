import axios from "axios";
import { API_CONFIG } from "@/src/config/api.config";
import { tokenManager } from "@/src/utils/token.utils";

const rawClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Rafraîchit l'access token. Point d'entrée unique, partagé entre
 * l'intercepteur Axios (api.client.ts) et le socket (useSocket.ts),
 * pour ne jamais dupliquer la logique de rotation des tokens.
 *
 * Si un refresh est déjà en cours (ex: déclenché par une requête HTTP
 * en parallèle), on s'abonne au résultat au lieu d'en déclencher un second.
 */
export async function refreshAccessToken(): Promise<string> {
  if (tokenManager.isRefreshing) {
    return new Promise((resolve) => {
      tokenManager.subscribeTokenRefresh((newToken) => resolve(newToken));
    });
  }

  tokenManager.isRefreshing = true;

  try {
    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("Pas de refresh token disponible");
    }

    console.log("🔄 Tentative de rotation du refresh token...");

    const response = await rawClient.post("/auth/refresh", { refreshToken });

    const newAccessToken: string = response.data.accessToken;
    const newRefreshToken: string = response.data.refreshToken;

    await tokenManager.saveTokens(newAccessToken, newRefreshToken);

    console.log("✅ Tokens rotatés et sauvegardés");

    tokenManager.onTokenRefreshed(newAccessToken);
    return newAccessToken;
  } catch (err) {
    console.error("❌ Rotation du refresh token échouée:", err);
    tokenManager.onRefreshFailed();
    await tokenManager.clearTokens();
    tokenManager.logout("Session expirée. Veuillez vous reconnecter.");
    throw err;
  } finally {
    tokenManager.isRefreshing = false;
  }
}
