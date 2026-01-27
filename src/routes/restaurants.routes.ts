import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controllers.js";

const restaurantRouter = Router();

restaurantRouter.get("/fetch", restaurantController.fetch);

export default restaurantRouter;
