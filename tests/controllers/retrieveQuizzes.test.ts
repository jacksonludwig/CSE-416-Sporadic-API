import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import QuizModel, { Quiz, QuizFilter } from "../../src/models/Quiz";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`get all quizzes route`, () => {
  let mockQuiz: Quiz;
  let mockTitle: string;
  let mockPlatform: string;
  let mockQueryParams: QuizFilter;
  let mockResponse: { totalItems: number; items: Quiz[] };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform".toLowerCase();

    mockQueryParams = {
      platform: mockPlatform,
    };

    mockQuiz = {
      title: mockTitle,
      platform: mockPlatform,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
    } as Quiz;

    mockResponse = { totalItems: 1, items: [mockQuiz] };

    QuizModel.retrieveAll = jest.fn().mockResolvedValueOnce(mockResponse);
  });

  test(`Should send back quizzes on success`, async () => {
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(mockResponse);
  });

  test(`Should send back 500 if lookup fails`, async () => {
    QuizModel.retrieveAll = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/quizzes?platform=${mockQueryParams.platform}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});
