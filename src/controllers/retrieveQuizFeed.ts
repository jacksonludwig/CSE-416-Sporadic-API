import { Request, Response } from "express";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";
import { SortDirection } from "mongodb";

/*
refactor this to be more like retrieve userbyusername

all i do is call the
*/



const retrieveQuizFeed= async (req: Request, res: Response) => {
  //const username = res.locals.authenticatedUser;
  const username = req.params.username;

  const user = await UserModel.retrieveByUsername(username);
  if (!user) throw Error(`${username} not found in database`);

  const subscriptions = user.subscriptions;
  if (!subscriptions) throw Error(`${username} has no subscriptions`);

  // const filters = user.subscriptions.map(platformString => {platform: platformString});

  
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

/* MongoDB query
db.users.subscriptions.aggregate(
  { $sample: { size: 10 } }
)

for each platform:
n = number of quizzes retreived
i = number of loops 
db.platforms.quizzes.sort({_id:-1}).limit(1).skip(i))

continue loop until n = 10

{$or: [ {platform: "movies"}, {platform: "moodyboody"}] }
fetch all quizzes from subscribed platforms 

*/