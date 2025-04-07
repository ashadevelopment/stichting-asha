export type Role =
  | "beheerder"
  | "developer"
  | "vrijwilliger"
  | "stagiaire"
  | "gebruiker";

export const RolePermissions: Record<Role, string[]> = {
  beheerder: [
    "manage_roles",
    "manage_blogs",
    "manage_events",
    "manage_contacts",
    "approve_volunteers",
    "comment",
  ],
  developer: [
    "manage_blogs",
    "manage_events",
    "manage_contacts",
  ],
  vrijwilliger: [
    "volunteer_event",
    "comment",
  ],
  stagiaire: [
    "volunteer_event",
    "comment",
    // You can add more permissions as needed
  ],
  gebruiker: [
    "comment",
  ],
};
