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
  /**
   * @swagger
   * /api/v1/cuisines/fetch:
   *   get:
   *     summary: Fetch all available cuisines
   *     tags: [Cuisines]
   *     responses:
   *       200:
   *         description: Cuisines fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  fetchAllCuisines: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const client = await initializeRedisClient();

        const cuisines = await client.sMembers(cuisinesKey);
        if (!cuisines || cuisines.length === 0) {
          return sendSuccess(res, [], "No cuisines found", 200);
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

  /**
   * @swagger
   * /api/v1/cuisines/fetch/{cuisine}:
   *   get:
   *     summary: Fetch restaurants by cuisine type
   *     tags: [Cuisines]
   *     parameters:
   *       - in: path
   *         name: cuisine
   *         required: true
   *         schema:
   *           type: string
   *         description: Cuisine type
   *         example: italian
   *     responses:
   *       200:
   *         description: Restaurants fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Bad request - invalid cuisine parameter
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  fetchAllRestaurantsByCuisine: catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { cuisine } = req.params;

        if (!cuisine || typeof cuisine !== 'string' || cuisine.trim().length === 0) {
          return sendError(res, "Valid cuisine parameter is required", 400, [
            "Please make sure you have specified a cuisine in the Request Parameters.",
          ]);
        }

        const client = await initializeRedisClient();
        const restaurantIds = await client.sMembers(cuisineKey(cuisine));
        
        if (!restaurantIds || restaurantIds.length === 0) {
          return sendSuccess(res, [], "No restaurants found for this cuisine", 200);
        }

        const restaurants = await Promise.all(
          restaurantIds.map((id) => client.hGet(restaurantKeyById(id), "name")),
        );

        const validRestaurants = restaurants.filter(name => name !== null) as string[];

        if (validRestaurants.length === 0) {
          return sendSuccess(res, [], "No restaurants found for this cuisine", 200);
        }

        return sendSuccess(
          res,
          validRestaurants,
          "Restaurants successfully fetched for the specified cuisine",
          200,
        );
      } catch (error: any) {
        logger.error("Failed to fetch restaurants by cuisine name", { error });
        next(error);
      }
    },
  ),
};
