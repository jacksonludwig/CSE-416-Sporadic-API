import { ObjectId } from "mongodb";
import DbClient from "../utils/DbClient";
import PlatformModel from "./Platform";

const COLLECTION = "users";

const PROJECTION = {
  email: 0,
  cognitoId: 0,
  isGloballyBanned: 0,
  isGlobalAdmin: 0,
  subscriptions: 0,
  notifications: 0,
};

type Award = {
  title: string;
  description: string;
  quiz: string;
  isShowcased: boolean;
};

type Notification = {
  title: string;
  body: string;
  hasBeenViewed: boolean;
};

type UserPublicJSON = {
  username: User["username"];
  _id: User["_id"];
  awards: User["awards"];
  friends: User["friends"];
  lastLogin: User["lastLogin"];
  aboutSection: User["aboutSection"];
};

export type User = {
  email: string;
  username: string;
  cognitoId: string;
  aboutSection?: string;
  _id?: ObjectId;
  awards: Award[];
  isGloballyBanned: boolean;
  isGlobalAdmin: boolean;
  lastLogin?: Date;
  subscriptions: string[];
  friends: string[];
  notifications: Notification[];
};

export default class UserModel {
  private email: User["email"];
  private username: User["username"];
  private cognitoId: User["cognitoId"];
  private _id: User["_id"];
  private awards: User["awards"];
  private isGloballyBanned: User["isGloballyBanned"];
  private isGlobalAdmin: User["isGlobalAdmin"];
  private lastLogin: User["lastLogin"];
  public notifications: User["notifications"];
  public friends: User["friends"];
  public subscriptions: User["subscriptions"];
  public aboutSection: User["aboutSection"];

  constructor(user: User) {
    this.email = user.email;
    this.username = user.username;
    this.cognitoId = user.cognitoId;
    this._id = user._id;
    this.awards = user.awards;
    this.lastLogin = user.lastLogin;
    this.isGloballyBanned = user.isGloballyBanned;
    this.isGlobalAdmin = user.isGlobalAdmin;
    this.subscriptions = user.subscriptions;
    this.friends = user.friends;
    this.notifications = user.notifications;
    this.aboutSection = user.aboutSection;
  }

  public async save(): Promise<string> {
    return DbClient.insertOne(COLLECTION, {
      username: this.username,
      email: this.email,
      cognitoId: this.cognitoId,
      _id: this._id,
      awards: this.awards,
      isGloballyBanned: this.isGloballyBanned,
      subscriptions: this.subscriptions,
      friends: this.friends,
      notifications: this.notifications,
      lastLogin: this.lastLogin,
      aboutSection: this.aboutSection,
    });
  }

  public toJSONWithPrivateData(): User {
    return {
      username: this.username,
      email: this.email,
      cognitoId: this.cognitoId,
      _id: this._id,
      awards: this.awards,
      isGloballyBanned: this.isGloballyBanned,
      subscriptions: this.subscriptions,
      friends: this.friends,
      notifications: this.notifications,
      lastLogin: this.lastLogin,
      aboutSection: this.aboutSection,
      isGlobalAdmin: this.isGlobalAdmin,
    };
  }

  public toJSON(): UserPublicJSON {
    return {
      username: this.username,
      _id: this._id,
      awards: this.awards,
      friends: this.friends,
      lastLogin: this.lastLogin,
      aboutSection: this.aboutSection,
    };
  }

  public getUsername(): User["username"] {
    return this.username;
  }

  public getIsGlobalAdmin(): User["isGlobalAdmin"] {
    return this.isGlobalAdmin;
  }

  /**
   * Returns user with the given username.
   */
  public static async retrieveByUsername(username: string): Promise<UserModel | null> {
    const user = await DbClient.findOne<User>(COLLECTION, { username: username }, {});

    return user ? new UserModel(user) : null;
  }

  /**
   * Fuzzy search for users by username
   */
  public static async searchByUsername(
    searchString: string,
    skip?: number,
    limit?: number,
  ): Promise<{ totalItems: number; items: UserPublicJSON[] }> {
    skip = skip || 0;
    limit = limit || 100;
    return await DbClient.aggregate(
      COLLECTION,
      [
        {
          $search: {
            index: "user_username",
            wildcard: {
              query: `*${searchString}*`,
              allowAnalyzedField: true,
              path: "username",
            },
          },
        },
        {
          $project: PROJECTION,
        },
      ],
      {},
      skip,
      limit,
    );
  }

  /**
   * Check what permissions the user has in a given platform.
   */
  public permissionsOn(platform: PlatformModel): Sporadic.Permissions {
    if (this.isGlobalAdmin) return Sporadic.Permissions.Admin;

    if (platform.bannedUsers.includes(this.username)) return Sporadic.Permissions.Banned;

    if (platform.getOwner() === this.username) return Sporadic.Permissions.Owner;

    if (platform.moderators.includes(this.username)) return Sporadic.Permissions.Moderator;

    if (platform.subscribers.includes(this.username)) return Sporadic.Permissions.Subscriber;

    return Sporadic.Permissions.User;
  }

  /**
   * Update mutable fields of the user in the database.
   */
  public async update(): Promise<void> {
    await DbClient.updateOne<User>(
      COLLECTION,
      { username: this.username },
      {
        awards: this.awards,
        isGloballyBanned: this.isGloballyBanned,
        subscriptions: this.subscriptions,
        friends: this.friends,
        notifications: this.notifications,
        lastLogin: this.lastLogin,
        aboutSection: this.aboutSection,
      },
    );
  }
}
