import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import QuizModel from "../../src/models/Quiz";
import UserModel from "../../src/models/User";
import mockQuiz from "../mocks/mockQuiz";
import mockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`add comment to quiz by title/platform route test`, () => {
  let mockQuizModel: QuizModel;
  let mockUserModel: UserModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockQuizModel = new QuizModel(mockQuiz);
    mockUserModel = new UserModel(mockUser);

    mockQuizModel.scores.push({
      user: mockUser.username,
      score: 1,
      timeStarted: new Date(),
    });

    mockQuizModel.comments = [];

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockQuizModel);
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUserModel);
    QuizModel.prototype.update = jest.fn().mockResolvedValue(null);
  });

  test(`Should send back 204 on success`, async () => {
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 500 if lookup of quiz fails`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if update of quiz fails`, async () => {
    QuizModel.prototype.update = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no quiz is returned`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user didn't take quiz`, async () => {
    mockQuizModel.scores = [];

    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user already commented`, async () => {
    mockQuizModel.comments.push({
      user: mockUser.username,
      text: "",
      date: new Date(),
    });

    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 500 if no user is returned`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({ commentText: "a comment" });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if schema fails to validate`, async () => {
    const response = await request(app)
      .put(`/quizzes/${mockQuiz.platform}/${mockQuiz.title}/comment`)
      .send({});

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
