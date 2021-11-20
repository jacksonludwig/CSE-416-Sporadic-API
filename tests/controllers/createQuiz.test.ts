import request from "supertest";
import app from "../../src/app";
import { CreateQuizPost } from "../../src/controllers/createQuiz";
import PlatformModel, { Platform } from "../../src/models/Platform";
import QuizModel from "../../src/models/Quiz";
import mockQuiz from "../mocks/mockQuiz";

const username = "john1";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = username;
    next();
  }),
}));

describe(`create quiz test`, () => {
  let mockRequest: CreateQuizPost;
  let mockTitle: string;
  let mockPlatform: string;
  let mockPlatformObj: Platform;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform".toLowerCase();

    mockPlatformObj = {
      title: mockPlatform,
      owner: username,
      description: "descript",
      subscribers: [],
      moderators: [],
      quizzes: [],
      bannedUsers: [],
    };

    mockRequest = {
      quizTitle: mockTitle,
      platformTitle: mockPlatform,
      timeLimit: 60,
      description: "some description",
      questions: mockQuiz.questions,
      correctAnswers: mockQuiz.correctAnswers,
    };

    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(mockPlatformObj));
    QuizModel.prototype.save = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should create quiz on success if user is owner`, async () => {
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platformTitle);
    expect(QuizModel.prototype.save).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should create quiz on success if user is moderator`, async () => {
    mockPlatformObj.owner = "somerandomowner";
    mockPlatformObj.moderators.push(username);
    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(mockPlatformObj));

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platformTitle);
    expect(QuizModel.prototype.save).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should give 400 error if quiz already exists`, async () => {
    const plat = new PlatformModel(mockPlatformObj);
    plat.quizzes.push(mockTitle);
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(plat);

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platformTitle);
    expect(response.statusCode).toBe(400);
  });

  test(`Should give 400 error if platform doesn't exist`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platformTitle);
    expect(response.statusCode).toBe(400);
  });

  test(`Should give 403 error if user is not platform owner or moderator`, async () => {
    mockPlatformObj.owner = "somerandomowner";
    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(mockPlatformObj));

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platformTitle);
    expect(response.statusCode).toBe(403);
  });

  test(`Should give 400 error if schema validation fails`, async () => {
    mockRequest.quizTitle = "";
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should give 500 error if retrieve fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });

  test(`Should give 500 error if save fails`, async () => {
    QuizModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });
});
