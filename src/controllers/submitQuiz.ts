import { Request, Response } from "express";
import Joi from "joi";
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

  try {
    const quiz = await QuizModel.retrieveByTitle(req.params.platform, req.params.quizTitle);

    if (!quiz || !quiz["questions"] || quiz["questions"].length !== answers.length)
      return res.sendStatus(400);

    const user = await UserModel.retrieveByUsername(res.locals.authenticatedUser);

    if (!user) throw Error(`${res.locals.authenticatedUser} not found in database`);

    const quizId = quiz.getId() as string;

    if (user.quizzesTaken.includes(quizId)) return res.sendStatus(400);

    user.quizzesTaken.push(quizId);
    await user.update();

    const correctAnswers = quiz.getQuestions()?.map((q) => q.correctAnswer);

    // TODO Use this to save user score in quiz and update their total for the platform
    const totalCorrect = correctAnswers?.reduce((prev, curr, index) => {
      return answers[index] === curr ? prev + 1 : prev;
    }, 0);

    return res.status(200).send({ correctAnswers: correctAnswers });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default submitQuiz;
