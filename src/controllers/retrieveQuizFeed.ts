import { Request, Response } from "express";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";
import { SortDirection } from "mongodb";

const retrieveQuizFeed= async (req: Request, res: Response) => {
  const username = res.locals.authenticatedUser;
  // const username = req.params.username;

  const user = await UserModel.retrieveByUsername(username);
  if (!user) throw Error(`${username} not found in database`);

  const subscriptions = user.subscriptions;
  if (!subscriptions) throw Error(`${username} has no subscriptions`);
  
  enum SortDirs {
    Ascending = "ascending",
    Descending = "descending",
  }
  
  const dirMap = new Map<string, SortDirection>([
    [SortDirs.Ascending, 1],
    [SortDirs.Descending, -1],
  ]);
  
  try {
    const quizzes = await QuizModel.retrieveFeed(     
      subscriptions,    
      {
        field: req.query.sortBy as string,
        direction: dirMap.get(req.query.sortDirection as SortDirs),
      },
  
    );
    return res.status(200).send(quizzes);

  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

}

export default retrieveQuizFeed;

/* 
#TODO: implement skip and limit
skip for page #
limit for # of results to show

*/