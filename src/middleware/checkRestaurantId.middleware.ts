import { Request, Response, NextFunction } from "express";
import { initializeRedisClient } from "../utils/redisClient.utils.js";
import { restaurantKeyById } from "@/utils/getKeys.utils.js";
import { sendError } from "devdad-express-utils";

/**
 *
 * @param {Request} req Express Request which expects an additional restaurantId property.
 * @param {Response} res Default Express Response
 * @param {NextFunction} next Default Express next method used to pass on controller to the next middleware/handler
 * @returns control back over to the next middleware/handler if the {restaurantId} from the req.params exists in the Redis DB.
 */
export const checkRestaurantExists = async (
  req: Request<{ restaurantId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return sendError(res, "No Restaurant Id provided in parameteres", 400, [
      "Please ensure you are providing a Restaurant ID in the parameters",
    ]);
  }

  const client = await initializeRedisClient();
  const restaurantKey = restaurantKeyById(restaurantId);
  const exists = await client.exists(restaurantKey);

  if (!exists) {
    return sendError(res, "Restaurant Not Found.", 404, [
      "Restaurant not found with the given key.",
      "Check your Restaurant ID again or ensure you have cached data to Redis first.",
    ]);
  }

  next();
};
