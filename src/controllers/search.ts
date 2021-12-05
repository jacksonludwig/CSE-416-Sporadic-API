import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";
import pagesToSkipAndLimit from "../utils/Pagination";

enum SearchScopes {
  Platforms = "platforms",
  Quizzes = "quizzes",
  Users = "users",
}

const searchSchema = Joi.object({
  scope: Joi.string().valid(SearchScopes.Platforms, SearchScopes.Quizzes, SearchScopes.Users),
  searchQuery: Joi.string().max(50).allow("").required(),
  page: Joi.number().integer().min(1).max(100000),
  amountPerPage: Joi.number().integer().min(1).max(100),
  userFilter: Joi.string().valid("globallyBanned"),
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
  const userFilter = req.query.userFilter as string | undefined;
  const { skip, limit } = pagesToSkipAndLimit(
    Number(req.query.page),
    Number(req.query.amountPerPage),
  );

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const userMatchFilter: { isGloballyBanned?: boolean } = {};
    if (userFilter === "globallyBanned") userMatchFilter.isGloballyBanned = true;

    switch (scope) {
      case SearchScopes.Platforms:
        return res.status(200).send(await PlatformModel.searchByTitle(searchQuery, skip, limit));
      case SearchScopes.Quizzes:
        return res.status(200).send(await QuizModel.searchByTitle(searchQuery, skip, limit));
      case SearchScopes.Users:
        return res
          .status(200)
          .send(await UserModel.searchByUsername(searchQuery, userMatchFilter, skip, limit));
      default:
        const platforms = await PlatformModel.searchByTitle(searchQuery, skip, limit);
        const quizzes = await QuizModel.searchByTitle(searchQuery, skip, limit);
        const users = await UserModel.searchByUsername(searchQuery, userMatchFilter, skip, limit);

        return res.status(200).send({ users: users, platforms: platforms, quizzes: quizzes });
    }

    return res.sendStatus(500);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default search;
