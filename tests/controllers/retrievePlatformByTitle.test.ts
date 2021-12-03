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

describe(`get platform by title tests`, () => {
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
    PlatformModel.retrieveByTitleWithPinned = jest.fn().mockResolvedValueOnce(mockPlatformModel);
  });

  test(`Should send platform on success`, async () => {
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).toStrictEqual(JSON.stringify(mockPlatformModel.toJSON()));
  });

  test(`Should send back 500 if lookup fails`, async () => {
    PlatformModel.retrieveByTitleWithPinned = jest
      .fn()
      .mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no platform is returned`, async () => {
    PlatformModel.retrieveByTitleWithPinned = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 403 if user perms fail`, async () => {
    mockPlatformModel.bannedUsers = [mockUser.username];
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of platform fails`, async () => {
    PlatformModel.retrieveByTitleWithPinned = jest
      .fn()
      .mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if user is null`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});
