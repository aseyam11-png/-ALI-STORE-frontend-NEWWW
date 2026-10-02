export type AppRole = "CUSTOMER" | "ADMIN";

export function hasRole(roles: readonly string[], role: AppRole): boolean {
  return roles.includes(role);
}
