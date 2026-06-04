import type { Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  ORGANIZER: "Organizer",
  CHECKER: "Checker",
  ATTENDEE: "Attendee",
};

export const ROLE_HOME_PATHS: Record<Role, string> = {
  ADMIN: "/admin/checkers",
  ORGANIZER: "/organizer/dashboard",
  CHECKER: "/check-in",
  ATTENDEE: "/",
};

export function getRoleHomePath(role?: Role | null): string {
  if (!role) {
    return "/";
  }

  return ROLE_HOME_PATHS[role] ?? "/";
}

export function getRoleLabel(role?: Role | null): string {
  if (!role) {
    return "Guest";
  }

  return ROLE_LABELS[role] ?? role;
}

export function isOperationalRole(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ORGANIZER" || role === "CHECKER";
}
