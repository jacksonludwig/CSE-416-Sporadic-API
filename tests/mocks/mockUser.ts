import { User } from "../../src/models/User";

const user: User = {
  username: "testuser",
  email: "email@email.com",
  cognitoId: "asdkjskdjfas",
  quizzesTaken: [],
  _id: "exampleuserid",
  isGloballyBanned: false,
  lastLogin: new Date(1231231231233),
  subscriptions: [],
  friends: [],
  notifications: [],
};

export default user;
