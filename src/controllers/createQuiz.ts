import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import { Question } from "../models/Quiz";
import UserModel from "../models/User";

const createQuizSchema = Joi.object({
  quizTitle: Joi.string()
    .pattern(/^[\w\-\s]*$/) // alphanumeric and spaces allowed
    .min(1)
    .max(100)
    .required(),
  platformTitle: Joi.string().alphanum().min(1).max(100).required(),
  timeLimit: Joi.number().min(60).max(600).required(),
  description: Joi.string().min(1).max(500).required(),
  questions: Joi.array()
    .items(
      Joi.object({
        body: Joi.string().min(1).max(500).required(),
        answers: Joi.array().items(Joi.string().min(1).max(500)).required(),
      }).required(),
    )
    .required(),
  correctAnswers: Joi.array().items(Joi.number().min(0).max(50)).required(),
});

export type CreateQuizPost = {
  quizTitle: string;
  platformTitle: string;
  timeLimit: number;
  description: string;
  questions: Question[];
  correctAnswers: number[];
};

const createQuiz = async (req: Request, res: Response) => {
  try {
    await createQuizSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { platformTitle, quizTitle, timeLimit, description, questions, correctAnswers } =
    req.body as CreateQuizPost;

  const username = res.locals.authenticatedUser;

  try {
    const platform = await PlatformModel.retrieveByTitle(platformTitle);

    if (!platform) {
      console.error(`${platformTitle} does not exist`);
      return res.sendStatus(400);
    }

    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    if (platform.quizzes.includes(quizTitle)) {
      console.error(`${platformTitle} already includes ${quizTitle}`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platform) < Sporadic.Permissions.Moderator) {
      console.error(`${username} not an owner or moderator of ${platformTitle}`);
      return res.sendStatus(403);
    }

    const quiz = new QuizModel({
      title: quizTitle,
      platform: platformTitle,
      timeLimit: timeLimit,
      upvotes: 0,
      downvotes: 0,
      description: description,
      questions: questions,
      scores: [],
      comments: [],
      correctAnswers: correctAnswers,
    });

    await quiz.save();

    platform.quizzes.push(quiz.title);
    await platform.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default createQuiz;
