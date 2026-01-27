import { catchAsync, logger, sendSuccess } from "devdad-express-utils";
import { Request, Response } from "express";
import { Restaurant } from "../schemas/restaurant.schema.js";
import { initializeRedisClient } from "../utils/redisClient.utils.js";

export const restaurantController = {
  fetch: catchAsync(async (req: Request, res: Response) => {
    const data = req.body as Restaurant;
    logger.info("Restaurant Fetch Handler Called.");

    const client = await initializeRedisClient();

    return sendSuccess(res, data, "Data Successfully Posted", 200);
  }),
};
