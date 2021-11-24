import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

const retrieveQuizByTitle = async (req: Request, res: Response) => {
  const { platform, quizTitle } = req.params;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const platformModel = await PlatformModel.retrieveByTitle(platform);

    if (!platformModel) {
      console.error(`${platform} does not exist`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platformModel) < Sporadic.Permissions.User) {
      console.error(`${username} lacks permission to fetch quizzes for ${platform}`);
      return res.sendStatus(403);
    }

    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz) return res.sendStatus(400);

    const userScoreIndex = quiz.scores.findIndex((s) => s.user === username);

    return res.status(200).send(
      userScoreIndex !== -1
        ? {
            ...quiz.toJSON(),
            score: quiz.scores[userScoreIndex].score || 0,
            totalQuestions: quiz.questions.length,
          }
        : quiz.toJSON(),
    );
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveQuizByTitle;
