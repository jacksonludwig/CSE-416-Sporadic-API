import request from "supertest";
import app from "../../src/app";
import { CreateQuizPost } from "../../src/controllers/createQuiz";
import QuizModel from "../../src/models/Quiz";
import { Quiz } from "../../src/models/Quiz";

const username = "john1";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = username;
    next();
  }),
}));

describe(`create quiz test`, () => {
  let mockQuiz: Quiz;
  let mockRequest: CreateQuizPost;
  let mockTitle: string;
  let mockPlatform: string;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform";

    mockQuiz = {
      title: mockTitle,
      platform: mockPlatform,
      isTimed: false,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
    };

    mockRequest = {
      title: mockTitle,
      platform: mockPlatform,
      isTimed: false,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
    };

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    QuizModel.prototype.save = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should create quiz on success`, async () => {
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(QuizModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platform, mockRequest.title);
    expect(QuizModel.prototype.save).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should give 400 error if quiz already exists`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(QuizModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.platform, mockRequest.title);
    expect(response.statusCode).toBe(400);
  });

  test(`Should give 400 error if schema validation fails`, async () => {
    mockRequest.title = "";
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should give 500 error if retrieve fails`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });

  test(`Should give 500 error if save fails`, async () => {
    QuizModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });
});
