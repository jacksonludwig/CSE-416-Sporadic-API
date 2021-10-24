import request from "supertest";
import app from "../../src/app";
import { CreateUserPost } from "../../src/controllers/createUser";
import UserModel from "../../src/models/User";
import { cognitoClient } from "../../src/routes/userRouter";

jest.mock("@aws-sdk/client-cognito-identity-provider");

describe(`create user route test`, () => {
  let mockRequest: CreateUserPost;
  let mockObjectId: string;

  const mockSendResponse = {
    $metadata: {
      httpStatusCode: 200,
    },
    UserConfirmed: false,
    UserSub: "kdlaid2j-d8-2ff-elm-fu8m",
  };

  beforeEach(() => {
    mockRequest = {
      username: "john1",
      email: "john1@gmail.com",
      password: "password123",
    };

    mockObjectId = "6171a986cd40f34535c91e8d";

    cognitoClient.send = jest.fn().mockResolvedValueOnce(mockSendResponse);
    UserModel.prototype.save = jest.fn().mockResolvedValueOnce(mockObjectId);
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send 400 if schema validation fails`, async () => {
    mockRequest.username = "";

    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should send 400 if username already exists`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce({});

    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should send 200 with cognito id if all succeeds`, async () => {
    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(200);
    expect(UserModel.retrieveByUsername).toHaveBeenCalled();
    expect(UserModel.prototype.save).toHaveBeenCalled();
    expect(response.body).toStrictEqual({
      _id: mockObjectId,
    });
  });

  test(`Should send 500 if congito fails`, async () => {
    const mockErr = new Error("this is a mock error");
    cognitoClient.send = jest.fn().mockRejectedValueOnce(mockErr);
    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(500);
    expect(UserModel.retrieveByUsername).toHaveBeenCalled();
  });
});
