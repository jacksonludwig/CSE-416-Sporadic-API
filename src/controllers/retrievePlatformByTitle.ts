import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import UserModel from "../models/User";

const retrieveByTitle = async (req: Request, res: Response) => {
  const { platformTitle } = req.params;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const platformModel = await PlatformModel.retrieveByTitleWithPinned(platformTitle);

    if (!platformModel) {
      console.error(`${platformTitle} does not exist`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platformModel) < Sporadic.Permissions.User) {
      console.error(`${username} lacks permission to fetch quizzes for ${platformTitle}`);
      return res.sendStatus(403);
    }

    return res.status(200).send(platformModel.toJSON());
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveByTitle;
