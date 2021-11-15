import { ObjectId } from "mongodb";
import DbClient from "../utils/DbClient";

const COLLECTION = "platforms";

export type Platform = {
  title: string;
  owner: string;
  description: string;
  bannedUsers: string[];
  subscribers: string[];
  moderators: string[];
  quizzes: string[];
  _id?: ObjectId;
};

export default class PlatformModel {
  private title: Platform["title"];
  private owner: Platform["owner"];
  private description: Platform["description"];
  private bannedUsers: Platform["bannedUsers"];
  private _id: Platform["_id"];
  public moderators: Platform["moderators"];
  public quizzes: Platform["quizzes"];
  public subscribers: Platform["subscribers"];

  constructor(platform: Platform) {
    this._id = platform._id;
    this.title = platform.title.toLowerCase();
    this.owner = platform.owner;
    this.description = platform.description;
    this.subscribers = platform.subscribers;
    this.moderators = platform.moderators;
    this.quizzes = platform.quizzes;
    this.bannedUsers = platform.bannedUsers;
  }

  public getOwner(): Platform["owner"] {
    return this.owner;
  }

  public async save(): Promise<string> {
    return DbClient.insertOne(COLLECTION, {
      _id: this._id,
      title: this.title,
      owner: this.owner,
      description: this.description,
      subscribers: this.subscribers,
      moderators: this.moderators,
      quizzes: this.quizzes,
      bannedUsers: this.bannedUsers,
    });
  }

  public toJSON(): Platform {
    return {
      _id: this._id,
      title: this.title,
      owner: this.owner,
      description: this.description,
      subscribers: this.subscribers,
      moderators: this.moderators,
      quizzes: this.quizzes,
      bannedUsers: this.bannedUsers,
    };
  }

  /**
   * Returns platform with the given title.
   */
  public static async retrieveByTitle(title: string): Promise<PlatformModel | null> {
    const platform = await DbClient.findOne<Platform>(
      COLLECTION,
      { title: title.toLowerCase() },
      {},
    );

    return platform ? new PlatformModel(platform) : null;
  }

  /**
   * Update mutable fields of the platform in the database.
   */
  public async update(): Promise<void> {
    await DbClient.updateOne<Platform>(
      COLLECTION,
      { title: this.title },
      {
        description: this.description,
        subscribers: this.subscribers,
        moderators: this.moderators,
        quizzes: this.quizzes,
        bannedUsers: this.bannedUsers,
      },
    );
  }
}
