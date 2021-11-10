import { Request, Response } from "express";
import Joi from "joi";
import { ObjectId } from "mongodb";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

const submitQuizSchema = Joi.object({
  // The request will contain an array of numbers which represent the multiple choice answers
  // selected for the questions. The indexes represent the question, e.g. index 0 is the first
  // question in the quiz.
  answers: Joi.array().items(Joi.number()).required(),
});

export type SubmitQuizPost = {
  answers: number[];
};

const submitQuiz = async (req: Request, res: Response) => {
  try {
    await submitQuizSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { answers } = req.body as SubmitQuizPost;

  // TODO Check if the user took too long to submit
  const { platform, quizTitle } = req.params;

  try {
    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz || !quiz["questions"] || quiz["questions"].length !== answers.length) {
      console.error(`${quizTitle} does not exist in ${platform} or given answers do not match.`);
      return res.sendStatus(400);
    }

    const user = await UserModel.retrieveByUsername(res.locals.authenticatedUser);

    if (!user) throw Error(`${res.locals.authenticatedUser} not found in database`);

    const quizId = quiz.getId() as ObjectId;

    if (user.quizzesTaken.find((q) => q.equals(quizId))) {
      console.error(`${quizTitle} has already been taken by ${user.getUsername()}`);
      return res.sendStatus(400);
    }

    user.quizzesTaken.push(quizId);
    await user.update();

    // TODO Use this to save user score in quiz and update their total for the platform
    const totalCorrect = quiz.correctAnswers.reduce((prev, curr, index) => {
      return answers[index] === curr ? prev + 1 : prev;
    }, 0);

    return res
      .status(200)
      .send({ correctAnswers: quiz.correctAnswers, totalCorrect: totalCorrect });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default submitQuiz;
