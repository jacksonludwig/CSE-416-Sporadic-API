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
};

export type User = {
  email: string;
  username: string;
  cognitoId: string;
  _id?: string;
  awards: Award[];
  isGloballyBanned: boolean;
  lastLogin?: Date;
  profilePicture?: string;
  subscriptions: string[];
  friends: string[];
  notifications: Notification[];
  quizzesTaken: string[];
};

export default class UserModel {
  private email: User["email"];
  private username: User["username"];
  private cognitoId: User["cognitoId"];
  private _id: User["_id"];
  private awards: User["awards"];
  private isGloballyBanned: User["isGloballyBanned"];
  private lastLogin: User["lastLogin"];
  private profilePicture: User["profilePicture"];
  private friends: User["friends"];
  private notifications: User["notifications"];
  public subscriptions: User["subscriptions"];
  public quizzesTaken: User["quizzesTaken"];

  constructor(user: User) {
    this.email = user.email;
    this.username = user.username;
    this.cognitoId = user.cognitoId;
    this._id = user._id;
    this.awards = user.awards;
    this.lastLogin = user.lastLogin;
    this.isGloballyBanned = user.isGloballyBanned;
    this.profilePicture = user.profilePicture;
    this.subscriptions = user.subscriptions;
    this.friends = user.friends;
    this.notifications = user.notifications;
    this.quizzesTaken = user.quizzesTaken;
  }

  public async save(): Promise<string> {
    return DbClient.insertOne(COLLECTION, {
      username: this.username,
      email: this.email,
      cognitoId: this.cognitoId,
      _id: this._id,
      awards: this.awards,
      isGloballyBanned: this.isGloballyBanned,
      profilePicture: this.profilePicture,
      subscriptions: this.subscriptions,
      friends: this.friends,
      notifications: this.notifications,
      lastLogin: this.lastLogin,
      quizzesTaken: this.quizzesTaken,
    });
  }

  public toJSON(): User {
    return {
      username: this.username,
      email: this.email,
      cognitoId: this.cognitoId,
      _id: this._id,
      awards: this.awards,
      isGloballyBanned: this.isGloballyBanned,
      profilePicture: this.profilePicture,
      subscriptions: this.subscriptions,
      friends: this.friends,
      notifications: this.notifications,
      lastLogin: this.lastLogin,
      quizzesTaken: this.quizzesTaken,
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
        profilePicture: this.profilePicture,
        subscriptions: this.subscriptions,
        friends: this.friends,
        notifications: this.notifications,
        lastLogin: this.lastLogin,
        quizzesTaken: this.quizzesTaken,
      },
    );
  }
}
