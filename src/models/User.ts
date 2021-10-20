import DbClient from "../utils/DbClient";

const COLLECTION = "users";

export type User = {
  email: string;
  username: string;
  cognitoId: string;
};

export default class UserModel {
  private email: User["email"];
  private username: User["username"];
  private cognitoId: User["cognitoId"];

  constructor(user: User) {
    this.email = user.email;
    this.username = user.username;
    this.cognitoId = user.cognitoId;
  }

  public async save(): Promise<void> {
    DbClient.insertOne(COLLECTION, {
      username: this.username,
      email: this.email,
      cognitoId: this.cognitoId,
      lastLogin: new Date().toISOString(),
    });
  }
}
