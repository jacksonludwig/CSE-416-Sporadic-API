import express from "express";
import addCommentToQuiz from "../controllers/addCommentToQuiz";
import createQuiz from "../controllers/createQuiz";
import deleteQuizByTitle from "../controllers/deleteQuizByTitle";
import retrieveQuizByTitle from "../controllers/retrieveQuizByTitle";
import retrieveQuizzes from "../controllers/retrieveQuizzes";
import startQuiz from "../controllers/startQuiz";
import submitQuiz from "../controllers/submitQuiz";
import generatePlatformBannerSubmissionURL from "../controllers/generatePlatformBannerSubmissionURL";
import generatePlatformIconSubmissionURL from "../controllers/generatePlatformIconSubmissionURL";
import { validateToken } from "../middleware/auth";

const quizRouter = express.Router();
quizRouter.use(validateToken);

quizRouter.post("/", createQuiz);
quizRouter.post("/:platform/:quizTitle/submit", submitQuiz);
quizRouter.post("/:platform/:quizTitle/start", startQuiz);

quizRouter.get("/", retrieveQuizzes);
quizRouter.get("/:platform/set-banner", validateToken, generatePlatformBannerSubmissionURL);
quizRouter.get("/:platform/set-icon", validateToken, generatePlatformIconSubmissionURL);
quizRouter.get("/:platform/:quizTitle", retrieveQuizByTitle);

quizRouter.put("/:platform/:quizTitle/comment", addCommentToQuiz);

quizRouter.delete("/:platform/:quizTitle", deleteQuizByTitle);

export default quizRouter;
