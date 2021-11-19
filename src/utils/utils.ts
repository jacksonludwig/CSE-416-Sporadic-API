import PlatformModel from "../models/Platform";
import UserModel from "../models/User";

export enum Permissions {
  Admin = 0,
  Owner = 1,
  Moderator = 2,
  Subscriber = 3,
  User = 4,
  Banned = 5,
}

/**
 * Check what permissions the user has in a platform
 */
export const checkPermissions = (user: UserModel, platform: PlatformModel): Permissions => {
  if (user.getIsGlobalAdmin()) return Permissions.Admin;

  if (platform.bannedUsers.includes(user.getUsername())) return Permissions.Banned;

  if (platform.getOwner() === user.getUsername()) return Permissions.Owner;

  if (platform.moderators.includes(user.getUsername())) return Permissions.Moderator;

  if (platform.subscribers.includes(user.getUsername())) return Permissions.Subscriber;

  return Permissions.User;
};
