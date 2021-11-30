import { Request, Response } from "express";
import Joi from "joi";
import QuizModel from "../models/Quiz";

const updateQuizVoteSchema = Joi.object({
  vote: Joi.number().valid(Sporadic.Vote.Upvote, Sporadic.Vote.Downvote, Sporadic.Vote.None),
});

const updateQuizVote = async (req: Request, res: Response) => {
  try {
    await updateQuizVoteSchema.validateAsync(req.body);
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

    if (vote === Sporadic.Vote.Upvote) {
      switch (userScore.vote) {
        case Sporadic.Vote.Upvote:
          console.error(`${username} already upvoted this quiz`);
          return res.sendStatus(400);
        case Sporadic.Vote.Downvote:
          userScore.vote = Sporadic.Vote.Upvote;
          quiz.downvotes--;
          quiz.upvotes++;
          break;
        case Sporadic.Vote.None:
          userScore.vote = Sporadic.Vote.Upvote;
          quiz.upvotes++;
          break;
      }
    } else if (vote === Sporadic.Vote.Downvote) {
      switch (userScore.vote) {
        case Sporadic.Vote.Upvote:
          userScore.vote = Sporadic.Vote.Downvote;
          quiz.downvotes++;
          quiz.upvotes--;
          break;
        case Sporadic.Vote.Downvote:
          console.error(`${username} already downvoted this quiz`);
          return res.sendStatus(400);
        case Sporadic.Vote.None:
          userScore.vote = Sporadic.Vote.Downvote;
          quiz.downvotes--;
          break;
      }
    } else {
      switch (userScore.vote) {
        case Sporadic.Vote.Upvote:
          userScore.vote = Sporadic.Vote.Upvote;
          quiz.upvotes++;
          break;
        case Sporadic.Vote.Downvote:
          userScore.vote = Sporadic.Vote.Downvote;
          quiz.downvotes++;
          break;
        case Sporadic.Vote.None:
          console.error(`${username} already has a neutral vote`);
          return res.sendStatus(400);
      }
    }

    await quiz.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateQuizVote;
