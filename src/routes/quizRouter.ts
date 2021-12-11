import express from "express";
import addCommentToQuiz from "../controllers/addCommentToQuiz";
import createQuiz from "../controllers/createQuiz";
import deleteQuizByTitle from "../controllers/deleteQuizByTitle";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import retrieveQuizzes from "../controllers/retrieveQuizzes";
import startQuiz from "../controllers/startQuiz";
import submitQuiz from "../controllers/submitQuiz";
import retrieveQuizFeed from "../controllers/retrieveQuizFeed";
import updateQuizVote from "../controllers/updateQuizVote";
import { validateToken } from "../middleware/auth";
import generateQuizAwardIconSubmissionURL from "../controllers/generateQuizAwardIconSubmissionURL";
import generateQuizIconSubmissionURL from "../controllers/generateQuizIconSubmissionURL";

const quizRouter = express.Router();
quizRouter.use(validateToken);

quizRouter.post("/", createQuiz);
quizRouter.post("/:platform/:quizTitle/submit", submitQuiz);
quizRouter.post("/:platform/:quizTitle/start", startQuiz);

quizRouter.get("/", retrieveQuizzes);
quizRouter.get("/:platform/:quizTitle", retrieveQuizByTitle);
quizRouter.get("/:platform/:quiz/set-icon", validateToken, generateQuizIconSubmissionURL);
quizRouter.get("/:platform/:quiz/set-award-icon", validateToken, generateQuizAwardIconSubmissionURL)
quizRouter.get("/feed", retrieveQuizFeed);

quizRouter.put("/:platform/:quizTitle/comment", addCommentToQuiz);

quizRouter.delete("/:platform/:quizTitle", deleteQuizByTitle);

quizRouter.patch("/:platform/:quizTitle/:vote", updateQuizVote);

export default quizRouter;
