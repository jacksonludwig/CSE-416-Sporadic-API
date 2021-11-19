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

// Grace period, in seconds, where a quiz can be submitted after its due date.
// The due date is usually determined by timeStarted + timeLimit.
const GRACE_PERIOD = 30;

const submitQuiz = async (req: Request, res: Response) => {
  try {
    await submitQuizSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { answers } = req.body as SubmitQuizPost;
  const { platform, quizTitle } = req.params;
<<<<<<< HEAD
=======
  const username = res.locals.authenticatedUser;
>>>>>>> BUILD_5

  try {
    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz || !quiz["questions"] || quiz["questions"].length !== answers.length) {
      console.error(`${quizTitle} does not exist in ${platform} or given answers do not match.`);
      return res.sendStatus(400);
    }
<<<<<<< HEAD
=======

    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);
>>>>>>> BUILD_5

    const userScoreIndex = quiz.scores.findIndex((s) => s.user === username);

    if (userScoreIndex === -1) {
      console.error(`${quizTitle} has not been started by ${username}`);
      return res.sendStatus(400);
    }

<<<<<<< HEAD
    const userScoreIndex = quiz.scores.findIndex((s) => s.user === user.getUsername());

    if (userScoreIndex === -1) {
      console.error(`${quizTitle} has not been started by ${user.getUsername()}`);
      return res.sendStatus(400);
    }

    if (quiz.scores[userScoreIndex].score !== undefined) {
      console.error(`${quizTitle} has already been submitted by ${user.getUsername()}`);
=======
    if (quiz.scores[userScoreIndex].score !== undefined) {
      console.error(`${quizTitle} has already been submitted by ${username}`);
>>>>>>> BUILD_5
      return res.sendStatus(400);
    }

    const timeDue = quiz.scores[userScoreIndex].timeStarted;
    timeDue.setSeconds(timeDue.getSeconds() + quiz.getTimeLimit() + GRACE_PERIOD);

    if (new Date() > timeDue) {
      console.error(`${quizTitle} submission period has passed.`);
      return res.sendStatus(400);
    }

    // TODO Update user total for the platform
    const totalCorrect = quiz.correctAnswers.reduce((prev, curr, index) => {
      return answers[index] === curr ? prev + 1 : prev;
    }, 0);

    quiz.scores[userScoreIndex].score = totalCorrect;
    await quiz.update();

    return res
      .status(200)
      .send({ correctAnswers: quiz.correctAnswers, totalCorrect: totalCorrect });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default submitQuiz;
