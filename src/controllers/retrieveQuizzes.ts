import { Request, Response } from "express";
import QuizModel from "../models/Quiz";

const retrieveQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await QuizModel.retrieveAll({
      platform: (req.query.platform as string | undefined)?.toLowerCase(),
    });
    return res.status(200).send(quizzes);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveQuizzes;
