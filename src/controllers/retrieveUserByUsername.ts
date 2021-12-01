import { Request, Response } from "express";
import UserModel from "../models/User";

const retrieveByUsername = async (req: Request, res: Response) => {
  const username = req.params.username;

  try {
    const user = await UserModel.retrieveUserSortedFriends(username);
    if (!user) {
      console.error(`${username} not found in database`);
      return res.sendStatus(400);
    }

    return res
      .status(200)
      .send(
        username === res.locals.authenticatedUser ? user.toJSONWithPrivateData() : user.toJSON(),
      );
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveByUsername;
