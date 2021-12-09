import { ObjectId } from "mongodb";
import { Quiz } from "../../src/models/Quiz";

const quiz: Quiz = {
  title: "moviesandstuff",
  platform: "movies",
  timeLimit: 5,
  awardTitle: "Movie Genius",
  awardRequirement: 2,
  upvotes: 2,
  downvotes: 3,
  description: "this is a quiz where you get to take movies and stuff",
  _id: new ObjectId("6175e73f27e5d5655ea5805f"),
  questions: [
    {
      body: "this is a question, the answer is the first choice",
      answers: ["0", "1", "2", "3"],
    },
    {
      body: "this is another question, the answer is the second choice",
      answers: ["0", "1", "2", "3"],
    },
  ],
  correctAnswers: [0, 1],
  scores: [],
  comments: [],
};

export default quiz;
