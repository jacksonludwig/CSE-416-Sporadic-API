import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import QuizModel, { Quiz } from "../../src/models/Quiz";
import mockUser from "../mocks/mockUser";


jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`get quiz feed route`, () => {
  let mockQuiz1: Quiz;
  let mockQuiz2: Quiz;
  let mockTitle: string;
  let mockPlatform1: string;
  let mockPlatform2: string;
  let mockResponse: { totalItems: number; items: Quiz[] };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";
    mockPlatform1 = "mockPlatform1".toLowerCase();
    mockPlatform2 = "mockPlatform2".toLowerCase();

    mockUser.subscriptions = ["mockplatform1", "mockplatform2"];


    mockQuiz1 = {
      title: "plat1Quiz",
      platform: mockPlatform1,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
    } as Quiz;

    mockQuiz2 = {
      title: "plat2Quiz",
      platform: mockPlatform2,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
    } as Quiz;

    mockResponse = { totalItems: 2, items: [mockQuiz1, mockQuiz2] };

    QuizModel.retrieveAll = jest.fn().mockResolvedValueOnce(mockResponse);
  });

  test(`Should send back quizzes on success`, async () => {
    const response = await request(app).get(`/quizzes/feed`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(mockResponse);
  });

});
