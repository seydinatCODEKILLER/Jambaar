export const QUERY_KEYS = {
  // Auth
  me: ["me"] as const,

  // Alerts
  alerts: ["alerts"] as const,
  nearbyAlerts: ["alerts", "nearby"] as const,
  hasActiveConfirmation: ["alerts", "has-active-confirmation"] as const,
  alert: (id: string) => ["alerts", id] as const,
  activeEngagement: ["alerts", "engagement"] as const,

  // Donations
  myDonations: ["donations", "me"] as const,
  donation: (id: string) => ["donations", id] as const,

  // Donation Days (Journées de don)
  donationDays: ["donation-days"] as const,

  // et les versions paramétrées uniquement pour le fetch avec des filters stables.
  publishedDaysAll: ["donation-days", "published"] as const,
  publishedDays: (filters?: object) =>
    ["donation-days", "published", filters] as const,

  donationDay: (id: string) => ["donation-days", id] as const,

  myRegistrationsAll: ["donation-days", "my-registrations"] as const,
  myRegistrations: (filters?: object) =>
    ["donation-days", "my-registrations", filters] as const,

  // Jambaar
  jambaarsProfile: ["jambaar", "me"] as const,
  jambaarssBadges: ["jambaar", "me", "badges"] as const,
  leaderboard: ["jambaar", "leaderboard"] as const,
  leaderboardCity: (city: string) =>
    ["jambaar", "leaderboard", "city", city] as const,
  leaderboardDistrict: (district: string) =>
    ["jambaar", "leaderboard", "district", district] as const,

  // Rewards & Coupons
  rewards: ["rewards"] as const,
  myCoupons: ["coupons", "me"] as const,

  // Notifications
  myNotifications: ["notifications", "me"] as const,
} as const;