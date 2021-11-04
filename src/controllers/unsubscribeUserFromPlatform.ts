import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import UserModel from "../models/User";

const unsubscribeUserFromPlatform = async (req: Request, res: Response) => {
  try {
    const platformTitle = req.params.platformTitle;
    const username = res.locals.authenticatedUser;

    const platform = await PlatformModel.retrieveByTitle(platformTitle);

    if (!platform) return res.sendStatus(400);

    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    user.subscriptions = user.subscriptions.filter((p) => p !== platformTitle);
    await user.update();

    platform.subscribers = platform.subscribers.filter((u) => u !== username);
    await platform.update();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default unsubscribeUserFromPlatform;
