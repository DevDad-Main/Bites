import { catchAsync, logger } from "devdad-express-utils";
import { Request, Response } from "express";

export const restaurantController = {
  fetch: catchAsync(async (req: Request, res: Response) => {
    logger.info("Restaurant Fetch Handler Called.");
    res.send("Hello World");
  }),
};
