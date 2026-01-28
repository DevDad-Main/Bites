import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controllers.js";
import { validate } from "../middleware/validation.middleware.js";
import { RestaurantPostSchema } from "../schemas/restaurant.schema.js";
import { checkRestaurantExists } from "@/middleware/checkRestaurantId.middleware.js";
import { ReviewPostSchema, type Review } from "../schemas/cuisine.schema.js";

const restaurantRouter: Router = Router();

restaurantRouter.post(
	"/create",
	validate(RestaurantPostSchema),
	restaurantController.createRestaurantData,
);

restaurantRouter.post(
	"/create/:restaurantId/reviews",
	checkRestaurantExists,
	validate(ReviewPostSchema),
	restaurantController.createRestaurantReview,
);

restaurantRouter.get(
	"/fetch/:restaurantId",
	checkRestaurantExists,
	restaurantController.fetchRestaurantData,
);

restaurantRouter.get("/fetch/:restaurantId/reviews", checkRestaurantExists, restaurantController.fetchRestaurantReviews
)

export default restaurantRouter;
