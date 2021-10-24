import { Request, Response } from "express";
import UserModel from "../models/User";

const retrieveByUsername = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.retrieveByUsername(req.params.username);

    return user ? res.status(200).send(user.toJSON()) : res.sendStatus(400);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveByUsername;
