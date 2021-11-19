import { Request, Response } from "express";
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

    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

<<<<<<< HEAD
    if (quiz.scores.find((s) => s.user === username)) {
      console.error(`${username} has already started the quiz ${platform}/${quizTitle}.`);
      return res.sendStatus(400);
=======
    // If the user already started the quiz, send back the questions, but don't give them a new score object.
    if (quiz.scores.find((s) => s.user === username)) {
      console.log(`${username} has already started the quiz ${platform}/${quizTitle}.`);
      return res.status(200).send(quiz.toJSONWithQuestions());
>>>>>>> BUILD_5
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
