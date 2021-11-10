import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";

const deleteQuizByTitle = async (req: Request, res: Response) => {
  const { platform, quizTitle } = req.params;
  const username = res.locals.authenticatedUser;

  try {
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

    if (platformObj.getOwner() !== username && !platformObj.moderators.includes(username)) {
      console.error(`${username} not an owner or moderator of ${platform}`);
      return res.sendStatus(403);
    }

    await quiz.delete();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default deleteQuizByTitle;
