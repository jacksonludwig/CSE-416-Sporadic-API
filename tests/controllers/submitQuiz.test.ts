import request from "supertest";
import app from "../../src/app";
import { SubmitQuizPost } from "../../src/controllers/submitQuiz";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import QuizModel from "../../src/models/Quiz";
import UserModel, { User } from "../../src/models/User";
import mockQuiz from "../mocks/mockQuiz";
import globalMockuser from "../mocks/mockUser";
import mockPlatform from "../mocks/mockPlatform";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = globalMockuser.username;
    next();
  }),
}));

describe(`submit quiz route tests`, () => {
  let mockTitle: string;
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
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";

    mockStartDate = new Date(2020, 3, 1);

    mockAnswers = { answers: [0, 1] };

    mockQuiz.title = mockTitle;
    mockQuiz.platform = mockPlatform.title;
    mockQuiz.timeLimit = 10000;

    mockUser = {
      username: globalMockuser.username,
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
    } as User;

    mockQuiz.scores[0] = {
      user: mockUser.username,
      timeStarted: mockStartDate,
      vote: Sporadic.Vote.None,
    };

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
    QuizModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(mockPlatform));
  });

  test(`Should send back correct answers and amount correct on success`, async () => {
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      totalCorrect: 2,
      submitted: true,
    });
  });

  test(`Should send back amount correct on success with incorrect answers`, async () => {
    mockAnswers.answers = [1, 3];
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      totalCorrect: 0,
      submitted: true,
    });
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

  test(`Should send back 200 if user took quiz already`, async () => {
    mockQuiz.scores[0].score = 0;
    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
  });

  test(`Should send back 200 if submission period passed`, async () => {
    mockQuiz.scores[0].timeStarted = new Date(2000, 3, 1);
    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));

    const response = await request(app)
      .post(`/quizzes/${mockPlatform}/${mockQuiz.title}/submit`)
      .send({ answers: mockAnswers.answers });

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
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

  test(`Should send back 500 if no quiz is returned`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
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
