import { FindOptions, ObjectId, SortDirection } from "mongodb";
import DbClient from "../utils/DbClient";

const COLLECTION = "quizzes";

const PROJECTION = {
  questions: 0,
  correctAnswers: 0,
  scores: 0,
};

export type QuizFilter = {
  platform?: string;
};

export type Question = {
  body: string;
  answers: string[];
};

export type Score = {
  user: string;
  score?: number;
  timeStarted: Date;
  vote: Sporadic.Vote;
};

export type Comment = {
  user: string;
  text: string;
  date: Date;
};

export type Award = {
  name: string;
  threshold: number;
};

export type QuizJSON = {
  title: Quiz["title"];
  platform: Quiz["platform"];
  timeLimit: Quiz["timeLimit"];
  upvotes: Quiz["upvotes"];
  downvotes: Quiz["downvotes"];
  description: Quiz["description"];
  comments: Quiz["comments"];
  award: Quiz["award"];
  _id?: string;
};

export type Quiz = {
  title: string;
  platform: string;
  timeLimit: number;
  upvotes: number;
  downvotes: number;
  description: string;
  questions: Question[];
  correctAnswers: number[];
  scores: Score[];
  comments: Comment[];
  award: Award;
  _id?: ObjectId;
};

export default class QuizModel {
  private platform: Quiz["platform"];
  private timeLimit: Quiz["timeLimit"];
  private description: Quiz["description"];
  private _id: Quiz["_id"];
  public title: Quiz["title"];
  public questions: Quiz["questions"];
  public correctAnswers: Quiz["correctAnswers"];
  public scores: Quiz["scores"];
  public comments: Quiz["comments"];
  public upvotes: Quiz["upvotes"];
  public downvotes: Quiz["downvotes"];
  public award: Quiz["award"];

  constructor(quiz: Quiz) {
    this._id = quiz._id;
    this.title = quiz.title;
    this.platform = quiz.platform.toLowerCase();
    this.timeLimit = quiz.timeLimit;
    this.upvotes = quiz.upvotes;
    this.downvotes = quiz.downvotes;
    this.description = quiz.description;
    this.questions = quiz.questions;
    this.correctAnswers = quiz.correctAnswers;
    this.scores = quiz.scores;
    this.comments = quiz.comments;
    this.award = quiz.award;
  }

  public async save(): Promise<string> {
    return DbClient.insertOne(COLLECTION, {
      _id: this._id,
      title: this.title,
      platform: this.platform,
      timeLimit: this.timeLimit,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      description: this.description,
      questions: this.questions,
      correctAnswers: this.correctAnswers,
      scores: this.scores,
      comments: this.comments,
      award: this.award,
    });
  }

  public toJSON(): QuizJSON {
    return {
      title: this.title,
      platform: this.platform,
      timeLimit: this.timeLimit,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      description: this.description,
      comments: this.comments,
      _id: this._id?.toString(),
      award: this.award,
    };
  }

  public toJSONWithQuestions(): QuizJSON & { questions: Quiz["questions"] } {
    return {
      title: this.title,
      platform: this.platform,
      timeLimit: this.timeLimit,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      description: this.description,
      comments: this.comments,
      questions: this.questions,
      _id: this._id?.toString(),
      award: this.award,
    };
  }

  public getId(): Quiz["_id"] {
    return this._id;
  }

  public getPlatform(): Quiz["platform"] {
    return this.platform;
  }

  public getTimeLimit(): Quiz["timeLimit"] {
    return this.timeLimit;
  }

  /**
   * Returns quiz with the given title.
   */
  public static async retrieveByTitle(
    platform: string,
    quizTitle: string,
  ): Promise<QuizModel | null> {
    const quiz = await DbClient.findOne<Quiz>(
      COLLECTION,
      { title: quizTitle, platform: platform.toLowerCase() },
      {},
    );
    return quiz ? new QuizModel(quiz) : null;
  }

  /**
   * Deletes the quiz from the database.
   */
  public async delete(): Promise<void> {
    await DbClient.deleteOne<Quiz>(
      COLLECTION,
      { title: this.title, platform: this.platform.toLowerCase() },
      {},
    );
  }

  /**
   * Retrieve all quizzes matching the given parameters.
   *
   * @param filter The fields to filter with
   * @param sortBy The field and direction to sort with
   * @param skip The amount of results to skip
   * @param limit The max amount of results to return
   */
  public static async retrieveAll(
    filter: QuizFilter = {},
    sortBy: { field?: string; direction?: SortDirection } = {},
    skip = 0,
    limit = 100,
  ): Promise<{ totalItems: number; items: QuizJSON[] }> {
    const quizFilter: QuizFilter = {};
    const findOpts: FindOptions = {};

    if (filter.platform) quizFilter.platform = filter.platform.toLowerCase();

    findOpts.sort = [[sortBy.field || "title", sortBy.direction || 1]];
    findOpts.projection = PROJECTION;

    return await DbClient.find<QuizJSON>(COLLECTION, quizFilter, findOpts, skip, limit);
  }

  /**
   * retrieve quizzes for feed function
   * have find from dbclient in here
   */
  public static async retrieveFeed(
    subscriptions: string[],
    sortBy: { field?: string; direction?: SortDirection } = {},
    skip = 0,
    limit = 100,
  ): Promise<{ totalItems: number; items: QuizJSON[] }> {
    const findOpts: FindOptions = {};
    const feedFilter = {
      platform: { $in: subscriptions },
    };

    findOpts.sort = [[sortBy.field || "title", sortBy.direction || 1]];
    findOpts.projection = PROJECTION;

    return await DbClient.find<QuizJSON>(COLLECTION, feedFilter, findOpts, skip, limit);
  }

  /**
   * Fuzzy search for quizzes by title
   */
  public static async searchByTitle(
    searchString: string,
    skip?: number,
    limit?: number,
  ): Promise<{ totalItems: number; items: QuizJSON[] }> {
    skip = skip || 0;
    limit = limit || 100;
    return await DbClient.aggregate(
      COLLECTION,
      [
        {
          $search: {
            index: "quiz_title",
            wildcard: {
              query: `*${searchString}*`,
              allowAnalyzedField: true,
              path: "title",
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
   * Update mutable fields of the quiz in the database.
   */
  public async update(): Promise<void> {
    await DbClient.updateOne<Quiz>(
      COLLECTION,
      { title: this.title, platform: this.platform },
      {
        timeLimit: this.timeLimit,
        upvotes: this.upvotes,
        downvotes: this.downvotes,
        description: this.description,
        questions: this.questions,
        correctAnswers: this.correctAnswers,
        scores: this.scores,
        comments: this.comments,
      },
    );
  }
}
