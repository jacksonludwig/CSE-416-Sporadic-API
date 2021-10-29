import { Request, Response } from "express";
import QuizModel from "../models/Quiz";

const retrieveQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await QuizModel.retrieveAll({
      platform: req.query.platform as string | undefined,
    });
    return quizzes ? res.status(200).send(JSON.stringify(quizzes)) : res.sendStatus(400);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveQuizzes;
