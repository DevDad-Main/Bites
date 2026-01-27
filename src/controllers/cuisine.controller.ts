import { catchAsync, logger } from "devdad-express-utils";
import { Request, Response } from "express";

export const cuisineController = {
  fetch: catchAsync(async (req: Request, res: Response) => {
    logger.info("Cuisine Fetch Handler Called.");
    res.send("Hello World");
  }),
};
