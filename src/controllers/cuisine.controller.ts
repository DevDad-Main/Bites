import {
  cuisineKey,
  cuisinesKey,
  restaurantKeyById,
} from "@/utils/getKeys.utils.js";
import { initializeRedisClient } from "@/utils/redisClient.utils.js";
import {
  catchAsync,
  logger,
  sendError,
  sendSuccess,
} from "devdad-express-utils";
import { NextFunction, Request, Response } from "express";

export const cuisineController = {
  fetchAllCuisines: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const client = await initializeRedisClient();

        const cuisines = await client.sMembers(cuisinesKey);
        if (cuisines.length === 0) {
          return sendError(res, "No Cuisines Found", 404, [
            "No cuisines data found. Please ensure you have submitted some restaurant data before trying to fetch data.",
          ]);
        }

        return sendSuccess(res, cuisines, "Cuisines successfully fetched", 200);
      } catch (error: any) {
        logger.error(
          error.message || "Something went wrong while fetching cuisine data..",
          { error },
        );
        next(error);
      }
    },
  ),

  fetchAllRestaurantsByCuisine: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { cuisine } = req.params;

        if (!cuisine) {
          return sendError(res, "Missing cuisine from parameters", 400, [
            "Please make sure you have specified a cuisine in the Request Parameters.",
          ]);
        }

        const client = await initializeRedisClient();
        const restaurantIds = await client.sMembers(cuisineKey(cuisine));
        const restaurants = await Promise.all(
          restaurantIds.map((id) => client.hGet(restaurantKeyById(id), "name")),
        );

        if (restaurants.length === 0) {
          return sendError(
            res,
            "No restaurants found for this id. Please ensure you have submitted data before trying to fetch",
            404,
            [
              "No restaurants found for this cuisine",
              "Please ensure you have submitted data before fetching",
            ],
          );
        }

        return sendSuccess(
          res,
          restaurants,
          "Restaurants successfully fetched for the specified cuisine",
          200,
        );
      } catch (error: any) {
        logger.error("Failed to fetch restaurants by cuisine name");
        next(error);
      }
    },
  ),
};
