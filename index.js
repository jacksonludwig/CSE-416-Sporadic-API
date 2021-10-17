import express from "express";
import cors from "cors";
import userRouter from "./src/routes/userRouter.js";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors(), express.json());

app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
