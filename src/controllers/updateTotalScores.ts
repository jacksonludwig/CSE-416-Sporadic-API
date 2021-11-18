import { Request, Response } from "express";
import PlatformModel from "../models/Platform";

const updateTotalScores = async (req: Request, res: Response) => {
  try {
    const username = res.locals.authenticatedUser;
    
    const platform = await PlatformModel.retrieveByTitle(req.params.platformTitle);

    const meanScore = 
      platform?.getTotalScores.reduce((previousValue, currentValue) => previousValue + currentValue))
  }
}

export default updateTotalScores;