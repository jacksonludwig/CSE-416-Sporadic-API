import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import { Question } from "../models/Quiz";

const createQuizSchema = Joi.object({
  quizTitle: Joi.string().alphanum().min(1).max(75).required(),
  platformTitle: Joi.string().alphanum().min(1).max(100).required(),
  timeLimit: Joi.number().required(),
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

    if (platform.quizzes.includes(quizTitle)) {
      console.error(`${platformTitle} already includes ${quizTitle}`);
      return res.sendStatus(400);
    }

    if (platform.getOwner() !== username && !platform.moderators.includes(username)) {
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
