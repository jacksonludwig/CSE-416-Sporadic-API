declare namespace Sporadic {
  export const enum Permissions {
    Admin = 0,
    Owner = 1,
    Moderator = 2,
    Subscriber = 3,
    User = 4,
    Banned = 5,
  }

  export const enum UpdateAction {
    Add = "add",
    Remove = "remove",
  }
}
