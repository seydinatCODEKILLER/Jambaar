import { Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import { registerAlertHandlers } from "./handlers/alerts.handlers";
import { registerDonationHandlers } from "./handlers/donations.handlers";
import { registerBadgeHandlers } from "./handlers/badges.handlers";
import { registerDonationDayHandlers } from "./handlers/donationDays.handlers";
import { registerRegistrationHandlers } from "./handlers/registrations.handlers";

export function registerAllHandlers(socket: Socket, queryClient: QueryClient) {
  registerAlertHandlers(socket, queryClient);
  registerDonationHandlers(socket, queryClient);
  registerBadgeHandlers(socket, queryClient);
  registerDonationDayHandlers(socket, queryClient);
  registerRegistrationHandlers(socket, queryClient);
}
