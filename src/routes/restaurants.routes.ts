import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controllers.js";
import { validate } from "../middleware/validation.middleware.js";
import { RestaurantPostSchema } from "../schemas/restaurant.schema.js";
import { checkRestaurantExists } from "@/middleware/checkRestaurantId.middleware.js";

const restaurantRouter: Router = Router();

restaurantRouter.post(
	"/create",
	validate(RestaurantPostSchema),
	restaurantController.create,
);

restaurantRouter.get("/fetch/:restaurantId", checkRestaurantExists, restaurantController.fetch);

export default restaurantRouter;
