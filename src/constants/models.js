// aliases
export const ROLES_ALIAS = "roles";
export const ROLE_MEMBERS_ALIAS = "members";
export const PERMISSIONS_ALIAS = "permissions";

// foreign keys
export const USER_ROLE_FOREIGN_KEY = "roleId";

// join tables
export const USER_ROLES_JOIN_TABLE = "UserRoles";
export const ROLE_PERMISSIONS_JOIN_TABLE = "RolePermissions";

export const ACCOUNT_STATUS = {
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
  LOCKED: "LOCKED",
  PROVISIONED: "PROVISIONED",
  RECOVERY: "RECOVERY",
  DEACTIVATED: "DEACTIVATED",
  ACTIVE: "ACTIVE",
};
