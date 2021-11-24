import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import QuizModel from "../../src/models/Quiz";
import UserModel from "../../src/models/User";
import mockPlatform from "../mocks/mockPlatform";
import mockQuiz from "../mocks/mockQuiz";
import mockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`get quiz by title/platform route test`, () => {
  let mockQuizModel: QuizModel;
  let mockUsermodel: UserModel;
  let mockPlatformModel: PlatformModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockQuizModel = new QuizModel(mockQuiz);
    mockUsermodel = new UserModel(mockUser);
    mockPlatformModel = new PlatformModel(mockPlatform);

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockQuizModel);
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUsermodel);
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);
  });

  test(`Should send back quiz on success`, async () => {
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).toBe(JSON.stringify(mockQuizModel.toJSON()));
  });

  test(`Should send back quiz with score on success`, async () => {
    mockQuizModel.scores = [{ user: mockUser.username, score: 1, timeStarted: new Date(1) }];
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).toBe(
      JSON.stringify({ ...mockQuizModel.toJSON(), score: 1 }),
    );
  });

  test(`Should send back 500 if lookup fails`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no quiz is returned`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of platform fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if user is null`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if platform is null`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 403 if user perms fail`, async () => {
    mockPlatformModel.bannedUsers = [mockUser.username];
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });
});
