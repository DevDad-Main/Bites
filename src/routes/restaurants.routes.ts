import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controllers.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  RestaurantPostSchema,
  RestaurantDetails,
  RestaurantDetailsSchema,
} from "../schemas/restaurant.schema.js";
import { checkRestaurantExists } from "@/middleware/checkRestaurantId.middleware.js";
import { ReviewPostSchema } from "../schemas/cuisine.schema.js";

const restaurantRouter: Router = Router();

restaurantRouter.get(
  "/fetch/restaurant-ratings",
  restaurantController.fetchRestaurantRatings,
);

restaurantRouter.get(
  "/fetch/:restaurantId/weather",
  restaurantController.fetchWeatherForARestaurant,
);

restaurantRouter.get(
  "/fetch/:restaurantId",
  checkRestaurantExists,
  restaurantController.fetchRestaurantData,
);

restaurantRouter.get(
  "/fetch/:restaurantId/reviews",
  checkRestaurantExists,
  restaurantController.fetchRestaurantReviews,
);

restaurantRouter.get(
  "/fetch/:restaurantId/details",
  checkRestaurantExists,
  restaurantController.fetchRestaurantDetails,
);

restaurantRouter.get("/search", restaurantController.searchForRestaurants);

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

restaurantRouter.delete(
  "/delete/:restaurantId/reviews/:reviewId",
  checkRestaurantExists,
  restaurantController.deleteRestaurantReview,
);

restaurantRouter.post(
  "/create/:restaurantId/details",
  checkRestaurantExists,
  validate(RestaurantDetailsSchema),
  restaurantController.createRestaurantDetails,
);

export default restaurantRouter;
