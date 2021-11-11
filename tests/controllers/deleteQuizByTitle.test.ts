import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import QuizModel from "../../src/models/Quiz";
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
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockPlatform.owner = mockUser.username;
    mockPlatform.quizzes[0] = mockQuiz.title;

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    QuizModel.prototype.delete = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValue(new PlatformModel(mockPlatform));
    PlatformModel.prototype.update = jest.fn().mockResolvedValue(null);
  });

  test(`Should send back 204 on success`, async () => {
    const model = new PlatformModel(mockPlatform);
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValue(model);
    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
    expect(model.update).toHaveBeenCalled();
    expect(model.quizzes.includes(mockQuiz.title)).toBe(false);
  });

  test(`Should send back 403 if user not mod or owner`, async () => {
    mockPlatform.owner = "notrightuser";
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValue(new PlatformModel(mockPlatform));

    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });

  test(`Should send back 500 if lookup of quiz fails`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if update of platform fails`, async () => {
    PlatformModel.prototype.update = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of platform fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no quiz is returned`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if no platform is returned`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).delete(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
