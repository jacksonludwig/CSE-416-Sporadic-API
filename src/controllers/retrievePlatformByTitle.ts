import { Request, Response } from "express";
import PlatformModel from "../models/Platform";

const retrieveByTitle = async (req: Request, res: Response) => {
  try {
    const platform = await PlatformModel.retrieveByTitle(req.params.platformTitle.toLowerCase());

    return platform ? res.status(200).send(platform.toJSON()) : res.sendStatus(400);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveByTitle;
