import { ObjectId } from "mongodb";
import request from "supertest";
import app from "../../src/app";
import { SubmitQuizPost } from "../../src/controllers/submitQuiz";
import { validateToken } from "../../src/middleware/auth";
import QuizModel from "../../src/models/Quiz";
import UserModel, { User } from "../../src/models/User";
import mockQuiz from "../mocks/mockQuiz";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`submit quiz route tests`, () => {
  let mockTitle: string;
  let mockPlatform: string;
  let mockAnswers: SubmitQuizPost;
  let mockUser: User;
  let mockStartDate: Date;

  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2020, 3, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform".toLowerCase();

    mockStartDate = new Date(2020, 3, 1);

    mockAnswers = { answers: [0, 1] };

    mockQuiz.title = mockTitle;
    mockQuiz.platform = mockPlatform;
    mockQuiz.timeLimit = 10000;

    mockUser = {
      username: "testuser",
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
      quizzesTaken: [] as ObjectId[],
    } as User;

    mockQuiz.scores[0] = {
      user: mockUser.username,
      timeStarted: mockStartDate,
    };

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
    QuizModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send back correct answers and amount correct on success`, async () => {
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ correctAnswers: [0, 1], totalCorrect: 2 });
  });

  test(`Should send back correct answers and amount correct on success with incorrect answers`, async () => {
    mockAnswers.answers = [1, 3];
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ correctAnswers: [0, 1], totalCorrect: 0 });
  });

  test(`Should send back 500 if lookup of quiz fails`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no quiz is returned`, async () => {
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user took quiz already`, async () => {
    mockQuiz.scores[0].score = 0;
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if submission period passed`, async () => {
    mockQuiz.scores[0].timeStarted = new Date(2000, 3, 1);
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));

    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user did not start quiz`, async () => {
    mockQuiz.scores = [];
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));

    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 500 if no user is returned`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if schema fails to validate`, async () => {
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({});

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
