import request from "supertest";
import app from "../../src/app";
import { CreateQuizPost } from "../../src/controllers/createQuiz";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import QuizModel from "../../src/models/Quiz";
import UserModel from "../../src/models/User";
import mockPlatform from "../mocks/mockPlatform";
import mockQuiz from "../mocks/mockQuiz";
import mockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`create quiz test`, () => {
  let mockRequest: CreateQuizPost;
  let mockQuizModel: QuizModel;
  let mockUsermodel: UserModel;
  let mockPlatformModel: PlatformModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockQuizModel = new QuizModel(mockQuiz);
    mockUsermodel = new UserModel(mockUser);
    mockPlatformModel = new PlatformModel(mockPlatform);

    QuizModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockQuizModel);
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUsermodel);
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);

    mockPlatformModel["owner"] = mockUsermodel.getUsername();
    mockPlatformModel.quizzes = [];
    
    mockRequest = {
      quizTitle: mockQuiz.title,
      platformTitle: mockPlatform.title,
      timeLimit: 60,
      description: "some description",
      questions: mockQuiz.questions,
      correctAnswers: mockQuiz.correctAnswers,
    };

    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);
    QuizModel.prototype.save = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUsermodel);
  });

  test(`Should create quiz on success if user is owner`, async () => {
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should create quiz on success if user is moderator`, async () => {
    mockPlatformModel["owner"] = "somerandomowner";
    mockPlatformModel.moderators = [mockUsermodel.getUsername()];

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should give 400 error if quiz already exists`, async () => {
    mockPlatformModel.quizzes.push(mockRequest.quizTitle);

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should give 400 error if platform doesn't exist`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 403 if user perms fail`, async () => {
    mockPlatformModel.bannedUsers = [mockUser.username];
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });

  test(`Should give 400 error if schema validation fails`, async () => {
    mockRequest.quizTitle = "";
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should give 500 error if retrieve fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should give 500 error if user retrieve fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should give 500 error if user doesn't exist`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should give 500 error if save fails`, async () => {
    QuizModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/quizzes/").send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});
