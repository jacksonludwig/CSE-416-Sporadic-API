import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import QuizModel, { Quiz, QuizFilter } from "../../src/models/Quiz";
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

describe(`get all quizzes route`, () => {
  let mockQueryParams: QuizFilter;
  let mockResponse: { totalItems: number; items: Quiz[] };
  let mockQuizModel: QuizModel;
  let mockUsermodel: UserModel;
  let mockPlatformModel: PlatformModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockQuizModel = new QuizModel(mockQuiz);
    mockUsermodel = new UserModel(mockUser);
    mockPlatformModel = new PlatformModel(mockPlatform);

    mockQueryParams = {
      platform: mockPlatform.title,
    };

    mockResponse = { totalItems: 1, items: [mockQuiz] };

    QuizModel.retrieveAll = jest.fn().mockResolvedValueOnce(mockResponse);
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUsermodel);
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);
  });

  test(`Should send back quizzes on success`, async () => {
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).toBe(JSON.stringify(mockResponse));
  });

  test(`Should send back 500 if lookup of quizzes fail`, async () => {
    QuizModel.retrieveAll = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of platform fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if user is null`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if platofrm is null`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 403 if user perms fail`, async () => {
    mockPlatformModel.bannedUsers = [mockUser.username];
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });

  test(`Should send back 400 if schema validation fails`, async () => {
    const response = await request(app).get(
      `/quizzes?platform=${mockQueryParams.platform}&sortDirection=0`,
    );

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
