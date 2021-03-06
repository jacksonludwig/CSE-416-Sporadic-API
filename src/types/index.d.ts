declare namespace Sporadic {
  export const enum Permissions {
    Admin = 5,
    Owner = 4,
    Moderator = 3,
    Subscriber = 2,
    User = 1,
    Banned = 0,
    GloballyBanned = -1,
  }

  export const enum UpdateAction {
    Add = "add",
    Remove = "remove",
  }

  export const enum Vote {
    Upvote = "upvote",
    Downvote = "downvote",
    None = "none",
  }

  export const enum BanAction {
    Ban = "ban",
    Unban = "unban",
  }
}
