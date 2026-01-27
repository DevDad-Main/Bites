import { Router } from "express";
import { cuisineController } from "../controllers/cuisine.controller.js";

const cuisineRouter = Router();

cuisineRouter.get("/fetch", cuisineController.fetch);

export default cuisineRouter;
