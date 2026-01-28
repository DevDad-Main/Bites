import { catchAsync, logger, sendSuccess } from "devdad-express-utils";
import { NextFunction, Request, Response } from "express";
import { Restaurant } from "../schemas/restaurant.schema.js";
import { initializeRedisClient } from "../utils/redisClient.utils.js";
import { nanoid } from "nanoid";
import { restaurantKeyById } from "../utils/getKeys.utils.js";

export const restaurantController = {
  create: catchAsync(async (req: Request, res: Response) => {
    logger.info("Restaurant Fetch Handler Called.");

    const data = req.body as Restaurant;
    const client = await initializeRedisClient();
    const id = nanoid();
    const restaurantKey = restaurantKeyById(id);

    //NOTE: We can't store the array as Hash don't allow lists, only simple data. (Fix with Sets later)
    const hashedData = { id, name: data.name, location: data.location };
    const redisDataToStore = await client.hSet(restaurantKey, hashedData);
    logger.info(`Redis Data Cached: ${hashedData}`);

    return sendSuccess(res, redisDataToStore, "Data Successfully Posted", 200);
  }),

  fetch: async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { restaurantId } = req.params;
    } catch (error: any) {
      logger.error(
        error.message || "Something went wrong trying to fetch restaurant data",
        { error },
      );
      next(error);
    }
  },
};
