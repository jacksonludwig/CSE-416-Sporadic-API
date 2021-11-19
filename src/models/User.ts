import { ObjectId } from "mongodb";
import DbClient from "../utils/DbClient";

const COLLECTION = "users";

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
<<<<<<< HEAD
=======
};

type UserPublicJSON = {
  username: User["username"];
  _id: User["_id"];
  awards: User["awards"];
  friends: User["friends"];
  lastLogin: User["lastLogin"];
  aboutSection: User["aboutSection"];
>>>>>>> BUILD_5
};

export type User = {
  email: string;
  username: string;
  cognitoId: string;
<<<<<<< HEAD
=======
  aboutSection?: string;
>>>>>>> BUILD_5
  _id?: ObjectId;
  awards: Award[];
  isGloballyBanned: boolean;
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
  private lastLogin: User["lastLogin"];
<<<<<<< HEAD
  private profilePicture: User["profilePicture"];
  public notifications: User["notifications"];
  public friends: User["friends"];
  public subscriptions: User["subscriptions"];
=======
  public notifications: User["notifications"];
  public friends: User["friends"];
  public subscriptions: User["subscriptions"];
  public aboutSection: User["aboutSection"];
>>>>>>> BUILD_5

  constructor(user: User) {
    this.email = user.email;
    this.username = user.username;
    this.cognitoId = user.cognitoId;
    this._id = user._id;
    this.awards = user.awards;
    this.lastLogin = user.lastLogin;
    this.isGloballyBanned = user.isGloballyBanned;
    this.subscriptions = user.subscriptions;
    this.friends = user.friends;
    this.notifications = user.notifications;
<<<<<<< HEAD
=======
    this.aboutSection = user.aboutSection;
>>>>>>> BUILD_5
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
<<<<<<< HEAD
=======
      aboutSection: this.aboutSection,
>>>>>>> BUILD_5
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
<<<<<<< HEAD
=======
      aboutSection: this.aboutSection,
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
>>>>>>> BUILD_5
    };
  }

  public getUsername(): User["username"] {
    return this.username;
  }

  /**
   * Returns user with the given username.
   */
  public static async retrieveByUsername(username: string): Promise<UserModel | null> {
    const user = await DbClient.findOne<User>(COLLECTION, { username: username }, {});

    return user ? new UserModel(user) : null;
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
<<<<<<< HEAD
=======
        aboutSection: this.aboutSection,
>>>>>>> BUILD_5
      },
    );
  }
}
