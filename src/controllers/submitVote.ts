import { Request, Response } from "express";
import Joi from "joi";
import QuizModel from "../models/Quiz";

const submitVoteSchema = Joi.object({
  vote: Joi.string().allow("up", "down"),
});

const submitVote = async (req: Request, res: Response) => {
  try {
    await submitVoteSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  } 

  const username = res.locals.authenticatedUser;
  const { platform, quizTitle, vote } = req.params;

  try {
    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz) {
      console.error(`${quizTitle} does not exist in ${platform}.`);
      return res.sendStatus(400);
    }

    const userScore = quiz.scores.find((s) => s.user === username);

    if (!userScore) {
      console.error(`${username} has not taken the quiz ${platform}/${quizTitle}.`);
      return res.sendStatus(400);
    }

    if (userScore.hasVoted) {
      console.error(`${username} has already voted on quiz ${platform}/${quizTitle}.`);
      return res.sendStatus(400);
    }


  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }


}

export default submitVote;
