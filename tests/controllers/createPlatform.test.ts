import request from "supertest";
import app from "../../src/app";
import { CreatePlatformPost } from "../../src/controllers/createPlatform";
import PlatformModel, { Platform } from "../../src/models/Platform";

const username = "john1";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = username;
    next();
  }),
}));

describe(`create platform test`, () => {
  let mockPlatform: Platform;
  let mockRequest: CreatePlatformPost;
  let mockTitle: string;
  let mockDescription: string;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockTitle = "mocktitle";
    mockDescription = "This is a mock description";

    mockPlatform = {
      title: mockTitle,
      description: mockDescription,
      owner: username,
      moderators: [username],
      bannedUsers: [],
      subscribers: [],
      quizzes: [],
    };

    mockRequest = {
      title: mockTitle,
      description: mockDescription,
    };

    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.prototype.save = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should create platform on success`, async () => {
    const response = await request(app).post("/platforms/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.title);
    expect(PlatformModel.prototype.save).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should give 400 error if platform already exists`, async () => {
    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(mockPlatform));
    const response = await request(app).post("/platforms/").send(mockRequest);

    expect(PlatformModel.retrieveByTitle).toHaveBeenCalledWith(mockRequest.title);
    expect(response.statusCode).toBe(400);
  });

  test(`Should give 400 error if schema validation fails`, async () => {
    mockRequest.title = "";
    const response = await request(app).post("/platforms/").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should give 500 error if retrieve fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/platforms/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });

  test(`Should give 500 error if save fails`, async () => {
    PlatformModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/platforms/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });
});
