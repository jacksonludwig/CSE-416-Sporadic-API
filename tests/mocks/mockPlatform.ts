import { ObjectId } from "mongodb";
import { Platform } from "../../src/models/Platform";

const platform: Platform = {
  title: "movies",
  owner: "someuser",
  description: "this is a platform where you take quizzes about movies",
  _id: new ObjectId("6175e73f27e5d5655ea5805f"),
  pinnedQuizzes: [],
  subscribers: [],
  moderators: [],
  quizzes: [],
  bannedUsers: [],
  scores: [],
};

export default platform;
