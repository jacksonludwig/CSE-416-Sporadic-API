import { Request, Response } from "express";
import Joi, { string } from "joi";
import QuizModel from "../models/Quiz";
import { Answer, Question, Score, Comment } from "../models/Quiz";
const commentSchema = Joi.object({
  user: Joi.string().alphanum().min(3).max(50).required(),
  text: Joi.string().alphanum().min(2).max(500).required(),
  date: Joi.date().required(),
});
const scoreSchema = Joi.object({
  user: Joi.string().alphanum().min(3).max(50).required(),
  score: Joi.number().min(0).max(100).required(),
  timeSubmitted: Joi.date().required(),
});
const answerSchema = Joi.object({
  text: Joi.string().alphanum().min(1).max(100).required(),
  isCorrect: Joi.boolean().required(),
})
const questionSchema = Joi.object({
  body: Joi.string().alphanum().min(1).max(500).required(),
  answers: Joi.array().items(answerSchema),
})
const createQuizSchema = Joi.object({
  title: Joi.string().alphanum().min(3).max(75).required(),
  platform: Joi.string().alphanum().min(3).max(100).required(),
  isTimed: Joi.boolean().required(),
  timeLimit: Joi.number().required(),
  upvotes: Joi.number().required(),
  downvotes: Joi.number().required(),
  scores: Joi.array().items(scoreSchema),
  questions: Joi.array().items(questionSchema),
  comments: Joi.array().items(commentSchema),
});

export type CreateQuizPost = {
  title: string;
  platform: string;
  isTimed: boolean;
  timeLimit: number;
  upvotes: number;
  downvotes: number;
  questions?: Question[];
  scores?: Score[];
  comments?: Comment[];
};

const createQuiz = async (req: Request, res: Response) => {
  try {
    await createQuizSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { platform, title, isTimed, timeLimit, upvotes, downvotes, questions, scores, comments } = req.body as CreateQuizPost;

  try {
    if (await QuizModel.retrieveByTitle(platform, title)) {
      console.error(`${title} already exists`);
      return res.sendStatus(400);
    }

    const quiz = new QuizModel({
      title: title,
      platform: platform,
      isTimed: isTimed,
      timeLimit: timeLimit,
      upvotes: upvotes,
      downvotes: downvotes,
      questions: questions,
      scores: scores,
      comments: comments
    });

    await quiz.save();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
};

export default createQuiz;
