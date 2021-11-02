import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import QuizModel, { Quiz } from "../../src/models/Quiz";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`get quiz by title/platform route test`, () => {
  let mockQuiz: Quiz;
  let mockTitle: string;
  let mockPlatform: string;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform".toLowerCase();

    mockQuiz = {
      title: mockTitle,
      platform: mockPlatform,
      isTimed: false,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
    };

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
  });

  test(`Should send back quiz on success`, async () => {
    const response = await request(app).get(`/quizzes/somePlatform/${mockQuiz.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(mockQuiz);
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
});
