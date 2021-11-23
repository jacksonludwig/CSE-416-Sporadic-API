import express from "express";
import search from "../controllers/search";
import { validateToken } from "../middleware/auth";

const searchRouter = express.Router();
searchRouter.use(validateToken);

searchRouter.get("/", search);

export default searchRouter;
