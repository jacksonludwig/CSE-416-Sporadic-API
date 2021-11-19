import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

const startQuiz = async (req: Request, res: Response) => {
  const { platform, quizTitle } = req.params;
  const username = res.locals.authenticatedUser;

  try {
    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz) {
      console.error(`${quizTitle} does not exist in ${platform}.`);
      return res.sendStatus(400);
    }

    const platformModel = await PlatformModel.retrieveByTitle(platform);

    if (!platformModel) throw Error(`${platform} not found in database`);

    if (platformModel.bannedUsers.includes(username)) {
      console.error(`${username} is banned from ${platform}`);
      return res.sendStatus(403);
    }

    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    // If the user already started the quiz, send back the questions, but don't give them a new score object.
    if (quiz.scores.find((s) => s.user === username)) {
      console.log(`${username} has already started the quiz ${platform}/${quizTitle}.`);
      return res.status(200).send(quiz.toJSONWithQuestions());
    }

    quiz.scores.push({
      user: username,
      timeStarted: new Date(),
    });

    await quiz.update();

    return res.status(200).send(quiz.toJSONWithQuestions());
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default startQuiz;
