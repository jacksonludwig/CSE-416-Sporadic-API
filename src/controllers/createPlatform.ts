import { Request, Response } from "express";
import Joi from "joi";

const createPlatformSchema = Joi.object({
  title: Joi.string().alphanum().min(3).max(100),
});

const createPlatform = async (req: Request, res: Response) => {};

export default createPlatform;
