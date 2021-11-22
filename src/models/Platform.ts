import { ObjectId } from "mongodb";
import DbClient from "../utils/DbClient";

const COLLECTION = "platforms";

type Score = {
  username: string;
  totalCorrect: number;
};

export type Platform = {
  title: string;
  owner: string;
  description: string;
  bannedUsers: string[];
  subscribers: string[];
  moderators: string[];
  quizzes: string[];
  _id?: ObjectId;
  scores: Score[];
};

export default class PlatformModel {
  private title: Platform["title"];
  private owner: Platform["owner"];
  private description: Platform["description"];
  private _id: Platform["_id"];
  public bannedUsers: Platform["bannedUsers"];
  public moderators: Platform["moderators"];
  public quizzes: Platform["quizzes"];
  public subscribers: Platform["subscribers"];
  public scores: Platform["scores"];

  constructor(platform: Platform) {
    this._id = platform._id;
    this.title = platform.title.toLowerCase();
    this.owner = platform.owner;
    this.description = platform.description;
    this.subscribers = platform.subscribers;
    this.moderators = platform.moderators;
    this.quizzes = platform.quizzes;
    this.bannedUsers = platform.bannedUsers;
    this.scores = platform.scores;
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
      scores: this.scores,
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
      scores: this.scores,
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

  public static async searchByTitle(
    searchString: string,
    skip?: number,
    limit?: number,
  ): Promise<{ totalItems: number; items: Platform[] }> {
    skip = skip || 0;
    limit = limit || 100;
    return await DbClient.aggregate(
      COLLECTION,
      [
        {
          $search: {
            index: "platform_title",
            text: {
              query: searchString,
              fuzzy: {
                maxEdits: 2,
              },
              path: "title",
            },
          },
        },
      ],
      {},
      skip,
      limit,
    );
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
        scores: this.scores,
      },
    );
  }
}
