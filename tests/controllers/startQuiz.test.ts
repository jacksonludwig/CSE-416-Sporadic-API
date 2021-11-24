import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import QuizModel from "../../src/models/Quiz";
import UserModel, { User } from "../../src/models/User";
import mockQuiz from "../mocks/mockQuiz";
import globalMockUser from "../mocks/mockUser";
import globalMockPlatform from "../mocks/mockPlatform";

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
    jest.spyOn(console, "log").mockImplementationOnce(() => null);
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
    } as User;

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
    QuizModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(globalMockPlatform));
  });

  test(`Should send back 200 and quiz object on success`, async () => {
    const quizModel = new QuizModel(mockQuiz);
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(quizModel);
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(mockQuiz.scores.length).toBe(1);
    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(quizModel.toJSONWithQuestions());
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

  test(`Should send back 403 if user is banned from platform`, async () => {
    const mockPlat = new PlatformModel(globalMockPlatform);
    mockPlat.bannedUsers = [globalMockUser.username];
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlat);
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });

  test(`Should send back 500 if no user is returned`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if no platform is returned`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post(`/quizzes/${mockPlatform}/${mockQuiz.title}/start`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});
