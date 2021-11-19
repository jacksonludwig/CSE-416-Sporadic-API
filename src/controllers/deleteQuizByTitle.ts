import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

const deleteQuizByTitle = async (req: Request, res: Response) => {
  const { platform, quizTitle } = req.params;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz) {
      console.error(`${platform}/${quizTitle} does not exist`);
      return res.sendStatus(400);
    }

    const platformObj = await PlatformModel.retrieveByTitle(platform);

    if (!platformObj) {
      console.error(`${platform} does not exist`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platformObj) < Sporadic.Permissions.Moderator) {
      console.error(`${username} not an owner or moderator of ${platform}`);
      return res.sendStatus(403);
    }

    await quiz.delete();

    platformObj.quizzes = platformObj.quizzes.filter((q) => q !== quizTitle);

    await platformObj.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default deleteQuizByTitle;
