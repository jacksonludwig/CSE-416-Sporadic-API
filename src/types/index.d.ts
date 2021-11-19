export {};

declare global {
  export namespace Sporadic {
    export enum Permissions {
      Admin = 0,
      Owner = 1,
      Moderator = 2,
      Subscriber = 3,
      User = 4,
      Banned = 5,
    }

    export enum UpdateAction {
      Add = "add",
      Remove = "remove",
    }
  }
}
