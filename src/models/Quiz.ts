import DbClient from "../utils/DbClient";

const COLLECTION = "quizzes";

export type QuizFilter = {
  platform?: string;
};

export type Answer = {
  text: string;
  isCorrect: boolean;
};

export type Question = {
  body: string;
  answers: Answer[];
};

export type Score = {
  user: string;
  score: number;
  timeSubmitted: Date;
};

export type Comment = {
  user: string;
  text: string;
  date: Date;
};

export type Quiz = {
  title: string;
  platform: string;
  isTimed: boolean;
  timeLimit: number;
  upvotes: number;
  downvotes: number;
  description: string;
  questions?: Question[];
  scores?: Score[];
  comments?: Comment[];
  _id?: string;
};

export default class QuizModel {
  private title: Quiz["title"];
  private platform: Quiz["platform"];
  private isTimed: Quiz["isTimed"];
  private timeLimit: Quiz["timeLimit"];
  private upvotes: Quiz["upvotes"];
  private downvotes: Quiz["downvotes"];
  private description: Quiz["description"];
  private questions: Quiz["questions"];
  private scores: Quiz["scores"];
  private comments: Quiz["comments"];
  private _id: Quiz["_id"];

  constructor(quiz: Quiz) {
    this._id = quiz._id;
    this.title = quiz.title;
    this.platform = quiz.platform.toLowerCase();
    this.isTimed = quiz.isTimed;
    this.timeLimit = quiz.timeLimit;
    this.upvotes = quiz.upvotes;
    this.downvotes = quiz.downvotes;
    this.description = quiz.description;
    this.questions = quiz.questions;
    this.scores = quiz.scores;
    this.comments = quiz.comments;
  }

  public async save(): Promise<string> {
    return DbClient.insertOne(COLLECTION, {
      _id: this._id,
      title: this.title,
      platform: this.platform,
      isTimed: this.isTimed,
      timeLimit: this.timeLimit,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      description: this.description,
      questions: this.questions,
      scores: this.scores,
      comments: this.comments,
    });
  }

  public toJSON(): Quiz {
    return {
      title: this.title,
      platform: this.platform,
      isTimed: this.isTimed,
      timeLimit: this.timeLimit,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      description: this.description,
      questions: this.questions,
      scores: this.scores,
      comments: this.comments,
      _id: this._id,
    };
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
   * Retrieve all quizzes matching the given parameters.
   */
  public static async retrieveAll(
    filter: QuizFilter = {},
  ): Promise<{ totalItems: number; items: Quiz[] }> {
    const quizFilter: QuizFilter = {};

    if (filter.platform) quizFilter.platform = filter.platform.toLowerCase();

    return await DbClient.find<Quiz>(COLLECTION, quizFilter, {});
  }
}
