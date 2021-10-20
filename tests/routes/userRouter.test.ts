import request from "supertest";
import app from "../../src/index";
import { UserPostData, cognitoClient } from "../../src/routes/userRouter";
import DbClient from "../../src/utils/DbClient";

jest.mock("@aws-sdk/client-cognito-identity-provider");
jest.mock("../../src/utils/DbClient");

describe(`userRouter unit tests`, () => {
  let mockRequest: UserPostData;

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

    cognitoClient.send = jest.fn().mockResolvedValueOnce(mockSendResponse);
    DbClient.insertOne = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send 404 if schema validation fails`, async () => {
    mockRequest.username = "";

    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(404);
  });

  test(`Should send 200 with cognito id if all succeeds`, async () => {
    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      cognitoId: mockSendResponse.UserSub,
    });
  });

  test(`Should send 500 if congito fails`, async () => {
    const mockErr = new Error("this is a mock error");
    cognitoClient.send = jest.fn().mockRejectedValueOnce(mockErr);
    const response = await request(app).post("/users/").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });
});
