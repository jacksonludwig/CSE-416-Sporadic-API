import { Request, Response } from "express";
import Joi from "joi";
import QuizModel from "../models/Quiz";

const updateQuizVoteSchema = Joi.object({
  platform: Joi.string()
    .pattern(/^[\w\-\s]*$/) // alphanumeric and spaces allowed
    .trim()
    .min(1)
    .max(100)
    .required(),
  quizTitle: Joi.string()
    .pattern(/^[\w\-\s]*$/) // alphanumeric and spaces allowed
    .trim()
    .min(1)
    .max(100)
    .required(),
  vote: Joi.number()
    .valid(Sporadic.Vote.Upvote, Sporadic.Vote.Downvote, Sporadic.Vote.None)
    .required(),
});

const updateQuizVote = async (req: Request, res: Response) => {
  try {
    await updateQuizVoteSchema.validateAsync(req.params);
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

    const userScoreIndex = quiz.scores.findIndex((s) => s.user === username);

    if (userScoreIndex === -1) {
      console.error(`${username} has not taken the quiz ${platform}/${quizTitle}.`);
      return res.sendStatus(403);
    }

    const userScore = quiz.scores[userScoreIndex];

    const setUserScoreVote = (vote: string) => {
      switch (vote) {
        case Sporadic.Vote.Upvote:
          userScore.vote = Sporadic.Vote.Upvote;
          break;
        case Sporadic.Vote.Downvote:
          userScore.vote = Sporadic.Vote.Downvote;
          break;
        case Sporadic.Vote.None:
          userScore.vote = Sporadic.Vote.None;
          break;
      }
    };

    switch (userScore.vote) {
      case vote:
        console.error(`${username} already ${vote}d this quiz`);
        return res.sendStatus(400);
      case Sporadic.Vote.Upvote:
        setUserScoreVote(vote);
        quiz.upvotes--;
        if (vote === Sporadic.Vote.Downvote) quiz.downvotes++;
        break;
      case Sporadic.Vote.Downvote:
        setUserScoreVote(vote);
        quiz.downvotes--;
        if (vote === Sporadic.Vote.Upvote) quiz.upvotes++;
        break;
      case Sporadic.Vote.None:
        setUserScoreVote(vote);
        if (vote === Sporadic.Vote.Upvote) quiz.upvotes++;
        else if (vote === Sporadic.Vote.Downvote) quiz.downvotes++;
        break;
      default:
        break;
    }

    await quiz.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateQuizVote;
