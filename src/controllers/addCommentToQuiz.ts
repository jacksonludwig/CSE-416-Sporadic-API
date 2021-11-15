import { Request, Response } from "express";
import Joi from "joi";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

const addCommentSchema = Joi.object({
  commentText: Joi.string().min(1).max(500).required(),
});

export type AddCommentRequest = {
  commentText: string;
};

const addCommentToQuiz = async (req: Request, res: Response) => {
  try {
    await addCommentSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { commentText } = req.body as AddCommentRequest;
  const { platform, quizTitle } = req.params;
  const username = res.locals.authenticatedUser as string;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz) {
      console.error(`${platform}/${quizTitle} not found in database`);
      return res.sendStatus(400);
    }

    if (!quiz.scores.find((s) => s.user === username)) {
      console.error(`${username} has not taken this quiz`);
      return res.sendStatus(400);
    }

    if (quiz.comments.find((c) => c.user === username)) {
      console.error(`${username} has already commented on this quiz`);
      return res.sendStatus(400);
    }

    quiz.comments.push({
      user: username,
      text: commentText,
      date: new Date(),
    });

    await quiz.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default addCommentToQuiz;
