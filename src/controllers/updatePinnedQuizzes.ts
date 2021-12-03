import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

const updatePinnedQuizzesSchema = Joi.object({
  targetQuiz: Joi.string()
    .pattern(/^[\w\-\s]*$/) // alphanumeric and spaces allowed
    .trim()
    .min(1)
    .max(100)
    .required(),
  action: Joi.string().valid(Sporadic.UpdateAction.Add, Sporadic.UpdateAction.Remove).required(),
});

export type UpdatePinnedQuizzesRequest = {
  targetQuiz: string;
  action: Sporadic.UpdateAction;
};

const updatePinnedQuizzes = async (req: Request, res: Response) => {
  try {
    await updatePinnedQuizzesSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { targetQuiz, action } = req.body as UpdatePinnedQuizzesRequest;
  const username = res.locals.authenticatedUser as string;
  const platformTitle = req.params.platformTitle;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const platform = await PlatformModel.retrieveByTitle(platformTitle);

    if (!platform) {
      console.error(`${platformTitle} not found in database`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platform) < Sporadic.Permissions.Moderator) {
      console.error(`${username} is not an owner or moderator of ${platformTitle}`);
      return res.sendStatus(403);
    }

    const quiz = await QuizModel.retrieveByTitle(platformTitle, targetQuiz);

    if (!quiz) {
      console.error(`${targetQuiz} not found in database`);
      return res.sendStatus(400);
    }

    const hasQuizAsPinned = (platform.pinnedQuizzes as string[]).includes(targetQuiz);

    if (action === Sporadic.UpdateAction.Add) {
      if (hasQuizAsPinned) {
        console.error(`${targetQuiz} is already pinned`);
        return res.sendStatus(400);
      }
      (platform.pinnedQuizzes as string[]).push(targetQuiz);
    } else {
      if (!hasQuizAsPinned) {
        console.error(`${targetQuiz} is not pinned`);
        return res.sendStatus(400);
      }
      platform.pinnedQuizzes = (platform.pinnedQuizzes as string[]).filter((m) => m !== targetQuiz);
      console.log(platform.pinnedQuizzes);
    }

    await platform.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updatePinnedQuizzes;
