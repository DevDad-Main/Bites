import { Router } from "express";
import { cuisineController } from "../controllers/cuisine.controller.js";

const cuisineRouter = Router();

cuisineRouter.get("/fetch", cuisineController.fetchAllCuisines);
cuisineRouter.get(
  "/fetch/:cuisine",
  cuisineController.fetchAllRestaurantsByCuisine,
);

export default cuisineRouter;
