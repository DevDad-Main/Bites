import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controllers.js";
import { validate } from "../middleware/validation.middleware.js";
import { RestaurantPostSchema } from "../schemas/restaurant.schema.js";

const restaurantRouter: Router = Router();

restaurantRouter.post(
  "/create",
  validate(RestaurantPostSchema),
  restaurantController.create,
);

restaurantRouter.get("/:restaurantId", restaurantController.fetch);

export default restaurantRouter;
