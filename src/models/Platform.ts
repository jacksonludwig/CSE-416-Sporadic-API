import DbClient from "../utils/DbClient";

const COLLECTION = "platforms";

export type Platform = {
  title: string;
  owner: string;
  bannedUsers?: string[];
  subscribers?: string[];
  moderators?: string[];
  quizzes?: string[];
  _id?: string;
};

export default class PlatformModel {
  private title: Platform["title"];
  private owner: Platform["owner"];
  private bannedUsers: Platform["bannedUsers"];
  private _id: Platform["_id"];
  private subscribers: Platform["subscribers"];
  private moderators: Platform["moderators"];
  private quizzes: Platform["quizzes"];

  constructor(platform: Platform) {
    this._id = platform._id;
    this.title = platform.title;
    this.owner = platform.owner;
    this.subscribers = platform.subscribers;
    this.moderators = platform.moderators;
    this.quizzes = platform.quizzes;
    this.bannedUsers = platform.bannedUsers;
  }

  public async save(): Promise<string> {
    return DbClient.insertOne(COLLECTION, {
      _id: this._id,
      title: this.title,
      owner: this.owner,
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
    const platform = await DbClient.findOne<Platform>(COLLECTION, { title: title }, {});

    return platform ? new PlatformModel(platform) : null;
  }
}