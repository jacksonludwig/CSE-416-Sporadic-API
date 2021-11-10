import { ObjectId } from "mongodb";
import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import QuizModel from "../../src/models/Quiz";
import UserModel, { User } from "../../src/models/User";
import mockQuiz from "../mocks/mockQuiz";
import globalMockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = globalMockUser.username;
    next();
  }),
}));

describe(`start quiz route tests`, () => {
  let mockTitle: string;
  let mockPlatform: string;
  let mockUser: User;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform".toLowerCase();

    mockQuiz.title = mockTitle;
    mockQuiz.platform = mockPlatform;
    mockQuiz.timeLimit = 10000;
    mockQuiz.scores = [];

    mockUser = {
      username: globalMockUser.username,
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
      quizzesTaken: [] as ObjectId[],
    } as User;

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
    QuizModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send back 204 on success`, async () => {
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(mockQuiz.scores.length).toBe(1);
    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 500 if lookup of quiz fails`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if update of quiz fails`, async () => {
    QuizModel.prototype.update = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no quiz is returned`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user already started quiz`, async () => {
    mockQuiz.scores[0] = { user: mockUser.username, score: 0, timeStarted: new Date() };
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 500 if no user is returned`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});