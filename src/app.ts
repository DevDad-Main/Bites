import express from "express";
import restaurantsRoutes from "./routes/restaurants.routes.js";
import cuisinesRoutes from "./routes/cuisine.routes.js";
import { errorHandler } from "devdad-express-utils";

//#region Constants
const app = express();
const VERSION = process.env.VERSION || "v1";
//#endregion

//#region Middleware
app.use(express.json());
//#endregion

//#region Endpoints
app.use(`/api/${VERSION}/restaurants`, restaurantsRoutes);
app.use(`/api/${VERSION}/cuisines`, cuisinesRoutes);
//#endregion

//#region Error Handler Middleware
app.use(errorHandler);
//#endregion

export default app;
