import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

enum SearchScopes {
  Platforms = "platforms",
  Quizzes = "quizzes",
  Users = "users",
}

const searchSchema = Joi.object({
  scope: Joi.string().valid(SearchScopes.Platforms, SearchScopes.Quizzes, SearchScopes.Users),
  searchQuery: Joi.string().min(1).max(50).required(),
  skip: Joi.number().min(0).max(100000),
  limit: Joi.number().min(1).max(100),
});

const search = async (req: Request, res: Response) => {
  try {
    await searchSchema.validateAsync(req.query);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const username = res.locals.authenticatedUser;

  const scope = req.query.scope;
  const searchQuery = req.query.searchQuery as string;
  const skip = Number(req.query.skip as string | undefined);
  const limit = Number(req.query.limit as string | undefined);

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    switch (scope) {
      case SearchScopes.Platforms:
        return res.status(200).send(await PlatformModel.searchByTitle(searchQuery, skip, limit));
      case SearchScopes.Quizzes:
        return res.status(200).send(await QuizModel.searchByTitle(searchQuery, skip, limit));
      case SearchScopes.Users:
        return res.status(200).send(await UserModel.searchByUsername(searchQuery, skip, limit));
      default:
        const platforms = await PlatformModel.searchByTitle(searchQuery, skip, limit);
        const quizzes = await QuizModel.searchByTitle(searchQuery, skip, limit);
        const users = await UserModel.searchByUsername(searchQuery, skip, limit);

        return res.status(200).send({ users: users, platforms: platforms, quizzes: quizzes });
    }

    return res.sendStatus(500);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default search;