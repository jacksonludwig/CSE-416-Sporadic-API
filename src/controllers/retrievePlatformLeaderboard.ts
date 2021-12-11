import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import UserModel from "../models/User";
import pagesToSkipAndLimit from "../utils/Pagination";

const retrievePlatformLeaderboardSchema = Joi.object({
  page: Joi.number().integer().min(1).max(100000),
  amountPerPage: Joi.number().integer().min(1).max(100),
});

const retrievePlatformLeaderboard = async (req: Request, res: Response) => {
  const username = res.locals.authenticatedUser;
  const { platformTitle } = req.params;
  const { skip, limit } = pagesToSkipAndLimit(
    Number(req.query.page),
    Number(req.query.amountPerPage),
  );

  try {
    await retrievePlatformLeaderboardSchema.validateAsync(req.query);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const platform = await PlatformModel.retrieveByTitle(platformTitle);

    if (!platform) {
      console.error(`${platformTitle} not found in database`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platform) < Sporadic.Permissions.User) {
      console.error(`${username} lacks permission to fetch leaderboard for ${platform}`);
      return res.sendStatus(403);
    }

    const userScoreIndex = platform.scores
      .sort((x, y) => x.totalCorrect - y.totalCorrect)
      .findIndex((s) => s.username === username);

    return res.status(200).send({
      currentUserData:
        userScoreIndex === -1
          ? undefined
          : {
              totalCorrect: platform.scores[userScoreIndex].totalCorrect,
              leaderBoardPosition: userScoreIndex - 1,
            },
      ...(await PlatformModel.retrieveLeaderboard(platformTitle, skip, limit)),
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrievePlatformLeaderboard;
