import { Request, Response } from "express";
import QuizModel from "../models/Quiz";

const retrieveQuizByTitle = async (req: Request, res: Response) => {
    try {
      const quiz = await QuizModel.retrieveByTitle(req.params.platformTitle, req.params.quizTitle);
  
      return quiz ? res.status(200).send(quiz.toJSON()) : res.sendStatus(400);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
  
  export default retrieveQuizByTitle;