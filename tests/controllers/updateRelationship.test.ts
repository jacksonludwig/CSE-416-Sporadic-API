import request from "supertest";
import app from "../../src/app";
import { Action, UpdateRelationshipRequest } from "../../src/controllers/updateRelationship";
import { validateToken } from "../../src/middleware/auth";
import UserModel from "../../src/models/User";
import mockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`subscribe user tests`, () => {
  let mockUserModel: UserModel;
  let mockTargetUserModel: UserModel;
  let mockRequest: UpdateRelationshipRequest;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockUserModel = new UserModel(mockUser);

    const mockTargetUser = mockUser;
    mockTargetUser.username = "otheruser";
    mockTargetUserModel = new UserModel(mockTargetUser);

    mockRequest = {
      targetUsername: mockTargetUser.username,
      action: "add" as Action,
    };

    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockResolvedValueOnce(mockTargetUserModel);

    UserModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send back 204 on success when adding`, async () => {
    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 204 on success when removing`, async () => {
    mockRequest.action = "remove" as Action;
    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));

    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of target user fails`, async () => {
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockRejectedValueOnce(new Error("mock err"));

    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if schema validation fails`, async () => {
    mockRequest.action = "something" as Action;

    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if target user doesn't exist`, async () => {
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockResolvedValueOnce(null);

    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 500 if user doesn't exist`, async () => {
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockTargetUserModel);

    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if is already friend with target`, async () => {
    mockUserModel.friends.push(mockTargetUserModel.getUsername());
    UserModel.retrieveByUsername = jest
      .fn()
      .mockResolvedValueOnce(mockUserModel)
      .mockResolvedValueOnce(mockTargetUserModel);

    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if user is not friend with target and trying to remove`, async () => {
    mockUserModel.friends = [];
    mockRequest.action = "remove" as Action;
    const response = await request(app).put(`/users/updateRelationship`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
