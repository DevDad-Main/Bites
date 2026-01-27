import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controllers.js";
import { validate } from "../middleware/validation.middleware.js";
import { RestaurantPostSchema } from "../schemas/restaurant.schema.js";

const restaurantRouter = Router();

restaurantRouter.post(
  "/fetch",
  validate(RestaurantPostSchema),
  restaurantController.fetch,
);

export default restaurantRouter;
