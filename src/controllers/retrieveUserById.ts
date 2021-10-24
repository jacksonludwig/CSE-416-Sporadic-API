import { Request, Response } from "express";
import UserModel from "../models/User";

const retrieveById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.retrieveById(req.params.id);

    return user ? res.status(200).send(user.toJSON()) : res.sendStatus(400);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveById;
