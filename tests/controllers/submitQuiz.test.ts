import { ObjectId } from "mongodb";
import request from "supertest";
import app from "../../src/app";
import { SubmitQuizPost } from "../../src/controllers/submitQuiz";
import { validateToken } from "../../src/middleware/auth";
import QuizModel, { Quiz } from "../../src/models/Quiz";
import UserModel, { User } from "../../src/models/User";
import globalMockQuiz from "../mocks/mockQuiz";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`submit quiz route tests`, () => {
  let mockQuiz: Quiz;
  let mockTitle: string;
  let mockPlatform: string;
  let mockAnswers: SubmitQuizPost;
  let mockUser: User;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    mockTitle = "mocktitle";
    mockPlatform = "mockPlatform".toLowerCase();

    mockAnswers = { answers: [0, 1] };

    mockQuiz = {
      title: mockTitle,
      platform: mockPlatform,
      timeLimit: 5,
      upvotes: 2,
      downvotes: 3,
      description: "some description",
      _id: globalMockQuiz._id,
      questions: [
        {
          body: "this is a question",
          answers: ["0", "1", "2", "3"],
        },
        {
          body: "this is another question",
          answers: ["0", "1", "2", "3"],
        },
      ],
      correctAnswers: [0, 1],
      scores: [],
      comments: [],
    };

    mockUser = {
      username: "testuser",
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
      quizzesTaken: [] as ObjectId[],
    } as User;

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(new QuizModel(mockQuiz));
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
    UserModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
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
    mockUser.quizzesTaken.push(mockQuiz._id as ObjectId);
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
