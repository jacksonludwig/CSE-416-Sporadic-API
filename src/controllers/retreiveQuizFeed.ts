import { Request, Response } from "express";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";
import PlatformModel from "../models/Platform";

const retrieveQuizFeed= async (req: Request, res: Response) => {
  try {
    const username = res.locals.authenticatedUser;

    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);
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


fetch all quizzes from subscribed platforms 

*/