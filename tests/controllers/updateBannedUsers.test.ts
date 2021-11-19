import request from "supertest";
import app from "../../src/app";
import { UpdateBannedUsersRequest } from "../../src/controllers/updateBannedUsers";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel from "../../src/models/Platform";
import UserModel from "../../src/models/User";
import mockPlatform from "../mocks/mockPlatform";
import mockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`update banned user tests`, () => {
  let mockUserModel: UserModel;
  let mockTargetUserModel: UserModel;
  let mockRequest: UpdateBannedUsersRequest;
  let mockPlatformModel: PlatformModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockUserModel = new UserModel(mockUser);

    const mockTargetUser = mockUser;
    mockTargetUser.username = "otheruser";
    mockTargetUserModel = new UserModel(mockTargetUser);

    mockRequest = {
      targetUsername: mockTargetUser.username,
      action: "add" as Sporadic.UpdateAction,
    };

    mockPlatformModel = new PlatformModel(mockPlatform);
    mockPlatformModel["owner"] = mockUser.username;

    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockResolvedValueOnce(mockTargetUserModel);

    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);
    PlatformModel.prototype.update = jest.fn().mockResolvedValue(null);
  });

  test(`Should send back 204 on success when adding`, async () => {
    mockPlatformModel.bannedUsers = [];
    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 204 on success when removing`, async () => {
    mockPlatformModel.bannedUsers = [mockTargetUserModel["username"]];
    mockRequest.action = "remove" as Sporadic.UpdateAction;
    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of target user fails`, async () => {
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockRejectedValueOnce(new Error("mock err"));

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if schema validation fails`, async () => {
    mockRequest.action = "something" as Sporadic.UpdateAction;

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if target user doesn't exist`, async () => {
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockResolvedValueOnce(null);

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 500 if user doesn't exist`, async () => {
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockTargetUserModel);

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if is already moderator`, async () => {
    mockPlatformModel.bannedUsers.push(mockTargetUserModel.getUsername());

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user is not moderator and trying to remove`, async () => {
    mockPlatformModel.bannedUsers = [];
    mockRequest.action = "remove" as Sporadic.UpdateAction;
    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if platform doesn't exist`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 403 if user is not mod or owner`, async () => {
    mockPlatformModel["owner"] = "";
    mockPlatformModel.bannedUsers = [];
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);

    const response = await request(app)
      .put(`/platforms/${mockPlatform.title}/updateBannedUsers`)
      .send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });
});
