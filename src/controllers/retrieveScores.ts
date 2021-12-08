import { Request, Response } from "express";
import PlatformModel from "../models/Platform";

const retrieveScores = async (req: Request, res:Response) => {
  
  const {platformTitle} = req.params;

  const platform = await PlatformModel.retrieveByTitle(platformTitle);
  if (!platform) return res.sendStatus(400);

  try {

    const { scores } = platform

    return res.send(scores);

  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveScores;

