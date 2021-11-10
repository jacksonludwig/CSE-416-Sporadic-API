import { ObjectId } from "mongodb";
import { User } from "../../src/models/User";

const user: User = {
  username: "testuser",
  email: "email@email.com",
  cognitoId: "asdkjskdjfas",
  quizzesTaken: [],
  _id: new ObjectId("6175e73f27e5d5655ea5805f"),
  isGloballyBanned: false,
  lastLogin: new Date(1231231231233),
  subscriptions: [],
  friends: [],
  notifications: [],
  awards: [],
  profilePicture: "https://imageurl.png",
};

export default user;
