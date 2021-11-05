import { Request, Response } from "express";
import Joi from "joi";
import QuizModel from "../models/Quiz";
import { Question } from "../models/Quiz";

const answerSchema = Joi.object({
  text: Joi.string().alphanum().min(1).max(100).required(),
  isCorrect: Joi.boolean().required(),
});

const questionSchema = Joi.object({
  body: Joi.string().alphanum().min(1).max(500).required(),
  answers: Joi.array().items(answerSchema),
});

const createQuizSchema = Joi.object({
  title: Joi.string().alphanum().min(1).max(75).required(),
  platform: Joi.string().alphanum().min(1).max(100).required(),
  timeLimit: Joi.number().required(),
  description: Joi.string().min(1).max(500).required(),
  questions: Joi.array().items(questionSchema),
  correctAnswers: Joi.array().items(Joi.number().min(1).max(50)),
});

export type CreateQuizPost = {
  title: string;
  platform: string;
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

  const { platform, title, timeLimit, description, questions, correctAnswers } =
    req.body as CreateQuizPost;

  try {
    if (await QuizModel.retrieveByTitle(platform, title)) {
      console.error(`${title} already exists`);
      return res.sendStatus(400);
    }

    const quiz = new QuizModel({
      title: title,
      platform: platform,
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
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
};

export default createQuiz;
